import rateLimit from "express-rate-limit";

// Default (100 requests per minute)
export const defaultLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests, please try again later.",
});

// Auth Endpoints (5 requests per minute)
export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many authentication attempts, please try again later.",
  skip: (req) => {
    return (
      req.path === "/auth/login" &&
      req.method === "POST" &&
      req.statusCode === 200
    );
  },
});
