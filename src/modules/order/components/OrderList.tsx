import React from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import type { Transaction } from "@/modules/checkout/schemas/transaction.schema";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/shared/libraries/utils";

interface OrderListProps {
  orders: Transaction[];
  selectedId: number | null;
  onSelect: (order: Transaction) => void;
}

const statusLabels: Record<string, string> = {
  TX_DRAFT: "Draft",
  TX_REQUEST: "Diproses",
  TX_READY: "Siap Kirim",
  TX_SENT: "Dikirim",
  TX_RECEIVED: "Diterima",
  TX_COMPLETED: "Selesai",
  TX_CANCELED: "Dibatalkan",
  TX_RETURN: "Retur",
  TX_CLOSED: "Ditutup",
};

const statusVariants: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  TX_DRAFT: "secondary",
  TX_REQUEST: "default",
  TX_READY: "default",
  TX_SENT: "default",
  TX_RECEIVED: "default",
  TX_COMPLETED: "default",
  TX_CANCELED: "destructive",
  TX_RETURN: "destructive",
  TX_CLOSED: "secondary",
};

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return format(dateObj, "dd MMM yyyy, HH:mm", { locale: id });
  } catch {
    return "-";
  }
}

export function OrderList({ orders, selectedId, onSelect }: OrderListProps) {
  // Sort by createdAt descending (newest first)
  const sortedOrders = [...orders].sort((a, b) => {
    const dateA = a.timestamps?.createdAt
      ? new Date(a.timestamps.createdAt).getTime()
      : 0;
    const dateB = b.timestamps?.createdAt
      ? new Date(b.timestamps.createdAt).getTime()
      : 0;
    return dateB - dateA;
  });

  return (
    <div className="space-y-2">
      {sortedOrders.map((order) => {
        const isSelected = selectedId === order.id;
        const total = parseFloat(order.total) || 0;

        return (
          <button
            key={order.id}
            onClick={() => onSelect(order)}
            className={cn(
              "hover:bg-muted/50 w-full rounded-lg border p-4 text-left transition-colors",
              isSelected && "border-primary bg-primary/5",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{order.number}</p>
                <p className="text-muted-foreground text-sm">
                  {formatDate(order.timestamps?.createdAt)}
                </p>
              </div>
              <Badge
                variant={statusVariants[order.status as string] || "outline"}
              >
                {statusLabels[order.status as string] || order.status}
              </Badge>
            </div>
            <p className="mt-2 text-sm font-medium">
              Total: Rp {total.toLocaleString("id-ID")}
            </p>
          </button>
        );
      })}
    </div>
  );
}
