// For simplicity, Indexer only supports once fund token and one chain
// Could be re-implemented to support multiple chains & investments
export const INDEXER_CONFIG = {
  intervalMs: 60 * 1000, // 1 minute
  redisKey: "indexer:lastBlock",
  contractAddress: "0xcDF53d6fbd1d92FB623765D863eDB1604D77E636".toLowerCase(),
  chainId: 84532,
};
