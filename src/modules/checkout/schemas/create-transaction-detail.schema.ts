import { z } from "astro/zod";

import { TRANSACTION_DETAIL_TYPES } from "../types/transaction-detail-type.type";

const createTransactionDetailSchema = z.object({
  item_id: z.coerce.number(),
  model_type: z.enum(TRANSACTION_DETAIL_TYPES),
  quantity: z.number(),
  price: z.number(),
  discount: z.number().optional(),
  weight: z.number().optional(),
  sku: z.string().optional(),
  name: z.string().optional(),
  notes: z.string().optional(),
});

type CreateTransactionDetail = z.infer<typeof createTransactionDetailSchema>;

export { createTransactionDetailSchema };
export type { CreateTransactionDetail };
