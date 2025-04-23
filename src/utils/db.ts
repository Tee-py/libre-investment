import { PrismaClient } from "@prisma/client";
import { logger } from "./logger";

const prisma = new PrismaClient({
  log: [
    {
      emit: "event",
      level: "query",
    },
    {
      emit: "event",
      level: "error",
    },
    {
      emit: "event",
      level: "info",
    },
    {
      emit: "event",
      level: "warn",
    },
  ],
});

prisma.$on("error", (e: any) => {
  logger.error("Database Error:", e);
});

export const disconnect = () => prisma.$disconnect();

export { prisma };
