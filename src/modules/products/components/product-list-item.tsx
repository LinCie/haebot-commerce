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
import { Badge } from "@/components/ui/badge";
import { TableRow, TableCell } from "@/components/ui/table";
import { prefixImageUrl } from "@/shared/libraries/utils";
import { toast } from "sonner";
import {
  formatPrice,
  getStockStatus,
  stockStatusLabels,
} from "@/modules/products/utils";
import placeholderImg from "@/assets/placeholder.jpg";

interface ProductListItemProps {
  product: Product;
}

export function ProductListItem({ product }: ProductListItemProps) {
  const $wishlistProducts = useStore(wishlistProducts);
  const inWishlist = $wishlistProducts.includes(product.id);

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

  // Custom classes to match badge colors from product-card
  const getStockBadgeClass = () => {
    if (stockStatus === "in-stock")
      return "border-transparent bg-green-100 text-green-800 hover:bg-green-100";
    if (stockStatus === "low-stock")
      return "border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
    return "";
  };

  return (
    <TableRow>
      <TableCell>
        <a
          href={`/produk/${product.id}`}
          className="block"
          data-astro-prefetch="true"
        >
          <div className="bg-secondary/50 h-16 w-16 overflow-hidden rounded">
            <img
              src={imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </a>
      </TableCell>
      <TableCell>
        <span className="text-muted-foreground font-mono text-sm tracking-wide">
          {product.sku}
        </span>
      </TableCell>
      <TableCell>
        <a
          href={`/produk/${product.id}`}
          className="hover:text-primary transition-colors"
          data-astro-prefetch="true"
        >
          <div className="font-medium">{product.name}</div>
        </a>
      </TableCell>
      <TableCell>
        <Badge
          variant={stockStatus === "out-of-stock" ? "destructive" : "outline"}
          className={getStockBadgeClass()}
        >
          {stockStatusLabels[stockStatus]}
        </Badge>
      </TableCell>
      <TableCell>
        <span className="text-muted-foreground font-mono text-sm">
          {product.inventories?.reduce((sum, inv) => sum + inv.balance, 0) || 0}
        </span>
      </TableCell>
      <TableCell>
        <span className="text-primary font-mono font-semibold">
          {formatPrice(product.price)}
        </span>
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleToggleWishlist}
            className="h-8 w-8 p-0"
          >
            <Heart
              className={`h-4 w-4 ${inWishlist ? "fill-red-500 text-red-500" : ""}`}
            />
          </Button>
          <Button
            size="sm"
            variant="default"
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={handleAddToCart}
            disabled={stockStatus === "out-of-stock"}
          >
            <ShoppingCart className="mr-1 h-4 w-4" />
            <span className="hidden lg:inline">Tambah</span>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
