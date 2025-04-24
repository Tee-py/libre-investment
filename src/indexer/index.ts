import { getRpcProvider } from "../utils/provider";
import { processTransactions } from "./processor";
import { INDEXER_CONFIG } from "./config";
import { logger } from "../utils/logger";

const provider = getRpcProvider(INDEXER_CONFIG.chainId);

async function startIndexer() {
  logger.info("Starting Fund Indexer...");
  await tick();
  setInterval(tick, INDEXER_CONFIG.intervalMs);
}

async function tick() {
  try {
    await processTransactions(provider);
  } catch (err) {
    logger.error("Error during indexer tick", err);
  }
}

startIndexer();
