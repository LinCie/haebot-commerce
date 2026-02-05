import { z } from "astro/zod";

/**
 * Transaction status enum values.
 */
export const TRANSACTION_STATUSES = [
  "TX_DRAFT",
  "TX_REQUEST",
  "TX_READY",
  "TX_SENT",
  "TX_RECEIVED",
  "TX_COMPLETED",
  "TX_CANCELED",
  "TX_RETURN",
  "TX_CLOSED",
] as const;

/**
 * Schema for transaction status.
 */
export const transactionStatusSchema = z.union([
  z.string(),
  z.enum(TRANSACTION_STATUSES),
]);

export type TransactionStatus = z.infer<typeof transactionStatusSchema>;

/**
 * Schema for transaction file attachments.
 */
export const transactionFileSchema = z.object({
  name: z.string(),
  path: z.string(),
  size: z.number(),
});

/**
 * Schema for transaction external links.
 */
export const transactionLinkSchema = z.object({
  url: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
});

/**
 * Schema for transaction addresses in transaction responses
 */
export const transactionAddressSchema = z.object({
  street: z.string(),
  city: z.string(),
  state: z.string(),
  zip: z.string(),
  country: z.string(),
});

export const transactionPlayersSchema = z.object({
  name: z.string(),
  phone: z.string(),
  email: z.string(),
});

export const transactionTimestampsSchema = z.object({
  createdAt: z.coerce.date(),
  packagedAt: z.coerce.date().nullable().optional(),
  shippedAt: z.coerce.date().nullable().optional(),
  deliveredAt: z.coerce.date().nullable().optional(),
  cancelledAt: z.coerce.date().nullable().optional(),
  completedAt: z.coerce.date().nullable().optional(),
});

/**
 * Schema for transaction line item details (response).
 */
export const transactionDetailSchema = z.object({
  id: z.number(),
  sku: z.string().optional(),
  name: z.string().optional(),
  quantity: z.number(),
  price: z.number(),
  discount: z.number(),
  weight: z.number(),
  debit: z.number(),
  credit: z.number(),
  notes: z.string().optional(),
  model_type: z.string().optional(),
  item: z
    .object({
      id: z.number(),
      name: z.string(),
      sku: z.string().nullable(),
      cost: z.string(),
      price: z.string(),
    })
    .optional(),
});

/**
 * Schema for player info (sender, receiver, handler).
 */
export const playerInfoSchema = z.object({
  id: z.number(),
  code: z.string().optional(),
  name: z.string(),
});

/**
 * Schema for child transaction (populated when withChildren=true).
 */
export const childTransactionSchema = z.object({
  id: z.number(),
  number: z.string(),
  status: transactionStatusSchema,
  total: z.string(),
  space_id: z.number(),
  sent_time: z.string().nullable().optional(),
  received_time: z.string().nullable().optional(),
  created_at: z.string().nullable().optional(),
});

/**
 * Schema for transaction entity.
 */
export const transactionSchema = z.object({
  id: z.number(),
  number: z.string(),
  space_id: z.number(),
  status: transactionStatusSchema,
  total: z.string(),
  sent_time: z.string().nullable().optional(),
  received_time: z.string().nullable().optional(),
  sender_id: z.number().nullable().optional(),
  receiver_id: z.number().nullable().optional(),
  handler_id: z.number().nullable().optional(),
  parent_id: z.number().nullable().optional(),
  sender_notes: z.string().optional(),
  receiver_notes: z.string().optional(),
  handler_notes: z.string().optional(),
  description: z.string().optional(),
  fee: z.string().optional(),
  files: z.array(transactionFileSchema).optional(),
  tags: z.array(z.string()).optional(),
  links: z.array(transactionLinkSchema).optional(),
  details: z.array(transactionDetailSchema).optional(),
  // Child transactions (populated when withChildren=true)
  children: z.array(childTransactionSchema).optional(),
  // Player info (populated when withPlayers=true)
  sender: playerInfoSchema.nullable().optional(),
  receiver: playerInfoSchema.nullable().optional(),
  handler: playerInfoSchema.nullable().optional(),
  // Aggregated fields
  all_notes: z.string().optional(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
  // JSON fields
  address: transactionAddressSchema.optional(),
  players: transactionPlayersSchema.optional(),
  timestamps: transactionTimestampsSchema.optional(),
});

export type Transaction = z.infer<typeof transactionSchema>;
export type ChildTransaction = z.infer<typeof childTransactionSchema>;
export type TransactionFile = z.infer<typeof transactionFileSchema>;
export type TransactionLink = z.infer<typeof transactionLinkSchema>;
export type TransactionDetail = z.infer<typeof transactionDetailSchema>;
export type PlayerInfo = z.infer<typeof playerInfoSchema>;
