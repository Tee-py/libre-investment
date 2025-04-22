import { Router } from "express";
import { AuthController } from "./auth.controller";

const authRouter = Router();

authRouter.post("/nonce", AuthController.getNonce);
authRouter.post("/login", AuthController.login);

export default authRouter;
