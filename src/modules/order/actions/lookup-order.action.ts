import { z } from "astro/zod";
import { defineAction } from "astro:actions";
import { orderLookup } from "../services/order-lookup.service";

export const lookupOrderAction = defineAction({
  input: z.object({
    number: z.string(),
    phone: z.string().regex(/^\d{4}$/),
  }),
  handler: async (input) => {
    try {
      const token = import.meta.env.BACKEND_API_KEY;
      const response = await orderLookup({
        token,
        data: input,
      });
      return response;
    } catch {
      // Return failure response to match API contract
      return { success: false } as const;
    }
  },
});
