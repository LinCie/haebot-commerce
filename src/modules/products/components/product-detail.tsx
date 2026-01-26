import React, { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import {
  ShoppingCart,
  Heart,
  ArrowLeft,
  Package,
  Shield,
  Clock,
} from "lucide-react";
import type { Product } from "@/modules/products/schemas/products.schema";
import { addToCart, cartProducts } from "@/modules/cart/stores/cart.store";
import {
  addToWishlist,
  removeFromWishlist,
  wishlistProducts,
} from "@/modules/wishlist/stores/wishlist.store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { prefixImageUrl } from "@/shared/libraries/utils";
import placeholderImg from "@/assets/placeholder.jpg";
import { toast } from "sonner";
import { RichTextRenderer } from "@/components/ui/rich-text-renderer";
import {
  formatPrice,
  getStockStatus,
  stockStatusLabels,
} from "@/modules/products/utils";

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    // Update current state when carousel scrolls
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const handleThumbnailClick = (index: number) => {
    if (api) {
      api.scrollTo(index);
    }
  };

  const $wishlistProducts = useStore(wishlistProducts);
  const inWishlist = $wishlistProducts.includes(product.id);

  const $cartProducts = useStore(cartProducts);
  const cartItem = $cartProducts.find((item) => item.id === product.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const stockStatus = getStockStatus(product.inventories);
  const stockQuantity =
    product.inventories?.reduce((sum, inv) => sum + inv.balance, 0) ?? 0;

  const handleAddToCart = () => {
    if (quantityInCart + quantity > stockQuantity) {
      toast.error("Gagal menambahkan ke keranjang", {
        description: `Stok tidak mencukupi. Tersisa ${stockQuantity} unit.`,
      });
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addToCart(product.id);
    }
    toast.success("Produk ditambahkan ke keranjang", {
      description: `${quantity}x ${product.name}`,
    });
  };

  const handleToggleWishlist = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
      toast.info("Produk dihapus dari wishlist");
    } else {
      addToWishlist(product.id);
      toast.success("Produk ditambahkan ke wishlist");
    }
  };

  const getStockBadgeClass = () => {
    switch (stockStatus) {
      case "in-stock":
        return "border-transparent bg-green-100 text-green-800 hover:bg-green-100";
      case "low-stock":
        return "border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "out-of-stock":
        return "";
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 pt-8 pb-32">
      {/* Breadcrumb */}
      <a
        href="/katalog"
        className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center text-sm"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kembali ke Katalog
      </a>

      <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
        {/* Product Image */}
        {/* Product Image Carousel */}
        <div className="flex min-w-0 flex-col gap-4">
          <div className="bg-secondary/50 relative aspect-square overflow-hidden rounded-lg">
            {product.images && product.images.length > 0 ? (
              <Carousel
                setApi={setApi}
                opts={{
                  loop: true,
                }}
                plugins={[
                  Autoplay({
                    delay: 4000,
                  }),
                ]}
                className="h-full w-full"
              >
                <CarouselContent>
                  {product.images.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="relative aspect-square h-full w-full">
                        <img
                          src={prefixImageUrl(image.path, image.isNew || false)}
                          alt={`${product.name} - Image ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            ) : (
              <img
                src={placeholderImg.src}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            )}
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 0 && (
            <div className="scrollbar-hide flex w-full gap-2 overflow-x-auto pb-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => handleThumbnailClick(index)}
                  className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-md border-2 transition-all ${
                    current === index
                      ? "border-primary"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={prefixImageUrl(image.path, image.isNew || false)}
                    alt={`Thumbnail ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="mb-4 flex items-center gap-3">
            <span className="text-muted-foreground font-mono text-base">
              {product.sku}
            </span>
            <Badge
              variant={
                stockStatus === "out-of-stock" ? "destructive" : "outline"
              }
              className={getStockBadgeClass()}
            >
              {stockStatusLabels[stockStatus]}
            </Badge>
          </div>

          <h1 className="text-foreground mb-2 text-2xl font-bold lg:text-3xl">
            {product.name}
          </h1>

          {/* Price */}
          <div className="mb-6">
            {product.price_discount && Number(product.price_discount) > 0 ? (
              <div className="flex items-center gap-3">
                <span className="text-primary text-3xl font-bold">
                  {formatPrice(product.price_discount)}
                </span>
                <span className="text-muted-foreground text-lg line-through">
                  {formatPrice(product.price)}
                </span>
              </div>
            ) : (
              <span className="text-primary text-3xl font-bold">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Stock Info */}
          {stockStatus !== "out-of-stock" && (
            <p className="text-muted-foreground mb-6 text-sm">
              Stok tersedia:{" "}
              <span className="font-mono font-medium">{stockQuantity}</span>{" "}
              unit
            </p>
          )}

          {/* Quantity and Add to Cart */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="border-border flex w-fit items-center rounded-md border">
              <button
                type="button"
                className="hover:bg-secondary px-4 py-2 transition-colors"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                aria-label="Kurangi jumlah"
              >
                -
              </button>
              <Input
                type="number"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="w-16 [appearance:textfield] border-0 text-center font-mono [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                min={1}
                max={stockQuantity}
              />
              <button
                type="button"
                className="hover:bg-secondary px-4 py-2 transition-colors"
                onClick={() =>
                  setQuantity(Math.min(stockQuantity, quantity + 1))
                }
                aria-label="Tambah jumlah"
              >
                +
              </button>
            </div>

            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 sm:flex-1"
              onClick={handleAddToCart}
              disabled={stockStatus === "out-of-stock"}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Tambah ke Keranjang
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

          <Button
            variant="outline"
            size="lg"
            className="mb-8 w-full"
            onClick={handleToggleWishlist}
          >
            <Heart
              className={`mr-2 h-5 w-5 ${inWishlist ? "fill-red-500 text-red-500" : ""}`}
            />
            {inWishlist ? "Hapus dari Wishlist" : "Simpan ke Wishlist"}
          </Button>

          {/* Trust Badges */}
          <div className="bg-secondary/30 grid grid-cols-3 gap-4 rounded-lg p-4">
            <div className="text-center">
              <Package className="text-primary mx-auto mb-2 h-6 w-6" />
              <p className="text-muted-foreground text-xs">Pengiriman Aman</p>
            </div>
            <div className="text-center">
              <Shield className="text-primary mx-auto mb-2 h-6 w-6" />
              <p className="text-muted-foreground text-xs">Garansi Resmi</p>
            </div>
            <div className="text-center">
              <Clock className="text-primary mx-auto mb-2 h-6 w-6" />
              <p className="text-muted-foreground text-xs">Respon Cepat</p>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-12">
        <Tabs defaultValue="description" className="w-full">
          <TabsList variant="line" className="w-full justify-start">
            <TabsTrigger value="description">Deskripsi</TabsTrigger>
            <TabsTrigger value="specs">Spesifikasi Teknis</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-6">
            {product.description ? (
              <RichTextRenderer
                editorState={product.description}
                className="max-w-none"
              />
            ) : (
              <p className="text-foreground leading-relaxed">
                Tidak ada deskripsi tersedia.
              </p>
            )}
          </TabsContent>

          <TabsContent value="specs" className="mt-6">
            <div className="overflow-x-auto">
              <table className="w-full max-w-2xl">
                <tbody>
                  {product.weight && (
                    <tr className="border-border border-b">
                      <td className="text-muted-foreground py-3 pr-4 font-medium">
                        Berat
                      </td>
                      <td className="text-foreground py-3 font-mono">
                        {product.weight}g
                      </td>
                    </tr>
                  )}
                  <tr className="border-border border-b">
                    <td className="text-muted-foreground py-3 pr-4 font-medium">
                      SKU
                    </td>
                    <td className="text-foreground py-3 font-mono">
                      {product.sku}
                    </td>
                  </tr>
                  {product.code && (
                    <tr className="border-border border-b">
                      <td className="text-muted-foreground py-3 pr-4 font-medium">
                        Kode
                      </td>
                      <td className="text-foreground py-3 font-mono">
                        {product.code}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
