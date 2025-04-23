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
      if (
        typeof error.message === "string" &&
        error.message.includes("call revert exception")
      ) {
        const err = new RPCError("Execution reverted", {
          message: error.message,
        });
        err.stack = error.stack;
        throw err;
      }
      throw error;
    }
  }) as T;
}
