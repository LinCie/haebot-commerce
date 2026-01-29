import { useStore } from "@nanostores/react";
import {
  addToCart,
  cartProducts,
  removeFromCart,
  clearCart,
} from "../stores/cart.store";

export const useCart = () => {
  const items = useStore(cartProducts);

  return {
    items,
    addItem: addToCart,
    removeItem: removeFromCart,
    clearCart,
    count: items.reduce((acc, item) => acc + item.quantity, 0),
  };
};
