import { z } from "astro/zod";

export const orderTimestampsSchema = z.object({
  createdAt: z.string().nullable().optional(),
  packagedAt: z.string().nullable().optional(),
  shippedAt: z.string().nullable().optional(),
  deliveredAt: z.string().nullable().optional(),
  cancelledAt: z.string().nullable().optional(),
  completedAt: z.string().nullable().optional(),
});

export const itemInfoSchema = z.object({
  id: z.number(),
  name: z.string(),
  sku: z.string(),
  cost: z.string(),
  price: z.string(),
});

export const orderDetailResponseSchema = z.object({
  id: z.number(),
  model_type: z.string(),
  sku: z.string(),
  name: z.string(),
  quantity: z.number(),
  price: z.number(),
  discount: z.number(),
  weight: z.number(),
  debit: z.number(),
  credit: z.number(),
  notes: z.string().nullable().optional(),
  item: itemInfoSchema.optional().nullable(),
});

export const orderResponseSchema = z.object({
  number: z.string(),
  status: z.enum([
    "TX_DRAFT",
    "TX_REQUEST",
    "TX_READY",
    "TX_SENT",
    "TX_RECEIVED",
    "TX_COMPLETED",
    "TX_CANCELED",
    "TX_RETURN",
    "TX_CLOSED",
  ]),
  timestamps: orderTimestampsSchema.optional().nullable(),
  details: z.array(orderDetailResponseSchema).optional(),
});

export type OrderResponse = z.infer<typeof orderResponseSchema>;
