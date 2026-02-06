import { http } from "@/shared/infrastructure/http";
import { type OrderResponse, orderResponseSchema } from "../schemas";

interface IGetOrderParams {
  token: string;
  id: number;
}

export async function getOrder(
  params: IGetOrderParams,
): Promise<OrderResponse> {
  const { token, id } = params;
  const response = await http
    .get(`trades/${id}`, {
      context: { token },
      searchParams: {
        withDetails: "true",
      },
    })
    .json();
  return orderResponseSchema.parse(response);
}
