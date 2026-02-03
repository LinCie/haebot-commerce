import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Product } from "@/modules/products/schemas/products.schema";
import {
  updateQuantity,
  removeFromCart,
} from "@/modules/cart/stores/cart.store";
import { formatRupiah } from "@/shared/utils/formatRupiah";
import { Trash2, Minus, Plus } from "lucide-react";

type CartProduct = {
  id: number;
  quantity: number;
};

interface ProductListProps {
  cartItems: CartProduct[];
  products: Product[];
  disabled?: boolean;
}

export function ProductList({
  cartItems,
  products,
  disabled = false,
}: ProductListProps) {
  const getStock = (product: Product): number => {
    if (!product.inventories || product.inventories.length === 0) return 0;
    return product.inventories.reduce((sum, inv) => sum + inv.balance, 0);
  };

  const handleIncrement = (
    productId: number,
    currentQty: number,
    stock: number,
  ) => {
    if (currentQty < stock) {
      updateQuantity(productId, currentQty + 1);
    }
  };

  const handleDecrement = (productId: number, currentQty: number) => {
    if (currentQty > 1) {
      updateQuantity(productId, currentQty - 1);
    }
  };

  const handleQuantityChange = (
    productId: number,
    value: string,
    stock: number,
  ) => {
    const qty = parseInt(value) || 1;
    const clampedQty = Math.min(Math.max(qty, 1), stock);
    updateQuantity(productId, clampedQty);
  };

  return (
    <div className="space-y-4">
      {cartItems.map((item) => {
        const product = products.find((p) => p.id === item.id);
        if (!product) return null;

        const price = parseFloat(product.price || "0");
        const stock = getStock(product);
        const subtotal = price * item.quantity;

        return (
          <div
            key={item.id}
            className="flex items-center gap-4 rounded-lg border p-4"
          >
            <div className="flex-1">
              <h3 className="font-medium">{product.name}</h3>
              <p className="text-muted-foreground text-sm">
                {formatRupiah(price)} × {item.quantity}
              </p>
              <p className="text-muted-foreground text-xs">
                Stok tersedia: {stock}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleDecrement(item.id, item.quantity)}
                disabled={disabled || item.quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>

              <Input
                type="number"
                value={item.quantity}
                onChange={(e) =>
                  handleQuantityChange(item.id, e.target.value, stock)
                }
                disabled={disabled}
                className="w-16 text-center"
                min={1}
                max={stock}
              />

              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleIncrement(item.id, item.quantity, stock)}
                disabled={disabled || item.quantity >= stock}
              >
                <Plus className="h-4 w-4" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeFromCart(item.id)}
                disabled={disabled}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-right">
              <p className="font-semibold">{formatRupiah(subtotal)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
