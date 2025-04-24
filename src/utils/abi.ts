export const FundTokenABI = [
  "function invest(address investor, uint256 usdAmount) returns (uint256)",
  "function redeem(address investor, uint256 shares) returns (uint256)",

  "function getFundMetrics() view returns (tuple(uint256 totalAssetValue, uint256 sharesSupply, uint256 lastUpdateTime))",
  "function getSharePrice() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",

  "event Investment(address indexed investor, uint256 usdAmount, uint256 sharesIssued, uint256 sharePrice)",
  "event Redemption(address indexed investor, uint256 shares, uint256 usdAmount, uint256 sharePrice)",
  "event MetricsUpdated(uint256 totalAssetValue, uint256 sharesSupply, uint256 sharePrice)",
];

export const MULTICALL_ABI = [
  "function aggregate(tuple(address target, bytes callData)[] calls) payable returns (uint256 blockNumber, bytes[] returnData)",
  "function aggregate3(tuple(address target, bool allowFailure, bytes callData)[] calls) payable returns (tuple(bool success, bytes returnData)[] returnData)",
  "function aggregate3Value(tuple(address target, bool allowFailure, uint256 value, bytes callData)[] calls) payable returns (tuple(bool success, bytes returnData)[] returnData)",
  "function blockAndAggregate(tuple(address target, bytes callData)[] calls) payable returns (uint256 blockNumber, bytes32 blockHash, tuple(bool success, bytes returnData)[] returnData)",
  "function getBasefee() view returns (uint256 basefee)",
  "function getBlockHash(uint256 blockNumber) view returns (bytes32 blockHash)",
  "function getBlockNumber() view returns (uint256 blockNumber)",
  "function getChainId() view returns (uint256 chainid)",
  "function getCurrentBlockCoinbase() view returns (address coinbase)",
  "function getCurrentBlockDifficulty() view returns (uint256 difficulty)",
  "function getCurrentBlockGasLimit() view returns (uint256 gaslimit)",
  "function getCurrentBlockTimestamp() view returns (uint256 timestamp)",
  "function getEthBalance(address addr) view returns (uint256 balance)",
  "function getLastBlockHash() view returns (bytes32 blockHash)",
  "function tryAggregate(bool requireSuccess, tuple(address target, bytes callData)[] calls) payable returns (tuple(bool success, bytes returnData)[] returnData)",
  "function tryBlockAndAggregate(bool requireSuccess, tuple(address target, bytes callData)[] calls) payable returns (uint256 blockNumber, bytes32 blockHash, tuple(bool success, bytes returnData)[] returnData)",
];
