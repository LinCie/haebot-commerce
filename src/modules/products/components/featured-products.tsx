import * as React from "react";
import { type ActionError, actions } from "astro:actions";
import type { Product } from "../schemas";
import { ProductCard } from "./product-card";
import { ProductCardSkeleton } from "./product-card-skeleton";

export function FeaturedProducts() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [error, setError] = React.useState<ActionError>();
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);

      const { data, error } = await actions.getProductsAction({
        type: "full",
        status: "active",
        limit: 8,
        withInventory: true,
      });

      if (error) {
        setError(error);
        return;
      }

      if (data) {
        setProducts(data.data);
      }

      setLoading(false);
    };
    fetchProducts();
  }, []);

  return loading ? (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  ) : error ? (
    <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-500">
      Error loading products: {error.message}
    </div>
  ) : (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
      {products.length === 0 && (
        <p className="col-span-full py-10 text-center text-gray-500">
          Belum ada produk unggulan.
        </p>
      )}
    </div>
  );
}
