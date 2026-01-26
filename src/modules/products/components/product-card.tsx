import React from "react";
import { useStore } from "@nanostores/react";
import { ShoppingCart, Heart } from "lucide-react";
import type { Product } from "@/modules/products/schemas/products.schema";
import { addToCart, cartProducts } from "@/modules/cart/stores/cart.store";
import {
  addToWishlist,
  removeFromWishlist,
  wishlistProducts,
} from "@/modules/wishlist/stores/wishlist.store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { prefixImageUrl } from "@/shared/libraries/utils";
import placeholderImg from "@/assets/placeholder.jpg";
import { toast } from "sonner";
import {
  formatPrice,
  getStockStatus,
  stockStatusLabels,
} from "@/modules/products/utils";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const $wishlistProducts = useStore(wishlistProducts);
  const inWishlist = $wishlistProducts.includes(product.id);

  const $cartProducts = useStore(cartProducts);
  const cartItem = $cartProducts.find((item) => item.id === product.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const stockStatus = getStockStatus(product.inventories);
  const imagePath = product.images?.[0]?.path;
  const imageUrl = imagePath
    ? prefixImageUrl(imagePath, product.images?.[0]?.isNew || false)
    : placeholderImg.src;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id);
    toast.success("Produk ditambahkan ke keranjang", {
      description: product.name,
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(product.id);
      toast.info("Produk dihapus dari wishlist");
    } else {
      addToWishlist(product.id);
      toast.success("Produk ditambahkan ke wishlist");
    }
  };

  return (
    <div className="card-industrial group bg-card text-card-foreground relative flex h-full flex-col overflow-hidden rounded-lg border transition-shadow hover:shadow-lg">
      <a
        href={`/produk/${product.id}`}
        className="absolute inset-0 z-0 focus:outline-none"
        aria-label={`Lihat detail ${product.name}`}
      >
        <span className="sr-only">Lihat detail {product.name}</span>
      </a>

      {/* Image */}
      <div className="bg-secondary/50 relative aspect-square overflow-hidden">
        <img
          src={imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          fetchPriority="low"
        />
        <div className="absolute top-2 right-2 z-10 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 rounded-full shadow-md"
            onClick={handleToggleWishlist}
            aria-label={
              inWishlist ? "Hapus dari wishlist" : "Tambah ke wishlist"
            }
          >
            <Heart
              className={`h-4 w-4 ${inWishlist ? "fill-red-500 text-red-500" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="pointer-events-none flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-muted-foreground text-xs">{product.sku}</span>
          <Badge
            variant={stockStatus === "out-of-stock" ? "destructive" : "outline"}
            className={
              stockStatus === "in-stock"
                ? "border-transparent bg-green-100 text-green-800 hover:bg-green-100"
                : stockStatus === "low-stock"
                  ? "border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                  : ""
            }
          >
            {stockStatus === "out-of-stock"
              ? stockStatusLabels[stockStatus]
              : `Stok: ${product.inventories?.reduce((sum, inv) => sum + inv.balance, 0) || 0}`}
          </Badge>
        </div>

        <h3 className="text-foreground group-hover:text-primary mb-1 line-clamp-2 font-medium transition-colors">
          {product.name}
        </h3>

        <div className="pointer-events-auto mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            {product.price_discount && Number(product.price_discount) > 0 ? (
              <>
                <span className="text-primary text-xl font-bold">
                  {formatPrice(product.price_discount)}
                </span>
                <span className="text-muted-foreground text-xs line-through">
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          <Button
            size="sm"
            variant="default"
            className="bg-primary text-primary-foreground hover:bg-primary/90 relative z-10"
            onClick={handleAddToCart}
            disabled={stockStatus === "out-of-stock"}
            aria-label={`Tambah ${product.name} ke keranjang`}
          >
            <ShoppingCart className="h-4 w-4" />
            {quantityInCart > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full p-0 text-[10px]"
              >
                {quantityInCart}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
