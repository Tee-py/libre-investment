import { Router } from "express";
import { InvestmentController } from "./investment.controller";

const router = Router();

router.post("/transactions/invest", InvestmentController.getInvestTransaction);
router.post("/transactions/redeem", InvestmentController.getRedeemTransaction);
router.post("/transactions/publish", InvestmentController.publishTransaction);
router.get("/transactions", InvestmentController.transactionHistory);
router.get("/:fund/balance", InvestmentController.getInvestorBalance);
router.get("/:fund/metrics", InvestmentController.getFundMetrics);

export default router;
