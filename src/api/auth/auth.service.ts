import { generateNonce, SiweMessage } from "siwe";
import jwt from "jsonwebtoken";
import redisClient from "../../utils/redis";
import { env } from "../config";
import { AuthenticationError } from "utils/apiErrors";

const NONCE_EXPIRY = 5 * 60; // 5 minutes

export class AuthService {
  static async getNonce(address: string): Promise<string> {
    const nonce = generateNonce();
    const key = `nonce:${address}`;

    await redisClient.set(key, nonce, {
      EX: NONCE_EXPIRY,
    });

    return nonce;
  }

  private static async verifyNonce(
    address: string,
    nonce: string,
  ): Promise<boolean> {
    const key = `nonce:${address}`;
    const storedNonce = await redisClient.get(key);
    if (!storedNonce) {
      return false;
    }
    await redisClient.del(key);
    return storedNonce === nonce;
  }

  static async verifySignature(
    message: string,
    signature: string,
  ): Promise<{ address: string; chainId: number }> {
    const siweMessage = new SiweMessage(message);
    const fields = await siweMessage.verify({ signature });
    if (!fields.success) {
      throw new AuthenticationError(
        fields.error?.type.toString() || "Error verifying signature",
      );
    }
    const nonceValid = await this.verifyNonce(
      fields.data.address,
      fields.data.nonce,
    );
    if (!nonceValid) {
      throw new AuthenticationError("Invalid nonce");
    }
    return { address: fields.data.address, chainId: fields.data.chainId };
  }

  static generateToken(address: string, chainId: number): string {
    return jwt.sign({ address, chainId }, env.JWT_SECRET, { expiresIn: "24h" });
  }
}
