import { z } from "zod";

export const getInvestTransactionSchema = z.object({
  body: z.object({
    fund: z.string().min(1, "fund is required"),
    usdAmount: z.number().gt(0, "usdAmount cannot be less than zero")
  }),
});

export const getRedeemTransactionSchema = z.object({
  body: z.object({
    fund: z.string().min(1, "fund is required"),
    share: z.number().gt(0, "share cannot be less than zero")
  }),
});

export type GetInvestTransactionRequest = z.infer<typeof getInvestTransactionSchema>;
export type GetRedeemTransactionRequest = z.infer<typeof getRedeemTransactionSchema>;
