import {
  getProductAction,
  getProductsAction,
  batchReadProductsAction,
} from "@/modules/products/actions";
import { batchTransactionAction } from "@/modules/checkout/actions";
import {
  getOrderAction,
  lookupOrderAction,
  getOrdersBatchAction,
} from "@/modules/order/actions";

export const server = {
  // Products
  getProductsAction: getProductsAction,
  getProductAction: getProductAction,
  batchReadProductsAction: batchReadProductsAction,

  // Checkout
  batchTransactionAction: batchTransactionAction,

  // Order
  getOrderAction: getOrderAction,
  lookupOrderAction: lookupOrderAction,
  getOrdersBatchAction: getOrdersBatchAction,
};
