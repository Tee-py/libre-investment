import { createClient } from "redis";
import { env } from "../api/config";
import { logger } from "./logger";

const redisClient = createClient({
  url: env.REDIS_URL,
});

redisClient.on("error", (err) => logger.error("Redis Client Error", err));

// Connect to Redis
redisClient.connect().catch(logger.error);

export default redisClient;
