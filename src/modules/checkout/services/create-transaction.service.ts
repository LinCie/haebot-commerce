import { http } from "@/shared/infrastructure/http";
import {
  type CreateTransactionInput,
  type Transaction,
  transactionSchema,
} from "../schemas";

interface ICreateTransactionParams {
  token: string;
  data: CreateTransactionInput;
}

/**
 * Creates a new transaction.
 * @param params - Request parameters
 * @returns Validated created transaction
 */
export async function createTransaction(
  params: ICreateTransactionParams,
): Promise<Transaction> {
  const { token, data } = params;
  const response = await http
    .post("trades", {
      context: { token },
      json: data,
    })
    .json();
  return transactionSchema.parse(response);
}
