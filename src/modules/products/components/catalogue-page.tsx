import React, { useState, useEffect, useRef } from "react";
import { actions } from "astro:actions";
import { Search, Grid, List, Filter, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
} from "@/components/ui/table";

import { ProductCard } from "./product-card";
import { ProductListItem } from "./product-list-item";
import { ProductCardSkeleton } from "./product-card-skeleton";
import { ProductFilters } from "./product-filters";

import type { Product } from "@/modules/products/schemas/products.schema";
import type { ProductFilter, Category } from "@/modules/products/types";
import { categoryLabels } from "@/modules/products/utils";
import type { PaginationMeta } from "@/shared/schemas";

type ViewMode = "grid" | "list";

const ITEMS_PER_PAGE = 20;
const DEFAULT_PRICE_RANGE = { min: 0, max: 20000000 };
const SEARCH_DEBOUNCE_MS = 500;

interface CataloguePageProps {
  initialCategory?: Category;
  initialSearch?: string;
  initialPage?: number;
}

export function CataloguePage({
  initialCategory,
  initialSearch,
  initialPage = 1,
}: CataloguePageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialSearch || "");
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch || "");
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(
    null,
  );
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [filters, setFilters] = useState<ProductFilter>(() => ({
    category: initialCategory,
  }));

  // Sync search and page from URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchFromUrl = urlParams.get("search");
    const pageFromUrl = urlParams.get("page");

    if (searchFromUrl) {
      setSearchQuery(searchFromUrl);
      setDebouncedSearch(searchFromUrl);
    }
    if (pageFromUrl) {
      const pageNum = parseInt(pageFromUrl, 10);
      if (!isNaN(pageNum) && pageNum > 0) {
        setCurrentPage(pageNum);
      }
    }
  }, []);

  // Fetch products from API
  const loadProducts = async () => {
    setLoading(true);
    try {
      const result = await actions.getProductsAction({
        type: "partial",
        search: debouncedSearch || undefined,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        status: "active",
        withInventory: true,
      });

      if (result.data) {
        setProducts(result.data.data);
        setPaginationMeta(result.data.metadata);
      }
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [currentPage, debouncedSearch]);

  // Debounce search input
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);

    // Clear existing timer
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    // Set new timer
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setCurrentPage(1);

      // Update URL with debounced search
      const params = new URLSearchParams();
      if (filters.category) params.set("category", filters.category);
      if (value) params.set("search", value);
      // Don't include page=1 in URL

      const newUrl =
        params.toString() === ""
          ? window.location.pathname
          : `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, "", newUrl);
    }, SEARCH_DEBOUNCE_MS);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, []);

  // Update URL when filters or page change
  const updateUrl = (
    newFilters: ProductFilter,
    page: number,
    search?: string,
  ) => {
    const params = new URLSearchParams();
    if (newFilters.category) params.set("category", newFilters.category);
    if (search) params.set("search", search);
    if (page > 1) params.set("page", page.toString());

    const newUrl =
      params.toString() === ""
        ? window.location.pathname
        : `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", newUrl);
  };

  const handleFilterChange = (newFilters: ProductFilter) => {
    setFilters(newFilters);
    setCurrentPage(1);
    updateUrl(newFilters, 1, searchQuery);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Clear any pending debounce timer and search immediately
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    setDebouncedSearch(searchQuery);
    setCurrentPage(1);
    updateUrl(filters, 1, searchQuery);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateUrl(filters, page, searchQuery);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeFilterCount = [
    filters.category,
    filters.minPrice,
    filters.maxPrice,
    filters.stockStatus,
  ].filter(Boolean).length;

  // Generate page numbers to display
  const getPageNumbers = (): (number | "ellipsis")[] => {
    const totalPages = paginationMeta?.totalPages || 1;
    const pages: (number | "ellipsis")[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);

      if (currentPage > 3) pages.push("ellipsis");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 2) pages.push("ellipsis");

      pages.push(totalPages);
    }

    return pages;
  };

  const totalPages = paginationMeta?.totalPages || 1;
  const totalItems = paginationMeta?.totalItems || 0;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-foreground mb-2 text-2xl font-bold md:text-3xl">
          Katalog Produk
        </h1>
        <p className="text-muted-foreground">
          {filters.category
            ? `Menampilkan produk kategori ${categoryLabels[filters.category]}`
            : "Temukan suku cadang dan peralatan CNC berkualitas tinggi"}
        </p>
      </div>

      {/* Search and View Controls */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Cari SKU, nama produk, atau deskripsi..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 font-mono"
            />
          </div>
          <Button type="submit">Cari</Button>
        </form>

        <div className="flex items-center gap-2">
          {/* Mobile Filter Toggle */}
          <Button
            variant="outline"
            className="lg:hidden"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filter
            {activeFilterCount > 0 && (
              <span className="bg-accent text-accent-foreground ml-2 rounded-full px-2 py-0.5 text-xs">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {/* View Toggle */}
          <div className="border-border flex rounded-md border">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              className="rounded-r-none"
              onClick={() => setViewMode("grid")}
              aria-label="Tampilan grid"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              className="rounded-l-none"
              onClick={() => setViewMode("list")}
              aria-label="Tampilan list"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {(searchQuery || filters.category) && (
        <div className="mb-6 flex flex-wrap gap-2">
          {searchQuery && (
            <span className="bg-secondary inline-flex items-center rounded-full px-3 py-1 text-sm">
              Pencarian: &quot;{searchQuery}&quot;
              <button
                onClick={() => {
                  // Clear any pending debounce timer
                  if (searchTimerRef.current) {
                    clearTimeout(searchTimerRef.current);
                  }
                  setSearchQuery("");
                  setDebouncedSearch("");
                  setCurrentPage(1);
                  updateUrl(filters, 1, "");
                }}
                className="hover:text-destructive ml-2"
                aria-label="Hapus pencarian"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.category && (
            <span className="bg-secondary inline-flex items-center rounded-full px-3 py-1 text-sm">
              Kategori: {categoryLabels[filters.category]}
              <button
                onClick={() =>
                  handleFilterChange({ ...filters, category: undefined })
                }
                className="hover:text-destructive ml-2"
                aria-label="Hapus kategori"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}

      <div className="flex gap-8">
        {/* Sidebar Filters - Desktop */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <ProductFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            priceRange={DEFAULT_PRICE_RANGE}
          />
        </aside>

        {/* Mobile Filters */}
        {showFilters && (
          <div className="bg-background/80 fixed inset-0 z-50 backdrop-blur-sm lg:hidden">
            <div className="bg-background fixed inset-y-0 left-0 w-80 overflow-y-auto p-4 shadow-xl">
              <ProductFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                priceRange={DEFAULT_PRICE_RANGE}
                onClose={() => setShowFilters(false)}
              />
            </div>
          </div>
        )}

        {/* Products */}
        <div className="min-w-0 flex-1">
          {loading ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4"
                  : "space-y-2"
              }
            >
              {[...Array(6)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                Tidak ada produk yang ditemukan.
              </p>
              <Button variant="outline" onClick={() => handleFilterChange({})}>
                Reset Filter
              </Button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Gambar</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Nama Produk</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Stok</TableHead>
                  <TableHead>Harga</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <ProductListItem key={product.id} product={product} />
                ))}
              </TableBody>
            </Table>
          )}

          {/* Results count and pagination info */}
          {!loading && products.length > 0 && (
            <div className="mt-6 space-y-4">
              <p className="text-muted-foreground text-center text-sm">
                Menampilkan {startIndex}-{endIndex} dari {totalItems} produk
              </p>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          currentPage > 1 && handlePageChange(currentPage - 1)
                        }
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>

                    {getPageNumbers().map((page, index) => (
                      <PaginationItem key={index}>
                        {page === "ellipsis" ? (
                          <PaginationEllipsis />
                        ) : (
                          <PaginationLink
                            onClick={() => handlePageChange(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          currentPage < totalPages &&
                          handlePageChange(currentPage + 1)
                        }
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
