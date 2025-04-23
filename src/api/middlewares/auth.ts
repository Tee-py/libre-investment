import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthenticationError } from "../../utils/errors";
import { env } from "../config";

declare global {
  namespace Express {
    interface Request {
      user?: {
        address: string;
        chainId: number;
      };
    }
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    throw new AuthenticationError("No token provided");
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      address: string;
      chainId: number;
    };
    req.user = decoded;
    next();
  } catch (error) {
    throw new AuthenticationError("Invalid token");
  }
};
