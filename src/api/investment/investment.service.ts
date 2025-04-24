import { APIError } from "../../utils/errors";
import { prisma } from "../../utils/db";
import {
  createInvestTransactionData,
  createRedeemTransactionData,
  getBalanceOf,
  getFundMetrics,
  submitTransaction,
} from "../../utils/contract";
import { getRpcProvider } from "../../utils/provider";
import { ethers } from "ethers";

const BALANCE_EXPIRY = 5 * 60; // 5 minute TTL for investor fund balance cache
const METRICS_EXPIRY = 1 * 60; // 1 minute TTL for fund metrics cache

enum TransactionStatus {
  PENDING = "Pending",
  SUCCESS = "Success",
  FAILED = "Failed",
}

export class InvestmentService {
  static getInvestTransaction = async (
    investor: string,
    amount: number,
    fund: string,
    chainId: number,
  ) => {
    const fundToken = await prisma.fundToken.findUnique({
      where: { address: fund, chainId: chainId },
    });
    if (!fundToken)
      throw new APIError(
        `FundToken with address ${fund} and chain ${chainId} not found`,
      );
    const provider = getRpcProvider(chainId);
    const data = createInvestTransactionData(investor, amount);
    return {
      from: investor,
      to: fundToken.address,
      nonce: await provider.getTransactionCount(investor),
      gasLimit: ethers.utils.hexlify(500000),
      gasPrice: 200000000,
      chainId,
      data,
      value: "0x0",
    };
  };

  static getRedeemTransaction = async (
    investor: string,
    shares: number,
    fund: string,
    chainId: number,
  ) => {
    const fundToken = await prisma.fundToken.findUnique({
      where: { address: fund, chainId: chainId },
    });
    if (!fundToken)
      throw new APIError(
        `FundToken with address ${fund} and chain ${chainId} not found`,
      );
    const provider = getRpcProvider(chainId);
    const data = createRedeemTransactionData(investor, shares);
    return {
      from: investor,
      to: fundToken.address,
      nonce: await provider.getTransactionCount(investor),
      gasLimit: ethers.utils.hexlify(500000),
      gasPrice: 200000000,
      chainId,
      data,
      value: "0x0",
    };
  };

  static verifyAndPublishTransaction = async (
    fundAddress: string,
    txType: string,
    investor: string,
    signedTx: string,
    chainId: number,
  ) => {
    const fundToken = await prisma.fundToken.findUnique({
      where: { address: fundAddress, chainId: chainId },
    });
    if (!fundToken)
      throw new APIError(
        `FundToken with address ${fundAddress} and chain ${chainId} not found`,
      );
    const parsedTx = ethers.utils.parseTransaction(signedTx);

    if (parsedTx.chainId !== chainId) {
      throw new APIError(
        `Invalid transaction. Expected chainId: ${chainId} found chainId: ${chainId}`,
      );
    }

    if (parsedTx.from?.toLowerCase() !== investor.toLowerCase()) {
      throw new APIError("Signer does not match expected sender");
    }

    if (parsedTx.to?.toLowerCase() !== fundAddress.toLowerCase()) {
      throw new APIError(
        "Transaction `to` does not match specified fundAddress",
      );
    }
    const provider = getRpcProvider(chainId);
    const txHash = await submitTransaction(signedTx, provider);
    await prisma.transaction.create({
      data: {
        investor: investor,
        type: txType,
        status: TransactionStatus.PENDING,
        fund: fundAddress,
        chainId: chainId.toString(),
        hash: txHash,
        amount: 0,
      },
    });
    return txHash;
  };

  static getFundBalance = async (
    investor: string,
    fund: string,
    chainId: number,
  ) => {
    const fundToken = await prisma.fundToken.findUnique({
      where: { address: fund, chainId: chainId },
    });
    if (!fundToken)
      throw new APIError(
        `FundToken with address ${fund} and chain ${chainId} not found`,
      );
    const provider = getRpcProvider(chainId);
    const balance = await getBalanceOf(fund, investor, provider, {
      ttl: BALANCE_EXPIRY,
      key: `balance-${fund}-${investor}-${chainId}`,
    });
    return {
      balance,
    };
  };

  static getFundStats = async (fund: string) => {
    const fundToken = await prisma.fundToken.findUnique({
      where: { address: fund },
    });
    if (!fundToken)
      throw new APIError(`FundToken with address ${fund} not found`);
    const provider = getRpcProvider(fundToken.chainId);
    const stats = await getFundMetrics(fund, provider, {
      ttl: METRICS_EXPIRY,
      key: `metrics-${fund}--${fundToken.chainId}`,
    });
    return stats;
  };
}
