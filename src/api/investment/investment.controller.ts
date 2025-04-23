import { Request, Response } from "express";
import { InvestmentService } from "./investment.service";
import {
  getInvestTransactionSchema,
  GetInvestTransactionRequest,
  getRedeemTransactionSchema,
  GetRedeemTransactionRequest,
  publishTransactionSchema,
  PublishTransactionRequest,
} from "./investment.schema";
import { validate } from "../middlewares/validate";

export class InvestmentController {
  static getInvestTransaction = [
    validate(getInvestTransactionSchema),
    async (req: Request & GetInvestTransactionRequest, res: Response) => {
      const { fund, usdAmount } = req.body;
      const user = req.user!;
      const data = await InvestmentService.getInvestTransaction(
        user.address,
        usdAmount,
        fund,
        user.chainId,
      );
      res.json(data);
    },
  ];

  static getRedeemTransaction = [
    validate(getRedeemTransactionSchema),
    async (req: Request & GetRedeemTransactionRequest, res: Response) => {
      const { fund, share } = req.body;
      const user = req.user!;
      const data = await InvestmentService.getRedeemTransaction(
        user.address,
        share,
        fund,
        user.chainId,
      );
      res.json(data);
    },
  ];

  static publishTransaction = [
    validate(publishTransactionSchema),
    async (req: Request & PublishTransactionRequest, res: Response) => {
      const { type, signedTransaction, fund } = req.body;
      const user = req.user!;
      const result = await InvestmentService.verifyAndPublishTransaction(
        fund,
        user.address,
        signedTransaction,
        user.chainId,
      );
      res.json(result);
    },
  ];

  static getInvestorBalance = [
    async (req: Request, res: Response) => {
      const investor = req.user?.address!;
      const chainId = req.user?.chainId!;
      const { fund } = req.params;
      const result = await InvestmentService.getFundBalance(
        investor,
        fund,
        chainId,
      );
      res.json(result);
    },
  ];

  static getFundMetrics = [
    async (req: Request, res: Response) => {
      const { fund } = req.params;
      const result = await InvestmentService.getFundStats(fund);
      res.json(result);
    },
  ];
}
