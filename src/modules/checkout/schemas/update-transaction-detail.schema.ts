import { z } from "astro/zod";
import { TRANSACTION_DETAIL_TYPES } from "../types/transaction-detail-type.type";

/**
 * Validator for updating a transaction detail (line item)
 * Excludes transaction_id, detail_type, and detail_id (immutable linking fields)
 */
const updateTransactionDetailSchema = z
  .object({
    model_type: z.enum(TRANSACTION_DETAIL_TYPES).optional(),
    quantity: z.number().optional(),
    price: z.number().optional(),
    discount: z.number().optional(),
    weight: z.number().optional(),
    sku: z.string().optional(),
    name: z.string().optional(),
    notes: z.string().optional(),
  })
  .strict();

type UpdateTransactionDetail = z.infer<typeof updateTransactionDetailSchema>;

export { updateTransactionDetailSchema };
export type { UpdateTransactionDetail };
