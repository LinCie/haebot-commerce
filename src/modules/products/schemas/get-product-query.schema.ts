import { z } from "astro/zod";

export const getProductQuerySchema = z.object({
  withInventory: z.boolean().optional(),
});

export type GetProductQuery = z.infer<typeof getProductQuerySchema>;
