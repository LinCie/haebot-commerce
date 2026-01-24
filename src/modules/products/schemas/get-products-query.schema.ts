import { z } from "astro/zod";
import { paginationMetaSchema } from "@/shared/schemas";
import { productSchema } from "./products.schema";

export const getProductsQuerySchema = z.object({
  spaceId: z.number().optional(),
  type: z.enum(["full", "partial"]),
  search: z.string().optional(),
  status: z
    .enum(["active", "inactive", "discounted", "all", "unknown"])
    .optional(),
  limit: z.number().int().positive().optional(),
  page: z.number().int().positive().optional(),
  withInventory: z.boolean().optional(),
});

export const getProductsResponseSchema = z.object({
  data: z.array(productSchema),
  metadata: paginationMetaSchema,
});

export type GetProductsQuery = z.infer<typeof getProductsQuerySchema>;
export type GetProductsResponse = z.infer<typeof getProductsResponseSchema>;
