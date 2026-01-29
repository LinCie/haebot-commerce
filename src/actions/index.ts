import {
  getProductAction,
  getProductsAction,
  batchReadProductsAction,
} from "@/modules/products/actions";

export const server = {
  // Products
  getProductsAction: getProductsAction,
  getProductAction: getProductAction,
  batchReadProductsAction: batchReadProductsAction,
};
