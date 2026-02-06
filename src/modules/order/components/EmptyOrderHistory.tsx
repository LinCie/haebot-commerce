import React from "react";
import { PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyOrderHistoryProps {
  onBrowseProducts?: () => void;
}

export function EmptyOrderHistory({
  onBrowseProducts,
}: EmptyOrderHistoryProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="bg-muted mb-4 rounded-full p-6">
        <PackageOpen className="text-muted-foreground h-12 w-12" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">Belum ada riwayat pesanan</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        Anda belum melakukan pembelian. Jelajahi produk kami dan lakukan
        pemesanan pertama Anda.
      </p>
      {onBrowseProducts && (
        <Button onClick={onBrowseProducts}>Jelajahi Produk</Button>
      )}
    </div>
  );
}
