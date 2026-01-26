import { z } from "astro/zod";
import { defineAction } from "astro:actions";
import { getProductQuerySchema } from "../schemas";
import { getProduct } from "../services/get-product.service";

export const getProductAction = defineAction({
  input: z.object({
    productId: z.number(),
    searchParams: getProductQuerySchema,
  }),
  handler: async (input) => {
    const token = import.meta.env.BACKEND_API_KEY;
    const response = await getProduct({
      token,
      productId: input.productId,
      searchParams: { ...input.searchParams },
    });
    return response;
  },
});
