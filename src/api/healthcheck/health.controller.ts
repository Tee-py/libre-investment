import { Request, Response } from "express";
import { prisma } from "../../utils/db";
import redis from "../../utils/redis";
import { logger } from "../../utils/logger";

export const healthCheck = async (_req: Request, res: Response) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: "OK",
    timestamp: Date.now(),
    checks: {
      app: {
        status: "up",
        timestamp: Date.now(),
      },
      database: {
        status: "down",
        timestamp: Date.now(),
      },
      redis: {
        status: "down",
        timestamp: Date.now(),
      },
    },
  };

  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    healthcheck.checks.database.status = "up";
    healthcheck.checks.database.timestamp = Date.now();
  } catch (error) {
    logger.error("Database health check failed:", error);
    healthcheck.checks.database.status = "down";
  }

  try {
    // Check Redis connection
    await redis.ping();
    healthcheck.checks.redis.status = "up";
    healthcheck.checks.redis.timestamp = Date.now();
  } catch (error) {
    logger.error("Redis health check failed:", error);
    healthcheck.checks.redis.status = "down";
  }

  // Determine overall status
  const isHealthy = Object.values(healthcheck.checks).every(
    (check) => check.status === "up",
  );

  res.status(isHealthy ? 200 : 503).json(healthcheck);
};
