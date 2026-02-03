import { defineAction } from "astro:actions";
import { batchOperationsBodySchema } from "../schemas/batch-transaction.schema";
import { batchTransaction } from "../services/batch-transaction.service";

export const batchTransactionAction = defineAction({
  input: batchOperationsBodySchema,
  handler: async (input) => {
    // Context7: Using BACKEND_API_KEY as per other actions
    const token = import.meta.env.BACKEND_API_KEY;

    // Note: spaceId might be needed depending on implementation,
    // but batchTransaction service signature currently only takes token and body.
    // If backend requires spaceId in the body or URL, we might need to add it.
    // Based on createTransaction, it uses token in context.

    const response = await batchTransaction({
      token,
      body: input,
    });

    return response;
  },
});
