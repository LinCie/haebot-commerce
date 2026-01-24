import { atom } from "nanostores";

export const cartProducts = atom<number[]>([]);

export const addToCart = (productId: number) => {
  cartProducts.set([...cartProducts.get(), productId]);
};

export const removeFromCart = (productId: number) => {
  cartProducts.set(cartProducts.get().filter((id) => id !== productId));
};

export const clearCart = () => {
  cartProducts.set([]);
};
