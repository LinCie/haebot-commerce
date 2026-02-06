import { defineAction } from "astro:actions";
import { z } from "astro/zod";
import { getOrdersBatch } from "../services/get-orders-batch.service";
import { getOrdersBatchResponseSchema } from "../schemas/get-orders-batch.schema";

export const getOrdersBatchAction = defineAction({
  accept: "json",
  input: z.object({
    ids: z.array(z.number().int().positive()).min(1).max(100),
  }),
  handler: async (input) => {
    const token = import.meta.env.BACKEND_API_KEY;

    const orders = await getOrdersBatch({
      token,
      ids: input.ids,
    });

    return getOrdersBatchResponseSchema.parse({ orders });
  },
});
