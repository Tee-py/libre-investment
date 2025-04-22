import { z } from "zod";

const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;

export const getNonceSchema = z.object({
  body: z.object({
    address: z.string().regex(ethereumAddressRegex, "Invalid Ethereum address"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    message: z.string().min(1, "Message is required"),
    signature: z.string().min(1, "Signature is required")
  }),
});

export type GetNonceRequest = z.infer<typeof getNonceSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
