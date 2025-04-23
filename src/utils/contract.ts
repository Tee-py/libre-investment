import { ethers } from "ethers";
import { FundTokenABI, MULTICALL_ABI } from "./abi";
import { RPCError, withRpcErrorHandler } from "./errors";
import { logger } from "./logger";

const TOKEN_INTERFACE = new ethers.utils.Interface(FundTokenABI);
const MULTICALL_ADDRESS = "0xcA11bde05977b3631167028862bE2a173976CA11";

export const createInvestTransactionData = (
  investor: string,
  usdAmount: number,
) => {
  const usdAmountWithDecimals = ethers.utils.parseUnits(
    usdAmount.toString(),
    6,
  );
  return TOKEN_INTERFACE.encodeFunctionData("invest", [
    investor,
    usdAmountWithDecimals,
  ]);
};

export const createRedeemTransactionData = (
  investor: string,
  shares: number,
): string => {
  const sharesWithDecimals = ethers.utils.parseUnits(
    shares.toString(),
    18, // default decimals of ERC20 tokens
  );
  return TOKEN_INTERFACE.encodeFunctionData("redeem", [
    investor,
    sharesWithDecimals,
  ]);
};

export const getBalanceOf = withRpcErrorHandler(
  async (
    fundAddress: string,
    investor: string,
    provider: ethers.providers.JsonRpcProvider,
  ) => {
    const contract = new ethers.Contract(fundAddress, FundTokenABI, provider);
    const balance = await contract.balanceOf(investor);
    return balance.toString();
  },
);

export const getFundMetrics = withRpcErrorHandler(
  async (fundAddress: string, provider: ethers.providers.JsonRpcProvider) => {
    const encodedFundMetrics =
      TOKEN_INTERFACE.encodeFunctionData("getFundMetrics");
    const encodedSharePrice =
      TOKEN_INTERFACE.encodeFunctionData("getSharePrice");
    const calls = [
      {
        target: fundAddress,
        allowFailure: false,
        callData: encodedFundMetrics,
      },
      { target: fundAddress, allowFailure: false, callData: encodedSharePrice },
    ];
    const multicall = new ethers.Contract(
      MULTICALL_ADDRESS,
      MULTICALL_ABI,
      provider,
    );
    const results = await multicall.callStatic.aggregate3(calls);

    return results;
  },
);

function isRetryableError(error: any): boolean {
  const message = error.message?.toLowerCase() || "";
  const code = error.code;

  return (
    code === "NETWORK_ERROR" ||
    code === "TIMEOUT" ||
    code === "SERVER_ERROR" ||
    message.includes("nonce too low") ||
    message.includes("replacement transaction underpriced") ||
    message.includes("failed to check for transaction receipt") ||
    message.includes("transaction was not mined within")
  );
}

export const submitTransaction = withRpcErrorHandler(
  async (
    signedTx: string,
    provider: ethers.providers.JsonRpcProvider,
    maxRetries = 3,
  ) => {
    let lastErr: any;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const txResponse = await provider.sendTransaction(signedTx);
        const receipt = await txResponse.wait();

        if (receipt.status === 1) {
          return {
            success: false,
            message: "Transaction Failed",
            hash: receipt.transactionHash,
          };
        }
        return {
          success: true,
          message: "Transaction success",
          hash: receipt.transactionHash,
        };
      } catch (error: any) {
        if (!isRetryableError(error)) {
          throw error;
        }
        lastErr = error;
        if (attempt < maxRetries - 1) {
          logger.warn(
            `Error occurred while submitting tx: ${signedTx}!!.. Retrying... (attempt ${attempt + 1})`,
          );
          await new Promise((res) => setTimeout(res, 1000 * (attempt + 1)));
        }
      }
    }
    throw new RPCError(
      `Transaction failed after ${maxRetries} retries: ${lastErr.message}`,
      { stack: lastErr.stack, code: lastErr.code },
    );
  },
);
