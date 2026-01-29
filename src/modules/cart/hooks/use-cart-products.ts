import { useStore } from "@nanostores/react";
import { useEffect, useRef, useState } from "react";
import { actions } from "astro:actions";
import { cartProducts, updateQuantity } from "../stores/cart.store";
import type { Product } from "@/modules/products/schemas";
import { getTotalStock } from "@/modules/products/utils";

export const useCartProducts = () => {
  const cartItems = useStore(cartProducts);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a stable string key to track when IDs actually change
  const cartIds = cartItems.map((item) => item.id);
  const idsKey = [...cartIds].sort((a, b) => a - b).join(",");

  // Track the previous IDs key to determine if we need to fetch
  const previousIdsKeyRef = useRef<string | null>(null);

  useEffect(() => {
    // Only fetch if the IDs have actually changed (not just quantities)
    if (previousIdsKeyRef.current === idsKey && products.length > 0) {
      return;
    }

    const fetchProducts = async () => {
      if (cartIds.length === 0) {
        setProducts([]);
        previousIdsKeyRef.current = idsKey;
        return;
      }

      // Only show loading on initial load, not when we already have products
      if (products.length === 0) {
        setIsLoading(true);
      }

      setError(null);
      try {
        const { data, error } = await actions.batchReadProductsAction({
          ids: cartIds,
          withInventory: true,
        });

        if (error) {
          setError(error.message);
          return;
        }

        if (data?.data) {
          setProducts(data.data);

          // Auto-clamp quantities that exceed current stock
          const currentCart = cartProducts.get();
          data.data.forEach((product) => {
            const cartItem = currentCart.find((item) => item.id === product.id);
            if (cartItem) {
              const maxStock = getTotalStock(product.inventories);
              if (cartItem.quantity > maxStock) {
                // Clamp to max stock (or remove if stock is 0)
                updateQuantity(product.id, maxStock);
              }
            }
          });
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch cart products",
        );
      } finally {
        setIsLoading(false);
        previousIdsKeyRef.current = idsKey;
      }
    };

    fetchProducts();
  }, [idsKey]); // Only re-fetch when the set of IDs changes

  return {
    products,
    isLoading,
    error,
  };
};
