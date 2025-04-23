// INVESTMENT SERVICE
// POST /invest { amount: <xxx>, fund: <yyy> }
// POST /redeem { fund: <yyy> }
// POST /publishTx { type: invest | redeem, signedMessage: <yyy> }

import { APIError, RPCError } from "../../utils/errors";
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
    const data = createInvestTransactionData(investor, amount);
    return {
      from: investor,
      to: fundToken.address,
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
    const data = createRedeemTransactionData(investor, shares);
    return {
      from: investor,
      to: fundToken.address,
      data,
      value: "0x0",
    };
  };

  static verifyAndPublishTransaction = async (
    fundAddress: string,
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
    const result = await submitTransaction(signedTx, provider);
    return result;
  };

  static getFundBalance = async (
    investor: string,
    fund: string,
    chainId: number,
  ) => {
    // Implement a cache with redis to prevent frequent rpc calls
    const fundToken = await prisma.fundToken.findUnique({
      where: { address: fund, chainId: chainId },
    });
    if (!fundToken)
      throw new APIError(
        `FundToken with address ${fund} and chain ${chainId} not found`,
      );
    const provider = getRpcProvider(chainId);
    const balance = await getBalanceOf(fund, investor, provider);
    return {
      balance,
    };
  };

  static getFundStats = async (fund: string) => {
    // Also implement a cache here with redis to prevent frequent rpc calls
    const fundToken = await prisma.fundToken.findUnique({
      where: { address: fund },
    });
    if (!fundToken)
      throw new APIError(`FundToken with address ${fund} not found`);
    const provider = getRpcProvider(fundToken.chainId);
    const stats = await getFundMetrics(fund, provider);
    return stats;
  };
}
