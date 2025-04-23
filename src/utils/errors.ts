export class ValidationError extends Error {
  constructor(
    message: string,
    public details?: Array<{ path: string; message: string }>,
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

export class APIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "APIError";
  }
}

export class ContractError extends Error {
  constructor(
    message: string,
    public details?: any,
  ) {
    super(message);
    this.name = "Contract Error";
  }
}

export class RPCError extends Error {
  constructor(
    message: string,
    public details?: any,
  ) {
    super(message);
    this.name = "RPCError";
  }
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class RedisError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RedisError";
  }
}

export function withRpcErrorHandler<T extends (...args: any[]) => Promise<any>>(
  fn: T,
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return await fn(...args);
    } catch (error: any) {
      const message = error.message?.toLowerCase() || "";

      // Handle EVM/contract-specific errors
      if (
        message.includes("execution reverted") ||
        message.includes("invalid opcode") ||
        message.includes("gas required exceeds allowance") ||
        error.code === "CALL_EXCEPTION" ||
        error.reason
      ) {
        throw new ContractError("Contract execution error", {
          reason: error.reason,
          code: error.code,
          message: error.message,
        });
      }

      // Handle transport / network-level RPC errors
      if (
        error.code === "NETWORK_ERROR" ||
        error.code === "SERVER_ERROR" ||
        error.code === "ETIMEDOUT" ||
        error.code === "ECONNRESET" ||
        error.code === "ENOTFOUND" ||
        message.includes("service unavailable") ||
        message.includes("connection closed") ||
        message.includes("could not detect network") ||
        message.includes("failed to fetch") ||
        message.includes("ETIMEDOUT") ||
        message.includes("serverError") ||
        message.includes("NETWORK_ERROR")
      ) {
        throw new RPCError("RPC communication error", {
          code: error.code,
          message: error.message,
        });
      }

      // Unknown/unclassified error
      throw error;
    }
  }) as T;
}
