import React from "react";

interface Timestamps {
  createdAt?: string | null;
  packagedAt?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  cancelledAt?: string | null;
  completedAt?: string | null;
}

interface OrderTimestampsProps {
  timestamps: Timestamps;
}

const timestampLabels: Record<string, string> = {
  createdAt: "Dibuat",
  packagedAt: "Dikemas",
  shippedAt: "Dikirim",
  deliveredAt: "Diterima",
  cancelledAt: "Dibatalkan",
  completedAt: "Selesai",
};

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}

export function OrderTimestamps({ timestamps }: OrderTimestampsProps) {
  const entries = Object.entries(timestamps).filter(
    ([key, value]) => value && timestampLabels[key],
  );

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="bg-card rounded-lg border p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold">Riwayat Pesanan</h3>
      <div className="space-y-3">
        {entries.map(([key, value]) => (
          <div
            key={key}
            className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
          >
            <span className="text-muted-foreground">
              {timestampLabels[key]}
            </span>
            <span className="font-medium">{formatDate(value as string)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
