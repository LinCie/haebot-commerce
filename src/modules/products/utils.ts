import type { Product } from "@/modules/products/schemas/products.schema";

// Helper for formatting price
export const formatPrice = (price: string | number) => {
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numPrice);
};

// Helper for stock calculation
export const getStockStatus = (inventories: Product["inventories"]) => {
  if (!inventories) return "out-of-stock";
  const totalBalance = inventories.reduce((sum, inv) => sum + inv.balance, 0);
  if (totalBalance <= 0) return "out-of-stock";
  if (totalBalance < 5) return "low-stock";
  return "in-stock";
};

export const stockStatusLabels: Record<string, string> = {
  "in-stock": "Tersedia",
  "low-stock": "Stok Menipis",
  "out-of-stock": "Habis",
};

export const categoryLabels: Record<string, string> = {
  milling: "Milling",
  turning: "Turning",
  "spare-parts": "Spare Parts",
  tooling: "Tooling",
};
