import { Router } from "express";
import { InvestmentController } from "./investment.controller";

const router = Router();

router.post("/transaction/invest", InvestmentController.getInvestTransaction);
router.post("/transaction/redeem", InvestmentController.getRedeemTransaction);
router.post("/transaction/publish", InvestmentController.publishTransaction);
router.get("/:fund/balance", InvestmentController.getInvestorBalance);
router.get("/:fund/metrics", InvestmentController.getFundMetrics);

export default router;
