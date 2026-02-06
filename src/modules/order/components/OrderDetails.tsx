import React from "react";
import type { OrderResponse } from "../schemas";
import { Badge } from "@/components/ui/badge";
import { OrderTimestamps } from "./OrderTimestamps";
import { OrderProductList } from "./OrderProductList";

interface OrderDetailsProps {
  order: OrderResponse;
}

const statusLabels: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  TX_DRAFT: { label: "Draft", variant: "secondary" },
  TX_REQUEST: { label: "Diproses", variant: "default" },
  TX_READY: { label: "Siap Kirim", variant: "default" },
  TX_SENT: { label: "Dikirim", variant: "default" },
  TX_RECEIVED: { label: "Diterima", variant: "default" },
  TX_COMPLETED: { label: "Selesai", variant: "default" },
  TX_CANCELED: { label: "Dibatalkan", variant: "destructive" },
  TX_RETURN: { label: "Retur", variant: "destructive" },
  TX_CLOSED: { label: "Ditutup", variant: "secondary" },
};

export function OrderDetails({ order }: OrderDetailsProps) {
  const statusInfo = statusLabels[order.status] || {
    label: order.status,
    variant: "outline" as const,
  };

  return (
    <div className="space-y-6">
      {/* Order Header */}
      <div className="bg-card rounded-lg border p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-muted-foreground text-sm">Nomor Transaksi</p>
            <p className="text-lg font-semibold">{order.number}</p>
          </div>
          <Badge variant={statusInfo.variant} className="w-fit">
            {statusInfo.label}
          </Badge>
        </div>
      </div>

      {/* Timestamps */}
      {order.timestamps && <OrderTimestamps timestamps={order.timestamps} />}

      {/* Products */}
      <div className="bg-card rounded-lg border p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">Produk Dipesan</h3>
        {order.details && order.details.length > 0 ? (
          <OrderProductList products={order.details} />
        ) : (
          <p className="text-muted-foreground">
            Tidak ada produk dalam pesanan ini.
          </p>
        )}
      </div>
    </div>
  );
}
