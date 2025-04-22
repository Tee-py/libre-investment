import { generateNonce, SiweMessage } from "siwe";
import jwt from "jsonwebtoken";
import redisClient from "../../utils/redis";
import { env } from "../config";
import { AuthenticationError, RedisError } from "../../utils/apiErrors";

const NONCE_EXPIRY = 5 * 60; // 5 minutes

export class AuthService {
  static async getNonce(address: string): Promise<string> {
    const nonce = generateNonce();
    const key = `nonce:${address}`;

    try {
      await redisClient.set(key, nonce, {
        EX: NONCE_EXPIRY,
      });
    } catch (error: any) {
      const err = new RedisError(error.message)
      err.stack = error.stack
      throw err
    }

    return nonce;
  }

  private static async verifyNonce(
    address: string,
    nonce: string,
  ): Promise<boolean> {
    try {
      const key = `nonce:${address}`;
      const storedNonce = await redisClient.get(key);
      if (!storedNonce) {
        return false;
      }
      await redisClient.del(key);
      return storedNonce === nonce;
    } catch (error: any) {
      const err = new RedisError(error.message)
      err.stack = error.stack
      throw err 
    }
  }

  static async verifySignature(
    message: string,
    signature: string,
  ): Promise<{ address: string; chainId: number }> {
    try {
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
    } catch (error: any) {
      if (error instanceof RedisError) throw error
      const err = new AuthenticationError(error.message)
      err.stack = error.stack
      throw err
    }
  }

  static generateToken(address: string, chainId: number): string {
    return jwt.sign({ address, chainId }, env.JWT_SECRET, { expiresIn: "24h" });
  }
}
