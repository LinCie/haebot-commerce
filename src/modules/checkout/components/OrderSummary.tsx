import React from "react";
import type { Product } from "@/modules/products/schemas/products.schema";
import { formatRupiah } from "@/shared/utils/formatRupiah";
import { ProductList } from "./ProductList";
import { Skeleton } from "@/components/ui/skeleton";

type CartProduct = {
  id: number;
  quantity: number;
};

interface OrderSummaryProps {
  cartItems: CartProduct[];
  products: Product[];
  isLoading: boolean;
  disabled?: boolean;
}

export function OrderSummary({
  cartItems,
  products,
  isLoading,
  disabled = false,
}: OrderSummaryProps) {
  const total = cartItems.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.id);
    const price = parseFloat(product?.price || "0");
    return sum + price * item.quantity;
  }, 0);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-4 w-32" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Ringkasan Pesanan</h2>
        <p className="text-muted-foreground text-sm">
          {cartItems.length} item dalam keranjang
        </p>
      </div>

      <ProductList
        cartItems={cartItems}
        products={products}
        disabled={disabled}
      />

      <div className="border-t pt-4">
        <div className="flex items-center justify-between text-lg font-semibold">
          <span>Total</span>
          <span>{formatRupiah(total)}</span>
        </div>
      </div>
    </div>
  );
}
