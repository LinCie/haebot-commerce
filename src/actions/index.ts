import {
  getProductAction,
  getProductsAction,
  batchReadProductsAction,
} from "@/modules/products/actions";
import { batchTransactionAction } from "@/modules/checkout/actions";

export const server = {
  // Products
  getProductsAction: getProductsAction,
  getProductAction: getProductAction,
  batchReadProductsAction: batchReadProductsAction,

  // Checkout
  batchTransactionAction: batchTransactionAction,
};
