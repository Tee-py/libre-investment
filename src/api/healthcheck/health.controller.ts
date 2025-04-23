import { Request, Response } from "express";
import { prisma } from "../../utils/db";
import redis from "../../utils/redis";
import { logger } from "../../utils/logger";
import { getRpcProvider } from "../../utils/provider";

export const healthCheck = async (_req: Request, res: Response) => {
  const uptime = Math.floor(process.uptime()); // total seconds
  const minutes = Math.floor(uptime / 60);
  const seconds = uptime % 60;

  const healthcheck = {
    uptime: `${minutes}m ${seconds}s`,
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
      baseSepoliaRpc: {
        status: "down",
        currentBlock: 0,
        timestamp: Date.now(),
      },
      polygonAmoyRpc: {
        status: "down",
        currentBlock: 0,
        timestamp: Date.now(),
      },
    },
  };

  // Db connection checks
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    healthcheck.checks.database.status = "up";
    healthcheck.checks.database.timestamp = Date.now();
  } catch (error) {
    logger.error("Database health check failed:", error);
    healthcheck.checks.database.status = "down";
  }

  // Redis connection checks
  try {
    await redis.ping();
    healthcheck.checks.redis.status = "up";
    healthcheck.checks.redis.timestamp = Date.now();
  } catch (error) {
    logger.error("Redis health check failed:", error);
    healthcheck.checks.redis.status = "down";
  }

  // Base sepolia rpc connection checks
  try {
    const provider = await getRpcProvider(84532);
    const currBlock = await provider.getBlockNumber();
    healthcheck.checks.baseSepoliaRpc.currentBlock = currBlock;
    healthcheck.checks.baseSepoliaRpc.status = "up";
  } catch (error: any) {
    logger.error(`Base sepolia rpc check failed: ${error.code}`, error);
    healthcheck.checks.baseSepoliaRpc.status = "down";
  }

  // Polygon amoy rpc connection checks
  try {
    const provider = await getRpcProvider(80002);
    const currBlock = await provider.getBlockNumber();
    healthcheck.checks.polygonAmoyRpc.currentBlock = currBlock;
    healthcheck.checks.polygonAmoyRpc.status = "up";
  } catch (error: any) {
    logger.error(`Polygon amoy rpc check failed: ${error.code}`, error);
    healthcheck.checks.polygonAmoyRpc.status = "down";
  }

  // Determine overall status
  const isHealthy = Object.values(healthcheck.checks).every(
    (check) => check.status === "up",
  );

  res.status(isHealthy ? 200 : 503).json(healthcheck);
};
