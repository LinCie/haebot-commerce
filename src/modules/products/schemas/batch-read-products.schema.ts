import { z } from "astro/zod";
import { productSchema } from "./";

const batchReadProductsBodySchema = z.object({
  ids: z.array(z.coerce.number().int().positive()).min(1).max(1000),
  spaceId: z.coerce.number().int().positive().optional(),
  withInventory: z.boolean().optional().default(false),
});

const batchReadProductsResponseSchema = z.object({
  data: z.array(productSchema),
});

type BatchReadProductsBody = z.infer<typeof batchReadProductsBodySchema>;
type BatchReadProductsResponse = z.infer<
  typeof batchReadProductsResponseSchema
>;

export { batchReadProductsBodySchema, batchReadProductsResponseSchema };
export type { BatchReadProductsBody, BatchReadProductsResponse };
