import { ethers } from 'ethers';
import { FundTokenABI } from './abi';

const TOKEN_INTERFACE = new ethers.utils.Interface(FundTokenABI)

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
