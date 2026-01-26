import {
  getProductAction,
  getProductsAction,
} from "@/modules/products/actions";

export const server = {
  // Products
  getProductsAction: getProductsAction,
  getProductAction: getProductAction,
};
