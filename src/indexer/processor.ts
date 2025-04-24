import { INDEXER_CONFIG } from "./config";
import { prisma } from "../utils/db";
import { logger } from "../utils/logger";
import redisClient from "../utils/redis";
import { ethers } from "ethers";
import { parseLogs } from "./parser";

export async function processLog(log: ethers.providers.Log) {
  logger.info(`Processing log with index: ${log.logIndex}`);
  const parsed = parseLogs(log);
  if (!parsed) return;

  const txHash = log.transactionHash;
  const fundAddress = log.address.toLowerCase();
  const chainId = INDEXER_CONFIG.chainId;

  try {
    if (parsed.type === "Investment") {
      logger.info("💸 Found Invest Log");
      const { investor, usdAmount, sharesIssued, sharePrice } = parsed.args;

      // Check if event already exists
      const existingEvent = await prisma.investmentEvent.findUnique({
        where: {
          txHash: txHash.toLowerCase(),
        },
      });

      if (!existingEvent) {
        await Promise.all([
          prisma.transaction.update({
            where: { hash: txHash.toLowerCase() },
            data: {
              status: "Success",
              amount: usdAmount,
            },
          }),
          prisma.investmentEvent.create({
            data: {
              investor,
              usdAmount,
              sharesIssued,
              sharePrice,
              txHash: txHash.toLowerCase(),
              fundAddress,
              chainId: chainId.toString(),
            },
          }),
        ]);
      } else {
        logger.info(`Skipping duplicate investment event for tx: ${txHash}`);
      }
    }

    if (parsed.type === "Redemption") {
      logger.info("💸 Found Redeem Log");
      const { investor, shares, usdAmount, sharePrice } = parsed.args;

      // Check if event already exists
      const existingEvent = await prisma.redemptionEvent.findUnique({
        where: {
          txHash: txHash.toLowerCase(),
        },
      });

      if (!existingEvent) {
        await Promise.all([
          prisma.transaction.update({
            where: { hash: txHash.toLowerCase() },
            data: {
              status: "Success",
              amount: usdAmount,
            },
          }),
          prisma.redemptionEvent.create({
            data: {
              investor,
              shares,
              usdAmount,
              sharePrice,
              txHash: txHash.toLowerCase(),
              fundAddress,
              chainId: chainId.toString(),
            },
          }),
        ]);
      } else {
        logger.info(`Skipping duplicate redemption event for tx: ${txHash}`);
      }
    }

    if (parsed.type === "MetricsUpdated") {
      const { totalAssetValue, sharesSupply, sharePrice } = parsed.args;

      // Check if event already exists
      const existingEvent = await prisma.metricsUpdatedEvent.findUnique({
        where: {
          txHash: txHash.toLowerCase(),
        },
      });
      if (existingEvent) {
        return
      }

      // Update fund metrics cache and create store event in the database
      const cacheKey = `metrics-${fundAddress}-${chainId}`;
      await Promise.all([
        prisma.metricsUpdatedEvent.create({
          data: {
            totalAssetValue,
            sharesSupply,
            sharePrice,
            txHash: txHash.toLowerCase(),
            fundAddress,
            chainId: chainId.toString(),
          },
        }),
        redisClient.set(
          cacheKey,
          JSON.stringify({
            totalAssetValue,
            sharesSupply,
            sharePrice,
            updatedAt: Date.now(),
          }),
        ),
      ]);
    }
  } catch (error) {
    // Possible additions: save failed logs to a queue for re-processing up to 3 times before discarding
    logger.error(`Failed to handle log ${txHash}`, error);
  }
}

export async function processTransactions(
  provider: ethers.providers.JsonRpcProvider,
) {
  const lastBlock = await redisClient.get(INDEXER_CONFIG.redisKey);
  const fromBlock = lastBlock || ((await provider.getBlockNumber()) - 5000);
  const toBlock = await provider.getBlockNumber();

  logger.info(
    `Fetching transactions from block ${fromBlock} to ${toBlock} for ${INDEXER_CONFIG.contractAddress}`,
  );

  const filter = {
    address: INDEXER_CONFIG.contractAddress,
    fromBlock: Number(fromBlock),
    toBlock,
  };

  const logs = await provider.getLogs(filter);
  logger.info(`Fetched ${logs.length} logs`);

  await Promise.all(
    logs.map((log) => processLog(log)),
  );

  await redisClient.set(INDEXER_CONFIG.redisKey, toBlock);
}
