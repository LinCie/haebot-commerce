import { z } from "astro/zod";
import { transactionSchema } from "@/modules/checkout/schemas/transaction.schema";

export const getOrdersBatchInputSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1).max(100),
});

export const getOrdersBatchResponseSchema = z.object({
  orders: z.array(transactionSchema),
});

export type GetOrdersBatchInput = z.infer<typeof getOrdersBatchInputSchema>;
export type GetOrdersBatchResponse = z.infer<
  typeof getOrdersBatchResponseSchema
>;
