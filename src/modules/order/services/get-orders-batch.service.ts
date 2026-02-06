import { http } from "@/shared/infrastructure/http";
import { transactionSchema } from "@/modules/checkout/schemas/transaction.schema";
import type { Transaction } from "@/modules/checkout/schemas/transaction.schema";

interface IGetOrdersBatchParams {
  token: string;
  ids: number[];
}

export async function getOrdersBatch(
  params: IGetOrdersBatchParams,
): Promise<Transaction[]> {
  const { token, ids } = params;

  const response = await http
    .post("trades/batch", {
      context: { token },
      json: {
        operations: [
          {
            type: "read",
            ids,
            withDetails: true,
          },
        ],
      },
    })
    .json();

  const batchResult = response as { read: unknown[] };
  const readTransactions = batchResult.read || [];

  return readTransactions.map((tx) => transactionSchema.parse(tx));
}
