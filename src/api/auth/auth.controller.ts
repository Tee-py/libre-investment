import { Response } from "express";
import { AuthService } from "./auth.service";
import {
  getNonceSchema,
  loginSchema,
  GetNonceRequest,
  LoginRequest,
} from "./auth.schema";
import { validate } from "../middlewares/validate";

export class AuthController {
  static getNonce = [
    validate(getNonceSchema),
    async (req: GetNonceRequest, res: Response) => {
      const { address } = req.body;
      const nonce = await AuthService.getNonce(address);
      res.json({ nonce });
    },
  ];

  static login = [
    validate(loginSchema),
    async (req: LoginRequest, res: Response) => {
      const { message, signature } = req.body;
      const { address, chainId } = await AuthService.verifySignature(
        message,
        signature
      );
      const token = AuthService.generateToken(address, chainId);
      res.json({ token });
    },
  ];
}
