import express from "express";
import helmet from "helmet";
import { requestLogger } from "./middlewares/requestLogger";
import apiCors from "./middlewares/corsOrigin";
import errorHandler from "./middlewares/errorHandler";
import { authRouter, healthRouter } from "./routes";
import { defaultLimiter, authLimiter } from "./middlewares/rateLimiter";

const app = express();

// Regular middleware
app.use(helmet());
app.use(express.json());
app.use(requestLogger);
app.use(apiCors);
app.use(defaultLimiter);

// Routes
app.use("/api/auth", authLimiter, authRouter);
app.use("/api/health", healthRouter);

// Error handler
app.use(errorHandler);

export default app;
