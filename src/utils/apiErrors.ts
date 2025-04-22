export class ValidationError extends Error {
  constructor(
    message: string,
    public details?: Array<{ path: string; message: string }>,
  ) {
    super(message);
    this.name = "ValidationError";
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
