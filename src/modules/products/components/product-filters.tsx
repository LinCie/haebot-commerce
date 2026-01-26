import React, { useState } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

import type { Category, ProductFilter, StockStatus } from "../types";
import { categoryLabels, stockStatusLabels } from "../utils";

interface ProductFiltersProps {
  filters: ProductFilter;
  onFilterChange: (filters: ProductFilter) => void;
  priceRange: { min: number; max: number };
  onClose?: () => void;
}

export function ProductFilters({
  filters,
  onFilterChange,
  priceRange,
  onClose,
}: ProductFiltersProps) {
  const [localPriceRange, setLocalPriceRange] = useState<[number, number]>([
    filters.minPrice ?? priceRange.min,
    filters.maxPrice ?? priceRange.max,
  ]);

  const categories: Category[] = [
    "milling",
    "turning",
    "spare-parts",
    "tooling",
  ];
  const stockStatuses: StockStatus[] = [
    "in-stock",
    "low-stock",
    "out-of-stock",
  ];

  const handleCategoryChange = (category: Category) => {
    onFilterChange({
      ...filters,
      category: filters.category === category ? undefined : category,
    });
  };

  const handleStockStatusChange = (status: StockStatus) => {
    onFilterChange({
      ...filters,
      stockStatus: filters.stockStatus === status ? undefined : status,
    });
  };

  const handlePriceChange = (value: number[]) => {
    setLocalPriceRange([value[0], value[1]]);
  };

  const handlePriceCommit = () => {
    onFilterChange({
      ...filters,
      minPrice: localPriceRange[0],
      maxPrice: localPriceRange[1],
    });
  };

  const clearFilters = () => {
    setLocalPriceRange([priceRange.min, priceRange.max]);
    onFilterChange({});
  };

  const formatPriceLabel = (value: number) => {
    return `Rp ${(value / 1000000).toFixed(1)}jt`;
  };

  return (
    <div className="bg-card border-border space-y-6 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-foreground font-semibold">Filter</h3>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Reset
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Categories */}
      <div>
        <Label className="mb-3 block text-sm font-medium">Kategori</Label>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={category}
                checked={filters.category === category}
                onCheckedChange={() => handleCategoryChange(category)}
              />
              <label
                htmlFor={category}
                className="text-foreground cursor-pointer text-sm"
              >
                {categoryLabels[category]}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <Label className="mb-3 block text-sm font-medium">Rentang Harga</Label>
        <Slider
          value={localPriceRange}
          min={priceRange.min}
          max={priceRange.max}
          step={100000}
          onValueChange={handlePriceChange}
          onValueCommit={handlePriceCommit}
          className="mb-2"
        />
        <div className="text-muted-foreground flex justify-between font-mono text-xs">
          <span>{formatPriceLabel(localPriceRange[0])}</span>
          <span>{formatPriceLabel(localPriceRange[1])}</span>
        </div>
      </div>

      {/* Stock Status */}
      <div>
        <Label className="mb-3 block text-sm font-medium">Status Stok</Label>
        <div className="space-y-2">
          {stockStatuses.map((status) => (
            <div key={status} className="flex items-center space-x-2">
              <Checkbox
                id={status}
                checked={filters.stockStatus === status}
                onCheckedChange={() => handleStockStatusChange(status)}
              />
              <label
                htmlFor={status}
                className="text-foreground cursor-pointer text-sm"
              >
                {stockStatusLabels[status]}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
