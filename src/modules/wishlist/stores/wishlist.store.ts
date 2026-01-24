import { atom } from "nanostores";

export const wishlistProducts = atom<number[]>([]);

export const addToWishlist = (productId: number) => {
  wishlistProducts.set([...wishlistProducts.get(), productId]);
};

export const removeFromWishlist = (productId: number) => {
  wishlistProducts.set(wishlistProducts.get().filter((id) => id !== productId));
};

export const clearWishlist = () => {
  wishlistProducts.set([]);
};
