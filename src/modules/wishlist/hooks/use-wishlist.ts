import { useStore } from "@nanostores/react";
import { useEffect, useState } from "react";
import { actions } from "astro:actions";
import {
  wishlistProducts,
  removeFromWishlist,
  clearWishlist,
} from "../stores/wishlist.store";
import type { Product } from "@/modules/products/schemas";

export const useWishlist = () => {
  const wishlistIds = useStore(wishlistProducts);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      if (wishlistIds.length === 0) {
        setProducts([]);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const { data, error } = await actions.batchReadProductsAction({
          ids: wishlistIds,
          withInventory: true,
        });

        if (error) {
          setError(error.message);
          return;
        }

        if (data?.data) {
          setProducts(data.data);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch wishlist products",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [wishlistIds]);

  return {
    items: products,
    ids: wishlistIds,
    isLoading,
    error,
    removeItem: removeFromWishlist,
    clearWishlist,
  };
};
