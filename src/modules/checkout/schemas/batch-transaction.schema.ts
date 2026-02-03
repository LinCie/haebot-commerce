import { z } from "astro/zod";
import { createTransactionSchema } from "./create-transaction.schema.ts";
import { updateTransactionSchema } from "./update-transaction.schema.ts";
import { updateTransactionDetailSchema } from "./update-transaction-detail.schema.ts";
import { createTransactionDetailSchema } from "./create-transaction-detail.schema.ts";
import {
  transactionDetailSchema,
  transactionSchema,
} from "./transaction.schema.ts";

const batchReadOperationSchema = z.object({
  type: z.literal("read"),
  ids: z.array(z.coerce.number().int().positive()).min(1).max(1000),
  withDetails: z.boolean().optional().default(false),
});

const batchCreateOperationSchema = z.object({
  type: z.literal("create"),
  ref: z.string().optional(),
  data: createTransactionSchema,
});

const batchUpdateOperationSchema = z
  .object({
    type: z.literal("update"),
    id: z.coerce.number().int().positive().optional(),
    idRef: z.string().optional(),
    data: updateTransactionSchema,
  })
  .refine((data) => data.id !== undefined || data.idRef !== undefined, {
    message: "Either id or idRef must be provided",
  })
  .refine((data) => !(data.id !== undefined && data.idRef !== undefined), {
    message: "Cannot provide both id and idRef",
  });

const batchUpdateDetailOperationSchema = z
  .object({
    type: z.literal("updateDetail"),
    tradeId: z.coerce.number().int().positive().optional(),
    tradeIdRef: z.string().optional(),
    detailId: z.coerce.number().int().positive(),
    data: updateTransactionDetailSchema,
  })
  .refine(
    (data) => data.tradeId !== undefined || data.tradeIdRef !== undefined,
    {
      message: "Either tradeId or tradeIdRef must be provided",
    },
  )
  .refine(
    (data) => !(data.tradeId !== undefined && data.tradeIdRef !== undefined),
    {
      message: "Cannot provide both tradeId and tradeIdRef",
    },
  );

const batchCreateDetailOperationSchema = z
  .object({
    type: z.literal("createDetail"),
    tradeId: z.coerce.number().int().positive().optional(),
    tradeIdRef: z.string().optional(),
    data: createTransactionDetailSchema,
  })
  .refine(
    (data) => data.tradeId !== undefined || data.tradeIdRef !== undefined,
    {
      message: "Either tradeId or tradeIdRef must be provided",
    },
  )
  .refine(
    (data) => !(data.tradeId !== undefined && data.tradeIdRef !== undefined),
    {
      message: "Cannot provide both tradeId and tradeIdRef",
    },
  );

const batchDeleteDetailOperationSchema = z
  .object({
    type: z.literal("deleteDetail"),
    tradeId: z.coerce.number().int().positive().optional(),
    tradeIdRef: z.string().optional(),
    detailId: z.coerce.number().int().positive(),
  })
  .refine(
    (data) => data.tradeId !== undefined || data.tradeIdRef !== undefined,
    {
      message: "Either tradeId or tradeIdRef must be provided",
    },
  )
  .refine(
    (data) => !(data.tradeId !== undefined && data.tradeIdRef !== undefined),
    {
      message: "Cannot provide both tradeId and tradeIdRef",
    },
  );

const batchDeleteOperationSchema = z
  .object({
    type: z.literal("delete"),
    id: z.coerce.number().int().positive().optional(),
    idRef: z.string().optional(),
  })
  .refine((data) => data.id !== undefined || data.idRef !== undefined, {
    message: "Either id or idRef must be provided",
  })
  .refine((data) => !(data.id !== undefined && data.idRef !== undefined), {
    message: "Cannot provide both id and idRef",
  });

const batchOperationSchema = z.union([
  batchReadOperationSchema,
  batchCreateOperationSchema,
  batchUpdateOperationSchema,
  batchUpdateDetailOperationSchema,
  batchCreateDetailOperationSchema,
  batchDeleteDetailOperationSchema,
  batchDeleteOperationSchema,
]);

const batchOperationsBodySchema = z.object({
  operations: z.array(batchOperationSchema).min(1).max(100),
});

type BatchOperationsBody = z.infer<typeof batchOperationsBodySchema>;

const batchOperationResultSchema = z.object({
  created: z.array(transactionSchema),
  read: z.array(transactionSchema),
  updated: z.array(transactionSchema),
  deleted: z.array(z.number()),
  createdDetails: z.array(transactionDetailSchema),
  updatedDetails: z.array(transactionDetailSchema),
  deletedDetails: z.array(z.number()),
});

type BatchOperationResult = z.infer<typeof batchOperationResultSchema>;

export { batchOperationsBodySchema, batchOperationResultSchema };
export type { BatchOperationsBody, BatchOperationResult };
