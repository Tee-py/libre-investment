import { ethers } from "ethers";
import { logger } from "../utils/logger";

const investmentTopic = ethers.utils.id(
  "Investment(address,uint256,uint256,uint256)",
);
const redemptionTopic = ethers.utils.id(
  "Redemption(address,uint256,uint256,uint256)",
);
const metricsUpdatedTopic = ethers.utils.id(
  "MetricsUpdated(uint256,uint256,uint256)",
);

export type ParsedFundEvent =
  | {
      type: "Investment";
      args: {
        investor: string;
        usdAmount: string;
        sharesIssued: string;
        sharePrice: string;
      };
    }
  | {
      type: "Redemption";
      args: {
        investor: string;
        shares: string;
        usdAmount: string;
        sharePrice: string;
      };
    }
  | {
      type: "MetricsUpdated";
      args: {
        totalAssetValue: string;
        sharesSupply: string;
        sharePrice: string;
      };
    };

export function parseLogs(log: ethers.providers.Log): ParsedFundEvent | null {
  try {
    const { topics, data } = log;

    if (topics[0] === investmentTopic) {
      logger.info("Found invest logs");
      const investor = ethers.utils
        .getAddress(ethers.utils.hexStripZeros(topics[1]))
        .toLowerCase();
      const [usdAmount, sharesIssued, sharePrice] =
        ethers.utils.defaultAbiCoder.decode(
          ["uint256", "uint256", "uint256"],
          data,
        );
      return {
        type: "Investment",
        args: {
          investor,
          usdAmount: usdAmount.toString(),
          sharesIssued: sharesIssued.toString(),
          sharePrice: sharePrice.toString(),
        },
      };
    }

    if (topics[0] === redemptionTopic) {
      logger.info("Found redeem logs");
      const investor = ethers.utils
        .getAddress(ethers.utils.hexStripZeros(topics[1]))
        .toLowerCase();
      const [shares, usdAmount, sharePrice] =
        ethers.utils.defaultAbiCoder.decode(
          ["uint256", "uint256", "uint256"],
          data,
        );

      return {
        type: "Redemption",
        args: {
          investor,
          shares: shares.toString(),
          usdAmount: usdAmount.toString(),
          sharePrice: sharePrice.toString(),
        },
      };
    }

    if (topics[0] === metricsUpdatedTopic) {
      const [totalAssetValue, sharesSupply, sharePrice] =
        ethers.utils.defaultAbiCoder.decode(
          ["uint256", "uint256", "uint256"],
          data,
        );

      return {
        type: "MetricsUpdated",
        args: {
          totalAssetValue: totalAssetValue.toString(),
          sharesSupply: sharesSupply.toString(),
          sharePrice: sharePrice.toString(),
        },
      };
    }

    return null;
  } catch (err) {
    logger.error("Error occurred while parsing logs", err);
    return null;
  }
}
