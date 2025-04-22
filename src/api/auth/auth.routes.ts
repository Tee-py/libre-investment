import { Router } from "express";
import { AuthController } from "./auth.controller";

const router = Router();

router.post("/nonce", AuthController.getNonce);
router.post("/login", AuthController.login);

export default router;
