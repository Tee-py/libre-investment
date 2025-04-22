import { Request, Response } from "express";
import { InvestmentService } from "./investment.service";
import {
  getInvestTransactionSchema,
  GetInvestTransactionRequest,
  getRedeemTransactionSchema,
  GetRedeemTransactionRequest
} from "./investment.schema";
import { validate } from "../middlewares/validate";

export class InvestmentController {
  static getInvestTransaction = [
    validate(getInvestTransactionSchema),
    async (req: Request & GetInvestTransactionRequest, res: Response) => {
      const { fund, usdAmount } = req.body;
      const user = req.user!
      const data = await InvestmentService.getInvestTransaction(user.address, usdAmount, fund, user.chainId)
      res.json(data);
    },
  ];

  static getRedeemTransaction = [
    validate(getRedeemTransactionSchema),
    async (req: Request & GetRedeemTransactionRequest, res: Response) => {
      const { fund, share } = req.body;
      const user = req.user!
      const data = await InvestmentService.getRedeemTransaction(user.address, share, fund, user.chainId)
      res.json(data);
    },
  ];
}
