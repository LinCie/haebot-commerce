import { defineAction } from "astro:actions";
import { batchReadProductsBodySchema } from "../schemas";
import { batchReadProducts } from "../services/batch-read-products.service";

export const batchReadProductsAction = defineAction({
  input: batchReadProductsBodySchema,
  handler: async (input) => {
    const token = import.meta.env.BACKEND_API_KEY;
    const spaceId = import.meta.env.SPACE_ID;

    const response = await batchReadProducts({
      token,
      body: {
        ...input,
        spaceId: parseInt(spaceId),
      },
    });
    return response;
  },
});
