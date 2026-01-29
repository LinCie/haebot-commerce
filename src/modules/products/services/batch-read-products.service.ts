import { http } from "@/shared/infrastructure/http";
import {
  batchReadProductsResponseSchema,
  type BatchReadProductsResponse,
  type BatchReadProductsBody,
} from "../schemas";

interface IBatchReadProductsParams {
  token: string;
  body: BatchReadProductsBody;
}

/**
 * Fetches many products with optional filtering and pagination.
 * @param params - Request parameters
 * @returns Validated list of products
 */
export async function batchReadProducts(
  params: IBatchReadProductsParams,
): Promise<BatchReadProductsResponse> {
  const { token, body } = params;
  const response = await http
    .post(`items/batch/read`, {
      context: { token },
      json: body,
    })
    .json();
  return batchReadProductsResponseSchema.parse(response);
}
