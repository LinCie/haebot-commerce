import { useStore } from "@nanostores/react";
import {
  addToCart,
  cartProducts,
  removeFromCart,
  updateQuantity,
  clearCart,
} from "../stores/cart.store";

export const useCart = () => {
  const items = useStore(cartProducts);

  return {
    items,
    addItem: addToCart,
    removeItem: removeFromCart,
    updateQuantity,
    clearCart,
    count: items.reduce((acc, item) => acc + item.quantity, 0),
    getTotal: (products: { id: number; price: string }[]) => {
      return items.reduce((total, item) => {
        const product = products.find((p) => p.id === item.id);
        if (product) {
          return total + parseFloat(product.price) * item.quantity;
        }
        return total;
      }, 0);
    },
  };
};
