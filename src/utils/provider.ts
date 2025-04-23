import { env } from "../api/config";
import { ethers } from "ethers";
import { APIError } from "./errors";

const BASE_SEPOLIA_RPC_PROVIDER = new ethers.providers.JsonRpcProvider(
  env.BASE_SEPOLIA_RPC,
);
const POLYGON_AMOY_RPC_PROVIDER = new ethers.providers.JsonRpcProvider(
  env.POLYGON_AMOY_RPC,
);

export const getRpcProvider = (chainId: number) => {
  switch (chainId) {
    case 84532:
      return BASE_SEPOLIA_RPC_PROVIDER;
    case 80002:
      return POLYGON_AMOY_RPC_PROVIDER;
    default:
      throw new APIError(`unsupported chainId ${chainId}`);
  }
};
