import { persistentAtom } from "@nanostores/persistent";

export const wishlistProducts = persistentAtom<number[]>("wishlist", [], {
  encode: JSON.stringify,
  decode: JSON.parse,
});

export const addToWishlist = (productId: number) => {
  wishlistProducts.set([...wishlistProducts.get(), productId]);
};

export const removeFromWishlist = (productId: number) => {
  wishlistProducts.set(wishlistProducts.get().filter((id) => id !== productId));
};

export const clearWishlist = () => {
  wishlistProducts.set([]);
};
