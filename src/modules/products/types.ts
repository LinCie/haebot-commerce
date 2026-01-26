export type Category = "milling" | "turning" | "spare-parts" | "tooling";

export type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

export interface ProductFilter {
  category?: Category;
  stockStatus?: StockStatus;
  minPrice?: number;
  maxPrice?: number;
}
