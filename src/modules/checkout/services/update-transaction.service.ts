import { http } from "@/shared/infrastructure/http";
import {
  type UpdateTransactionInput,
  type Transaction,
  transactionSchema,
} from "../schemas";

interface IUpdateTransactionParams {
  token: string;
  id: number;
  data: UpdateTransactionInput;
}

/**
 * Updates an existing transaction.
 * @param params - Request parameters
 * @returns Validated updated transaction
 */
export async function updateTransaction(
  params: IUpdateTransactionParams,
): Promise<Transaction> {
  const { token, id, data } = params;
  const response = await http
    .patch(`trades/${id}`, {
      context: { token },
      json: data,
    })
    .json();
  return transactionSchema.parse(response);
}
