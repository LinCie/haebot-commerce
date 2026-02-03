import { z } from "astro/zod";

/**
 * Schema for creating a new transaction.
 */
export const createTransactionSchema = z.object({
  space_id: z.number(),
  sender_id: z.number().nullable().optional(),
  sent_time: z.string().optional(),
  sender_notes: z.string().optional(),
  number: z.string().optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
