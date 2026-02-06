import React, { useState } from "react";
import { actions } from "astro:actions";
import { toast } from "sonner";
import type { OrderResponse } from "../schemas";
import { OrderLookupForm } from "./OrderLookupForm";
import { OrderDetails } from "./OrderDetails";
import { Button } from "@/components/ui/button";

export function OrderLookupPage() {
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLookup = async (number: string, phone: string) => {
    setIsLoading(true);

    try {
      // Step 1: Validate credentials
      const lookupResult = await actions.lookupOrderAction({ number, phone });

      if (lookupResult.error || !lookupResult.data?.success) {
        // Generic error message per SC-3 (no field-specific errors)
        toast.error(
          "Nomor transaksi atau nomor telepon tidak cocok. Silakan periksa kembali data yang Anda masukkan.",
        );
        return;
      }

      // Step 2: Fetch order details using the returned ID
      const orderResult = await actions.getOrderAction({
        id: lookupResult.data.id,
      });

      if (orderResult.error) {
        toast.error(
          "Terjadi kesalahan saat mengambil data pesanan. Silakan coba lagi.",
        );
        return;
      }

      // Check for test transactions (BC-2: no timestamps = test transaction)
      if (!orderResult.data?.timestamps) {
        toast.error(
          "Nomor transaksi atau nomor telepon tidak cocok. Silakan periksa kembali data yang Anda masukkan.",
        );
        return;
      }

      setOrder(orderResult.data);
    } catch {
      toast.error("Terjadi kesalahan jaringan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setOrder(null);
  };

  if (order) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={handleReset} className="mb-4">
          ← Cari Pesanan Lain
        </Button>
        <OrderDetails order={order} />
      </div>
    );
  }

  return <OrderLookupForm onSubmit={handleLookup} isLoading={isLoading} />;
}
