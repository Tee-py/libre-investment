import dotenv from "dotenv";
import { cleanEnv, makeValidator, host, port, str, url } from "envalid";

dotenv.config();

const validStr = makeValidator((x) => {
  if (!x) throw new Error("Should not empty");
  return x;
});

export const env = cleanEnv(process.env, {
  NODE_ENV: str({
    default: "development",
    choices: ["development", "staging", "production"],
  }),
  HOST: host({ default: "localhost" }),
  PORT: port({ default: 4000 }),
  CORS_ORIGIN: str({ default: "http://localhost:3000" }),
  JWT_SECRET: validStr(),
  REDIS_URL: validStr(),
  POLYGON_AMOY_RPC: url(),
  BASE_SEPOLIA_RPC: url()
});
