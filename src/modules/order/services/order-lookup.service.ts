import { http } from "@/shared/infrastructure/http";
import {
  type OrderLookupResponse,
  type OrderLookupBodyValidator,
  orderLookupResponseSchema,
} from "../schemas";

interface IOrderLookupParams {
  token: string;
  data: OrderLookupBodyValidator;
}

/**
 * Check whether the user has access to the order or not
 * @param params - Request parameters
 * @returns Access
 */
export async function orderLookup(
  params: IOrderLookupParams,
): Promise<OrderLookupResponse> {
  const { token, data } = params;
  const response = await http
    .post("trades/lookup", {
      context: { token },
      json: data,
    })
    .json();
  return orderLookupResponseSchema.parse(response);
}
