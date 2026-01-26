import { http } from "@/shared/infrastructure/http";
import { productSchema, type GetProductQuery, type Product } from "../schemas";

interface IGetProductParams {
  token: string;
  productId: number;
  searchParams: GetProductQuery;
}

/**
 * Fetches many products with optional filtering and pagination.
 * @param params - Request parameters
 * @returns Validated list of products
 */
export async function getProduct(params: IGetProductParams): Promise<Product> {
  const { token, productId, searchParams } = params;
  const response = await http
    .get(`items/${productId}`, {
      context: { token },
      searchParams,
    })
    .json();
  return productSchema.parse(response);
}
