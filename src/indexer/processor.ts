import { INDEXER_CONFIG } from "./config";
import { prisma } from "../utils/db";
import { logger } from "../utils/logger";
import redisClient from "../utils/redis";
import { ethers } from "ethers";
import { parseLogs } from "./parser";

export async function processTransactions(
  provider: ethers.providers.JsonRpcProvider,
) {
  const lastRun = await redisClient.get(INDEXER_CONFIG.redisKey);
  const fromBlock = lastRun
    ? await getBlockFromTimestamp(provider, parseInt(lastRun))
    : (await provider.getBlockNumber()) - 200;
  const toBlock = await provider.getBlockNumber();

  logger.info(
    `Fetching transactions from block ${fromBlock} to ${toBlock} for ${INDEXER_CONFIG.contractAddress}`,
  );

  const filter = {
    address: INDEXER_CONFIG.contractAddress,
    fromBlock,
    toBlock,
  };

  const logs = await provider.getLogs(filter);
  logger.info(`Fetched ${logs.length} logs`);

  for (const log of logs) {
    logger.info(`Processing tx: ${log.transactionHash}`);
    const parsed = parseLogs(log);
    if (!parsed) continue;

    const txHash = log.transactionHash;
    const fundAddress = log.address.toLowerCase();
    const chainId = INDEXER_CONFIG.chainId;

    try {
      if (parsed.type === "Investment") {
        const { investor, usdAmount, sharesIssued, sharePrice } = parsed.args;

        // Update matching transaction
        await prisma.transaction.update({
          where: { hash: txHash },
          data: {
            status: "SUCCESS",
            amount: usdAmount,
          },
        });

        // Store Investment event
        await prisma.investmentEvent.create({
          data: {
            investor,
            usdAmount,
            sharesIssued,
            sharePrice,
            txHash,
            fundAddress,
            chainId: chainId.toString(),
          },
        });
      }

      if (parsed.type === "Redemption") {
        const { investor, shares, usdAmount, sharePrice } = parsed.args;

        await prisma.transaction.update({
          where: { hash: txHash },
          data: {
            status: "SUCCESS",
            amount: usdAmount,
          },
        });

        await prisma.redemptionEvent.create({
          data: {
            investor,
            shares,
            usdAmount,
            sharePrice,
            txHash,
            fundAddress,
            chainId: chainId.toString(),
          },
        });
      }

      if (parsed.type === "MetricsUpdated") {
        const { totalAssetValue, sharesSupply, sharePrice } = parsed.args;

        await prisma.metricsUpdatedEvent.create({
          data: {
            totalAssetValue,
            sharesSupply,
            sharePrice,
            txHash,
            fundAddress,
            chainId: chainId.toString(),
          },
        });

        // Cache metrics in Redis
        const cacheKey = `metrics-${fundAddress}-${chainId}`;
        await redisClient.set(
          cacheKey,
          JSON.stringify({
            totalAssetValue,
            sharesSupply,
            sharePrice,
            updatedAt: Date.now(),
          }),
        );
      }
    } catch (error) {
      // Possible additions: save failed logs to a queue for re-processing up to 3 times before discarding  
      logger.error(`Failed to handle log ${txHash}`, error);
    }
  }

  // Store last timestamp
  const now = Math.floor(Date.now() / 1000);
  await redisClient.set(INDEXER_CONFIG.redisKey, now.toString());
}

async function getBlockFromTimestamp(
  provider: ethers.providers.JsonRpcProvider,
  timestamp: number,
): Promise<number> {
  let latest = await provider.getBlock("latest");
  let low = latest.number - 2000;
  let high = latest.number;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const block = await provider.getBlock(mid);
    if (block.timestamp === timestamp) return mid;
    if (block.timestamp < timestamp) low = mid + 1;
    else high = mid - 1;
  }

  return low;
}
