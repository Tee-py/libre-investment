import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { logger } from "../../utils/logger";
import {
  ValidationError,
  AuthenticationError,
  NotFoundError,
  APIError,
  RPCError,
  ContractError,
} from "../../utils/errors";

const errorHandler: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  logger.error(
    `Error Occurred:
    Method: ${req.method}
    URL: ${req.originalUrl}
    ErrorType: ${err.name}
    Message: ${err.message}
    Details: ${JSON.stringify(err.details, null, 2)}
    Stack: ${err.stack}
    Headers: ${JSON.stringify(req.headers, null, 2)}
    Body: ${JSON.stringify(req.body, null, 2)}
    Query: ${JSON.stringify(req.query, null, 2)}
    Params: ${JSON.stringify(req.params, null, 2)}
    IP: ${req.ip}
    User Agent: ${req.get("user-agent")}
    Timestamp: ${new Date().toISOString()}`,
  );

  if (err instanceof ValidationError) {
    res.status(400).json({
      error: "Validation Error",
      message: err.message,
      data: err.details,
    });
    return;
  }

  if (err instanceof APIError) {
    res.status(400).json({
      error: "API Error",
      message: err.message,
    });
    return;
  }

  if (err instanceof ContractError) {
    let message = "";
    if (err.details.message.includes("insufficient funds")) {
      message = "Insufficient funds for transaction";
    } else {
      message = `Error during contract call: ${err.details.body?.error?.message || err.message}`;
    }
    res.status(400).json({
      error: "Contract Error",
      message,
    });
    return;
  }

  if (err instanceof RPCError) {
    res.status(400).json({
      error: "RPC Error",
      message: `An Error occurred: ${err.details.body?.error?.message || err.message}`,
    });
    return;
  }

  if (err instanceof AuthenticationError) {
    res.status(401).json({
      error: "Authentication Error",
      message: err.message,
    });
    return;
  }

  if (err instanceof NotFoundError) {
    res.status(404).json({
      error: "Not Found",
      message: err.message,
    });
    return;
  }

  if (err.message?.includes("CORS")) {
    res.status(403).json({
      error: "Forbidden",
      message: err.message,
    });
    return;
  }

  res.status(500).json({
    error: "Internal Server Error",
    message: "An unexpected error occurred",
  });
  return;
};
export default errorHandler;
