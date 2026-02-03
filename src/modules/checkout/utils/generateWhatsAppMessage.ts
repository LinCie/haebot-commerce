import type { Product } from "@/modules/products/schemas/products.schema";
import { formatRupiah } from "@/shared/utils/formatRupiah";

type CartProduct = {
  id: number;
  quantity: number;
};

export function generateWhatsAppMessage(
  transactionNumber: string,
  cartItems: CartProduct[],
  products: Product[],
  customerInfo: string,
): string {
  const productLines = cartItems
    .map((item) => {
      const product = products.find((p) => p.id === item.id);
      const price = parseFloat(product?.price || "0");
      return `${product?.name} - ${item.quantity} x ${formatRupiah(price)}`;
    })
    .join("\n");

  const total = cartItems.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.id);
    const price = parseFloat(product?.price || "0");
    return sum + price * item.quantity;
  }, 0);

  return `Halo! Saya ingin memesan:

[Order #${transactionNumber}]

---
${productLines}
---

Total: ${formatRupiah(total)}

Informasi Pelanggan:
${customerInfo}`;
}
