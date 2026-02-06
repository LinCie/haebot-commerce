import { http } from "@/shared/infrastructure/http";
import {
  type BatchOperationsBody,
  type BatchOperationResult,
  batchOperationResultSchema,
} from "../schemas/batch-transaction.schema";

interface IBatchTransactionParams {
  token: string;
  body: BatchOperationsBody;
}

/**
 * Executes a batch of transaction operations.
 * @param params - Request parameters
 * @returns Response from backend
 */
export async function batchTransaction(
  params: IBatchTransactionParams,
): Promise<BatchOperationResult> {
  const { token, body } = params;
  console.log(
    "Body: ",
    body.operations.map((op) => {
      if (op.type === "update") {
        return op.data;
      }
    }),
  );
  const response = await http
    .post("trades/batch", {
      context: { token },
      json: body,
    })
    .json();
  console.log("Response: ", response);
  const parsed = batchOperationResultSchema.parse(response);
  console.log("Parsed: ", parsed);
  return parsed;
}
