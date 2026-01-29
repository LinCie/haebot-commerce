import React from "react";
import { Heart, ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "../hooks/use-wishlist";
import { useCart } from "@/modules/cart/hooks/use-cart";
import {
  formatPrice,
  stockStatusLabels,
  getStockStatus,
} from "@/modules/products/utils";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import placeholderImg from "@/assets/placeholder.jpg";
import { prefixImageUrl } from "@/shared/libraries/utils";

export default function WishlistPage() {
  const { items, isLoading, removeItem, clearWishlist } = useWishlist();
  const { addItem: addToCart } = useCart();

  const handleAddToCart = (product: (typeof items)[0]) => {
    addToCart(product.id);
    removeItem(product.id);
    toast.success("Produk dipindahkan ke keranjang", {
      description: product.name,
    });
  };

  const getStockBadgeClass = (status: string) => {
    switch (status) {
      case "in-stock":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "low-stock":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "out-of-stock":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="overflow-hidden rounded-lg border p-4">
              <Skeleton className="mb-4 aspect-square w-full rounded-md" />
              <Skeleton className="mb-2 h-4 w-3/4" />
              <Skeleton className="mb-4 h-4 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-9 flex-1" />
                <Skeleton className="h-9 w-9" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-16 text-center">
        <Heart className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
        <h1 className="text-foreground mb-2 text-2xl font-bold">
          Wishlist Kosong
        </h1>
        <p className="text-muted-foreground mb-6">
          Anda belum menyimpan produk ke wishlist.
        </p>
        <a href="/katalog">
          <Button>
            Jelajahi Produk
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </a>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-foreground text-2xl font-bold md:text-3xl">
          Wishlist Saya
        </h1>
        <Button variant="ghost" size="sm" onClick={clearWishlist}>
          <Trash2 className="mr-2 h-4 w-4" />
          Kosongkan
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((product) => {
          const stockStatus = getStockStatus(product.inventories);
          // Assuming product.images is array of schemas which have 'path'
          const imagePath = product.images?.[0]?.path;
          const imageUrl = imagePath
            ? prefixImageUrl(imagePath, product.images?.[0]?.isNew || false)
            : placeholderImg.src;

          return (
            <div
              key={product.id}
              className="group bg-card text-card-foreground overflow-hidden rounded-lg border shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Image */}
              <a href={`/produk/${product.id}`}>
                <div className="bg-secondary/50 relative aspect-square overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div
                    className={`absolute top-2 right-2 rounded-full px-2 py-1 text-xs font-medium ${getStockBadgeClass(stockStatus)}`}
                  >
                    {stockStatusLabels[stockStatus]}
                  </div>
                </div>
              </a>

              {/* Content */}
              <div className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-muted-foreground font-mono text-xs">
                    {product.sku}
                  </span>
                </div>

                <a href={`/products/${product.sku}`}>
                  <h3 className="text-foreground hover:text-primary mb-1 line-clamp-2 min-h-12 font-medium transition-colors">
                    {product.name}
                  </h3>
                </a>

                <div className="mb-4 text-lg font-bold">
                  {formatPrice(product.price)}
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => handleAddToCart(product)}
                    disabled={stockStatus === "out-of-stock"}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Tambah
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      removeItem(product.id);
                      toast.info("Produk dihapus dari wishlist");
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
