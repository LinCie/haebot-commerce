import React from "react";

interface Product {
  id: number;
  name: string;
  quantity: number;
  price: number;
  sku?: string;
  item?: {
    name: string;
    sku: string;
  } | null;
}

interface OrderProductListProps {
  products: Product[];
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function OrderProductList({ products }: OrderProductListProps) {
  return (
    <div className="space-y-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0"
        >
          <div className="flex-1">
            <p className="font-medium">
              {product.name || product.item?.name || "Produk"}
            </p>
            {product.sku && (
              <p className="text-muted-foreground text-sm">
                SKU: {product.sku}
              </p>
            )}
            <p className="text-muted-foreground text-sm">
              {product.quantity} x {formatPrice(product.price)}
            </p>
          </div>
          <div className="text-right">
            <p className="font-semibold">
              {formatPrice(product.price * product.quantity)}
            </p>
          </div>
        </div>
      ))}

      {/* Total */}
      <div className="flex items-center justify-between border-t pt-4">
        <span className="font-semibold">Total</span>
        <span className="text-lg font-bold">
          {formatPrice(
            products.reduce((sum, p) => sum + p.price * p.quantity, 0),
          )}
        </span>
      </div>
    </div>
  );
}
