import React from "react";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/modules/cart/hooks/use-cart";
import { useCartProducts } from "@/modules/cart/hooks/use-cart-products";
import { formatPrice, getTotalStock } from "@/modules/products/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { prefixImageUrl } from "@/shared/libraries/utils";
import placeholderImg from "@/assets/placeholder.jpg";

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCart();
  const { products, isLoading } = useCartProducts();

  // Combine cart items with product details
  const cartItemsWithDetails = items
    .map((item) => {
      const product = products.find((p) => p.id === item.id);
      return {
        ...item,
        product,
      };
    })
    .filter((item) => item.product !== undefined);

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 rounded-lg border p-4">
                <Skeleton className="h-24 w-24 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="mt-4 h-8 w-32" />
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-16 text-center">
        <ShoppingBag className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
        <h1 className="text-foreground mb-2 text-2xl font-bold">
          Keranjang Kosong
        </h1>
        <p className="text-muted-foreground mb-6">
          Anda belum menambahkan produk ke keranjang.
        </p>
        <a href="/katalog">
          <Button>
            Mulai Belanja
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </a>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-foreground mb-8 text-2xl font-bold md:text-3xl">
        Keranjang Belanja
      </h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="space-y-4 lg:col-span-2">
          {cartItemsWithDetails.map((item) => {
            if (!item.product) return null;

            const imagePath = item.product.images?.[0]?.path;
            const imageUrl = imagePath
              ? prefixImageUrl(
                  imagePath,
                  item.product.images?.[0].isNew || false,
                )
              : placeholderImg.src;
            const price = parseFloat(item.product.price);
            const maxStock = getTotalStock(item.product.inventories);
            const isAtMaxStock = item.quantity >= maxStock;
            const isAtMinQuantity = item.quantity <= 1;

            return (
              <div
                key={item.id}
                className="bg-card text-card-foreground flex flex-col gap-4 rounded-lg border p-4 sm:flex-row"
              >
                {/* Product Image */}
                <a href={`/produk/${item.id}`} className="shrink-0">
                  <div className="bg-secondary/50 h-24 w-full overflow-hidden rounded sm:w-24">
                    <img
                      src={imageUrl}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </a>

                {/* Product Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-muted-foreground font-mono text-xs">
                        {item.product.sku}
                      </span>
                      <a href={`/produk/${item.id}`}>
                        <h3 className="text-foreground hover:text-primary line-clamp-1 font-medium transition-colors">
                          {item.product.name}
                        </h3>
                      </a>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    {/* Quantity Controls */}
                    <div className="border-border flex items-center rounded-md border">
                      <button
                        className="hover:bg-secondary p-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        disabled={isAtMinQuantity}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-4 font-mono text-sm">
                        {item.quantity}
                      </span>
                      <button
                        className="hover:bg-secondary p-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        disabled={isAtMaxStock}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <div className="font-bold">
                        {formatPrice(price * item.quantity)}
                      </div>
                      {item.quantity > 1 && (
                        <div className="text-muted-foreground font-mono text-xs">
                          @ {formatPrice(price)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={clearCart}>
              <Trash2 className="mr-2 h-4 w-4" />
              Kosongkan Keranjang
            </Button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-card text-card-foreground sticky top-24 rounded-lg border p-6">
            <h2 className="text-foreground mb-4 text-lg font-semibold">
              Ringkasan Pesanan
            </h2>

            <div className="mb-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Subtotal ({items.reduce((acc, i) => acc + i.quantity, 0)}{" "}
                  item)
                </span>
                <span className="font-mono">
                  {formatPrice(getTotal(products))}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ongkos Kirim</span>
                <span className="text-muted-foreground italic">
                  Dihitung saat checkout
                </span>
              </div>
            </div>

            <div className="border-border mb-6 border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="text-foreground font-semibold">Total</span>
                <span className="text-xl font-bold">
                  {formatPrice(getTotal(products))}
                </span>
              </div>
            </div>

            <a href="/bayar">
              <Button className="w-full" size="lg">
                Lanjut ke Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>

            <p className="text-muted-foreground mt-4 text-center text-xs">
              Pembayaran akan diproses melalui WhatsApp
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
