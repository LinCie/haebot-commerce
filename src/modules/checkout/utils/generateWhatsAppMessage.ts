import type { Product } from "@/modules/products/schemas/products.schema";
import { formatRupiah } from "@/shared/utils/formatRupiah";

type CartProduct = {
  id: number;
  quantity: number;
};

type addressesData = {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

type PlayersData = {
  name: string;
  phone: string;
  email: string;
};

type CustomerData = {
  addresses: addressesData;
  players: PlayersData;
  notes?: string;
};

export function generateWhatsAppMessage(
  transactionNumber: string,
  cartItems: CartProduct[],
  products: Product[],
  customerData: CustomerData,
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

  const { players, addresses, notes } = customerData;

  return `Halo! Saya ingin memesan:

[Order #${transactionNumber}]

---
${productLines}
---

Total: ${formatRupiah(total)}

Informasi Pelanggan:
Nama: ${players.name}
Telepon: ${players.phone}
Email: ${players.email}
Alamat: ${addresses.street}
Kota: ${addresses.city}
Provinsi: ${addresses.state}
Kode Pos: ${addresses.zip}${notes ? `\nCatatan: ${notes}` : ""}`;
}
