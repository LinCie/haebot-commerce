import { z } from "astro/zod";
import { defineAction } from "astro:actions";
import { getOrder } from "../services/get-order.service";

export const getOrderAction = defineAction({
  input: z.object({
    id: z.number(),
  }),
  handler: async (input) => {
    const token = import.meta.env.BACKEND_API_KEY;
    const response = await getOrder({
      token,
      id: input.id,
    });
    return response;
  },
});
