import React from "react";
import { useStore } from "@nanostores/react";
import { ShoppingCart, Heart } from "lucide-react";
import type { Product } from "@/modules/products/schemas/products.schema";
import { addToCart } from "@/modules/cart/stores/cart.store";
import {
  addToWishlist,
  removeFromWishlist,
  wishlistProducts,
} from "@/modules/wishlist/stores/wishlist.store";
import { Button } from "@/components/ui/button";
import { prefixImageUrl } from "@/shared/libraries/utils";

// Helper for formatting price
const formatPrice = (price: string | number) => {
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numPrice);
};

// Helper for stock calculation
const getStockStatus = (inventories: Product["inventories"]) => {
  if (!inventories) return "out-of-stock";
  const totalBalance = inventories.reduce((sum, inv) => sum + inv.balance, 0);
  if (totalBalance <= 0) return "out-of-stock";
  if (totalBalance < 5) return "low-stock";
  return "in-stock";
};

const stockStatusLabels: Record<string, string> = {
  "in-stock": "Tersedia",
  "low-stock": "Stok Menipis",
  "out-of-stock": "Habis",
};

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const $wishlistProducts = useStore(wishlistProducts);
  const inWishlist = $wishlistProducts.includes(product.id);

  const stockStatus = getStockStatus(product.inventories);
  const imageUrl = prefixImageUrl(
    product.images?.[0]?.path || "",
    product.images?.[0]?.isNew || false,
  );

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id);
    console.log("Produk ditambahkan ke keranjang", product.name);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  const getStockBadgeClass = () => {
    const baseClass = "px-2 py-1 text-xs font-semibold rounded-full";
    switch (stockStatus) {
      case "in-stock":
        return `${baseClass} bg-green-100 text-green-800`;
      case "low-stock":
        return `${baseClass} bg-yellow-100 text-yellow-800`;
      case "out-of-stock":
        return `${baseClass} bg-red-100 text-red-800`;
      default:
        return baseClass;
    }
  };

  return (
    <a href={`/produk/${product.id}`} className="block h-full">
      <div className="card-industrial group bg-card text-card-foreground flex h-full flex-col overflow-hidden rounded-lg border transition-shadow hover:shadow-lg">
        {/* Image */}
        <div className="bg-secondary/50 relative aspect-square overflow-hidden">
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-full shadow-md"
              onClick={handleToggleWishlist}
            >
              <Heart
                className={`h-4 w-4 ${inWishlist ? "fill-red-500 text-red-500" : ""}`}
              />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-muted-foreground text-xs">{product.sku}</span>
            <span className={getStockBadgeClass()}>
              {stockStatusLabels[stockStatus]}
            </span>
          </div>

          <h3 className="text-foreground group-hover:text-primary mb-1 line-clamp-2 font-medium transition-colors">
            {product.name}
          </h3>

          <div className="mt-auto flex items-center justify-between">
            <span className="text-lg font-bold">
              {formatPrice(product.price)}
            </span>
            <Button
              size="sm"
              variant="default"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleAddToCart}
              disabled={stockStatus === "out-of-stock"}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </a>
  );
}
