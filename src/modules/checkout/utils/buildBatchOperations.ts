import type { BatchOperationsBody } from "../schemas/batch-transaction.schema";
import type { CustomerFormData } from "../schemas/customer-form.schema";
import type { Product } from "@/modules/products/schemas/products.schema";
import {
  buildAddressData,
  buildPlayersData,
  buildTimestampsData,
} from "./buildCustomerData";

type CartProduct = {
  id: number;
  quantity: number;
};

export function buildBatchOperations(
  formData: CustomerFormData,
  cartItems: CartProduct[],
  products: Product[],
  spaceId: number,
): BatchOperationsBody {
  // Build structured customer data
  const addressData = buildAddressData(formData);
  const playersData = buildPlayersData(formData);
  const timestampsData = buildTimestampsData();

  const operations = [
    // Operation 1: Create transaction
    {
      type: "create" as const,
      ref: "tx-main",
      data: {
        space_id: spaceId,
      },
    },
    // Operation 2: Update transaction with structured customer data
    {
      type: "update" as const,
      idRef: "tx-main",
      data: {
        handler_id: null, // No handler assigned initially
        receiver_notes: formData.notes || "", // Only store user's checkout notes
        address: addressData,
        players: playersData,
        timestamps: timestampsData,
      },
    },
    // Operations 3+: Create detail for each cart item
    ...cartItems.map((item) => {
      const product = products.find((p) => p.id === item.id);
      return {
        type: "createDetail" as const,
        tradeIdRef: "tx-main",
        data: {
          item_id: item.id,
          model_type: "SO" as const,
          quantity: item.quantity,
          price: parseFloat(product?.price || "0"),
          discount: 0,
          sku: product?.sku || "",
          name: product?.name || "",
        },
      };
    }),
  ];

  return { operations };
}
