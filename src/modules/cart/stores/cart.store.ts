import { persistentAtom } from "@nanostores/persistent";

type CartProduct = {
  id: number;
  quantity: number;
};

export const cartProducts = persistentAtom<CartProduct[]>("cart", [], {
  encode: JSON.stringify,
  decode: JSON.parse,
});

export const addToCart = (productId: number) => {
  const cart = cartProducts.get();
  const existingProduct = cart.find((product) => product.id === productId);

  if (existingProduct) {
    existingProduct.quantity += 1;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }

  cartProducts.set([...cart]);
};

export const removeFromCart = (productId: number) => {
  const cart = cartProducts.get();
  const updatedCart = cart.filter((product) => product.id !== productId);
  cartProducts.set(updatedCart);
};

export const updateQuantity = (productId: number, quantity: number) => {
  const cart = cartProducts.get();
  const existingProduct = cart.find((product) => product.id === productId);

  if (existingProduct) {
    // Enforce minimum quantity of 1 - use delete button to remove
    const clampedQuantity = Math.max(1, quantity);
    const updatedCart = cart.map((item) =>
      item.id === productId ? { ...item, quantity: clampedQuantity } : item,
    );
    cartProducts.set(updatedCart);
  }
};

export const clearCart = () => {
  cartProducts.set([]);
};
