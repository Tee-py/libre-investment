import { ethers } from 'ethers';
import { FundTokenABI, MULTICALL_ABI } from './abi';

const TOKEN_INTERFACE = new ethers.utils.Interface(FundTokenABI)
const MULTICALL_ADDRESS = '0xcA11bde05977b3631167028862bE2a173976CA11'

export const createInvestTransactionData = (investor: string, usdAmount: number) => {
  const usdAmountWithDecimals = ethers.utils.parseUnits(usdAmount.toString(), 6)
  return TOKEN_INTERFACE.encodeFunctionData('invest', [investor, usdAmountWithDecimals])
}

export const createRedeemTransactionData = (
  investor: string,
  shares: number
): string => {
  const sharesWithDecimals = ethers.utils.parseUnits(
    shares.toString(),
    18 // default decimals of ERC20 tokens
  );
  return TOKEN_INTERFACE.encodeFunctionData('redeem', [
    investor,
    sharesWithDecimals
  ]);
};

export const getBalanceOf = async (fundAddress: string, investor: string, provider: ethers.providers.JsonRpcProvider) => {
  const contract = new ethers.Contract(fundAddress, FundTokenABI, provider)
  const balance = contract.balanceOf(investor)
  return balance.toString()
}

// maybe implement batch rpc calls to fetch the fund metrics and share price together
export const getFundMetrics = async (fundAddress: string, provider: ethers.providers.JsonRpcProvider) => {
  const encodedFundMetrics = TOKEN_INTERFACE.encodeFunctionData("getFundMetrics")
  const encodedSharePrice = TOKEN_INTERFACE.encodeFunctionData("getSharePrice")
  const calls = [{
    target: fundAddress,
    callData: encodedFundMetrics,
    allowFailure: true
  }, {
    target: fundAddress,
    callData: encodedSharePrice,
    allowFailure: true
  }]
  const multicall = new ethers.Contract(MULTICALL_ADDRESS, MULTICALL_ABI, provider)
  const results = await multicall.aggregate3.staticCall(calls)
  return results
}
