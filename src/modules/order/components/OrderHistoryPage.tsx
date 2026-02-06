import React, { useEffect, useState } from "react";
import { actions } from "astro:actions";
import { toast } from "sonner";
import type { Transaction } from "@/modules/checkout/schemas/transaction.schema";
import { OrderList } from "./OrderList";
import { EmptyOrderHistory } from "./EmptyOrderHistory";
import { getOrderHistory } from "../stores/order-history.store";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderDetails } from "./OrderDetails";
import type { OrderResponse } from "../schemas";

// Transform Transaction to OrderResponse format
function transformTransactionToOrderResponse(tx: Transaction): OrderResponse {
  return {
    number: tx.number,
    status: tx.status as OrderResponse["status"],
    timestamps: tx.timestamps
      ? {
          createdAt: tx.timestamps.createdAt?.toISOString() || null,
          packagedAt: tx.timestamps.packagedAt?.toISOString() || null,
          shippedAt: tx.timestamps.shippedAt?.toISOString() || null,
          deliveredAt: tx.timestamps.deliveredAt?.toISOString() || null,
          cancelledAt: tx.timestamps.cancelledAt?.toISOString() || null,
          completedAt: tx.timestamps.completedAt?.toISOString() || null,
        }
      : null,
    details:
      tx.details?.map((detail) => ({
        id: detail.id,
        model_type: detail.model_type || "",
        sku: detail.sku || "",
        name: detail.name || "",
        quantity: detail.quantity,
        price: detail.price,
        discount: detail.discount,
        weight: detail.weight,
        debit: detail.debit,
        credit: detail.credit,
        notes: detail.notes || null,
        item: detail.item
          ? {
              id: detail.item.id,
              name: detail.item.name,
              sku: detail.item.sku || "",
              cost: detail.item.cost,
              price: detail.item.price,
            }
          : null,
      })) || [],
  };
}

export function OrderHistoryPage() {
  const [orders, setOrders] = useState<Transaction[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasHistory, setHasHistory] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const history = getOrderHistory();

    if (history.length === 0) {
      setHasHistory(false);
      setIsLoading(false);
      return;
    }

    setHasHistory(true);
    setIsLoading(true);

    try {
      const ids = history.map((item) => item.tradeId);

      const result = await actions.getOrdersBatchAction({ ids });

      if (result.error) {
        toast.error("Gagal memuat riwayat pesanan. Silakan coba lagi.");
        return;
      }

      if (result.data?.orders) {
        setOrders(result.data.orders);
        if (result.data.orders.length > 0) {
          setSelectedOrder(result.data.orders[0]);
        }
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBrowseProducts = () => {
    window.location.href = "/katalog";
  };

  if (!hasHistory) {
    return <EmptyOrderHistory onBrowseProducts={handleBrowseProducts} />;
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <h2 className="mb-4 text-lg font-semibold">Daftar Pesanan</h2>
        <OrderList
          orders={orders}
          selectedId={selectedOrder?.id || null}
          onSelect={setSelectedOrder}
        />
      </div>

      <div className="lg:col-span-2">
        <h2 className="mb-4 text-lg font-semibold">Detail Pesanan</h2>
        {selectedOrder ? (
          <OrderDetails
            order={transformTransactionToOrderResponse(selectedOrder)}
          />
        ) : (
          <p className="text-muted-foreground">
            Pilih pesanan untuk melihat detail
          </p>
        )}
      </div>
    </div>
  );
}
