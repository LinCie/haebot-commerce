import { z } from "astro/zod";
import {
  transactionFileSchema,
  transactionLinkSchema,
} from "./transaction.schema";

/**
 * Schema for updating a transaction transaction (PATCH /transactions/{id}).
 * Based on OpenAPI UpdateTransactionTransactionBody.
 * IMPORTANT: details field is NOT allowed and will be rejected by backend.
 */
export const updateTransactionSchema = z.object({
  handler_id: z.number().nullable(),
  sent_time: z.string().nullable().optional(),
  received_time: z.string().nullable().optional(),
  receiver_id: z.number().nullable().optional(),
  receiver_notes: z.string().optional(),
  handler_notes: z.string().optional(),
  description: z.string().optional(),
  status: z.string().optional(),
  parent_id: z.number().nullable().optional(),
  files: z.array(transactionFileSchema).optional(),
  tags: z.array(z.string()).optional(),
  links: z.array(transactionLinkSchema).optional(),
});

export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
