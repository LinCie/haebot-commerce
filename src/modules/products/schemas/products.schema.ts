import { z } from "astro/zod";
import { baseEntitySchema } from "@/shared/schemas";

export const inventoryProductSchema = z.object({
  id: z.coerce.number(),
  balance: z.coerce.number(),
  cost_per_unit: z.coerce.number(),
  notes: z.string().optional(),
  space_name: z.string(),
  status: z.string(),
});

export const productFileSchema = z.object({
  name: z.string(),
  path: z.string(),
  size: z.number(),
});

export const productImageSchema = z.object({
  name: z.string(),
  path: z.string(),
  size: z.number(),
  isNew: z.boolean().optional(),
});

export const productSchema = baseEntitySchema.omit({ status: true }).extend({
  name: z.string(),
  cost: z.string(),
  price: z.string(),
  weight: z.string(),
  status: z.union([z.string(), z.enum(["active", "inactive"])]),
  price_discount: z.string().optional(),
  code: z.string().optional(),
  description: z.string().optional(),
  sku: z.string().optional(),
  notes: z.string().optional(),
  space_id: z.number().optional(),
  images: z.array(productImageSchema).optional(),
  files: z.array(productFileSchema).optional(),
  inventories: z.array(inventoryProductSchema).optional(),
});

export type Product = z.infer<typeof productSchema>;
export type ProductImage = z.infer<typeof productImageSchema>;
export type ProductFile = z.infer<typeof productFileSchema>;
export type InventoryProduct = z.infer<typeof inventoryProductSchema>;
