import { defineAction } from "astro:actions";
import { getProductsQuerySchema } from "../schemas";
import { getProducts } from "../services/get-products.service";

export const getProductsAction = defineAction({
  input: getProductsQuerySchema,
  handler: async (input) => {
    const token = import.meta.env.BACKEND_API_KEY;
    const spaceId = import.meta.env.SPACE_ID;
    const response = await getProducts({
      token,
      searchParams: { ...input, spaceId: parseInt(spaceId) },
    });
    return response;
  },
});
