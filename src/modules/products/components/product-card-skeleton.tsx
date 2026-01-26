import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="bg-card text-card-foreground relative flex h-full flex-col overflow-hidden rounded-lg border">
      {/* Image Skeleton */}
      <div className="aspect-square w-full overflow-hidden">
        <Skeleton className="h-full w-full" />
      </div>

      {/* Content Skeleton */}
      <div className="flex flex-1 flex-col p-4">
        {/* SKU & Badge */}
        <div className="mb-2 flex items-center justify-between">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>

        {/* Title */}
        <div className="mb-4 space-y-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* Price & Action */}
        <div className="mt-auto flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-9 w-12 rounded-md" />
        </div>
      </div>
    </div>
  );
}
