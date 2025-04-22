import { ethers } from 'ethers';
import { FundTokenABI } from './abi';

const TOKEN_INTERFACE = new ethers.utils.Interface(FundTokenABI)

export const createInvestTransactionData = (investor: string, usdAmount: number, decimals: number) => {
  const usdAmountWithDecimals = ethers.utils.parseUnits(usdAmount.toString(), decimals)
  return TOKEN_INTERFACE.encodeFunctionData('invest', [investor, usdAmountWithDecimals])
}

export const createRedeemTransactionData = (
  investor: string,
  shares: number,
  decimals: number
): string => {
  const sharesWithDecimals = ethers.utils.parseUnits(
    shares.toString(),
    decimals
  );
  return TOKEN_INTERFACE.encodeFunctionData('redeem', [
    investor,
    sharesWithDecimals
  ]);
};
