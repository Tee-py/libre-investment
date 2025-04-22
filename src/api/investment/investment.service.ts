// INVESTMENT SERVICE
// POST /invest { amount: <xxx>, fund: <yyy> }
// POST /redeem { fund: <yyy> }
// POST /publishTx { type: invest | redeem, signedMessage: <yyy> }

import { APIError } from "../../utils/errors"
import { prisma } from "../../utils/db"
import { createInvestTransactionData, createRedeemTransactionData } from "../../utils/contract"

export class InvestmentService {
    static getInvestTransaction = async (investor: string, amount: number, fund: string, chainId: number) => {
        // checks if the fund exists
        const fundToken = await prisma.fundToken.findUnique({
            where: { address: fund, chainId: chainId }
        })
        if (!fundToken) throw new APIError(`FundToken with address ${fund} and chain ${chainId} not found`)
        const data = createInvestTransactionData(investor, amount)
        return {
            from: investor,
            to: fundToken.address,
            data,
            value: "0x0"
        }
    }
    static getRedeemTransaction = async (investor: string, shares: number, fund: string, chainId: number) => {
        // checks if the fund exists
        const fundToken = await prisma.fundToken.findUnique({
            where: { address: fund, chainId: chainId }
        })
        if (!fundToken) throw new APIError(`FundToken with address ${fund} and chain ${chainId} not found`)
        const data = createRedeemTransactionData(investor, shares)
        return {
            from: investor,
            to: fundToken.address,
            data,
            value: "0x0"
        }
    }
}