import { Router } from "express";
import { AuthController } from "./auth.controller";

const authRouter = Router();

authRouter.get("/nonce", AuthController.getNonce);
authRouter.post("/login", AuthController.login);

export default authRouter;
