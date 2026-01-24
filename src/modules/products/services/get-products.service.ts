import { http } from "@/shared/infrastructure/http";
import {
  type GetProductsQuery,
  type GetProductsResponse,
  getProductsResponseSchema,
} from "../schemas";

interface IGetProductsParams {
  token: string;
  searchParams: GetProductsQuery;
}

/**
 * Fetches many products with optional filtering and pagination.
 * @param params - Request parameters
 * @returns Validated list of products
 */
export async function getProducts(
  params: IGetProductsParams,
): Promise<GetProductsResponse> {
  const { token, searchParams } = params;
  const response = await http
    .get("items", {
      context: { token },
      searchParams,
    })
    .json();
  return getProductsResponseSchema.parse(response);
}
