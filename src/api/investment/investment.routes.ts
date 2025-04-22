import { Router } from "express";
import { InvestmentController } from "./investment.controller";

const router = Router();

router.post("/transaction/invest", InvestmentController.getInvestTransaction);
router.post("/transaction/redeem", InvestmentController.getRedeemTransaction);

export default router;