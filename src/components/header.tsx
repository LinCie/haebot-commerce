import * as React from "react";
import { ShoppingCart, Heart, User, Menu, X } from "lucide-react";
import { useState } from "react";
import { useStore } from "@nanostores/react";
import { cartProducts } from "@/modules/cart/stores/cart.store";
import { wishlistProducts } from "@/modules/wishlist/stores/wishlist.store";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  pathname?: string;
}

export function Header({ pathname = "/" }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartItems = useStore(cartProducts);
  const wishlistItems = useStore(wishlistProducts);

  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  // Mocked for now as Auth is not implemented
  const isAuthenticated = false;

  const navLinks = [
    { href: "/", label: "Beranda" },
    { href: "/katalog", label: "Katalog Produk" },
    { href: "/riwayat", label: "Riwayat Pesanan" },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <header className="border-border bg-card sticky top-0 z-50 w-full border-b shadow-sm">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center space-x-2">
            <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-md">
              <span className="text-primary-foreground font-mono text-lg font-bold">
                CNC
              </span>
            </div>
            <div className="hidden sm:block">
              <span className="text-foreground text-lg font-semibold">
                HaeBot Store
              </span>
              <p className="text-muted-foreground text-xs">Suku Cadang CNC</p>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden items-center space-x-1 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-secondary"
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Wishlist */}
            {/* Wishlist */}
            <a
              href="/wishlist"
              className={buttonVariants({
                variant: "ghost",
                size: "icon",
                className: "relative",
              })}
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <Badge className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs">
                  {wishlistCount}
                </Badge>
              )}
            </a>

            {/* Cart */}
            <a
              href="/keranjang"
              className={buttonVariants({
                variant: "ghost",
                size: "icon",
                className: "relative",
              })}
              aria-label="Keranjang Belanja"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs">
                  {cartItemCount}
                </Badge>
              )}
            </a>

            {/* User - Mocked/Simplified */}
            {isAuthenticated ? (
              <div className="hidden items-center space-x-2 sm:flex">
                <span className="text-muted-foreground text-sm">User</span>
                <Button variant="outline" size="sm">
                  Keluar
                </Button>
              </div>
            ) : (
              <a
                href="/login"
                className={`hidden sm:flex ${buttonVariants({ variant: "outline", size: "sm" })}`}
              >
                <User className="mr-2 h-4 w-4" />
                Masuk
              </a>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="border-border animate-fade-in border-t py-4 md:hidden">
            <nav className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-secondary"
                  }`}
                >
                  {link.label}
                </a>
              ))}
              {!isAuthenticated && (
                <a
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-foreground hover:bg-secondary rounded-md px-4 py-2 text-sm font-medium"
                >
                  Masuk / Daftar
                </a>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
