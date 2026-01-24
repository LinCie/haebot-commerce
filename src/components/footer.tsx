import * as React from "react";
import { Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-border bg-primary text-primary-foreground border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-accent flex h-10 w-10 items-center justify-center rounded-md">
                <span className="text-accent-foreground font-mono text-lg font-bold">
                  CNC
                </span>
              </div>
              <div>
                <span className="text-lg font-semibold">Indo Presisi</span>
                <p className="text-primary-foreground/70 text-xs">
                  Suku Cadang CNC
                </p>
              </div>
            </div>
            <p className="text-primary-foreground/80 text-sm">
              Penyedia suku cadang dan peralatan CNC berkualitas tinggi untuk
              industri pemesinan Indonesia sejak 2010.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 font-semibold">Menu Cepat</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/katalog"
                  className="text-primary-foreground/80 hover:text-accent transition-colors"
                >
                  Katalog Produk
                </a>
              </li>
              <li>
                <a
                  href="/katalog?category=milling"
                  className="text-primary-foreground/80 hover:text-accent transition-colors"
                >
                  Milling
                </a>
              </li>
              <li>
                <a
                  href="/katalog?category=turning"
                  className="text-primary-foreground/80 hover:text-accent transition-colors"
                >
                  Turning
                </a>
              </li>
              <li>
                <a
                  href="/katalog?category=spare-parts"
                  className="text-primary-foreground/80 hover:text-accent transition-colors"
                >
                  Suku Cadang
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 font-semibold">Dukungan</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/riwayat"
                  className="text-primary-foreground/80 hover:text-accent transition-colors"
                >
                  Riwayat Pesanan
                </a>
              </li>
              <li>
                <a
                  href="/wishlist"
                  className="text-primary-foreground/80 hover:text-accent transition-colors"
                >
                  Wishlist
                </a>
              </li>
              <li>
                <span className="text-primary-foreground/80">
                  Kebijakan Pengembalian
                </span>
              </li>
              <li>
                <span className="text-primary-foreground/80">
                  Garansi Produk
                </span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 font-semibold">Hubungi Kami</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2">
                <Phone className="text-accent h-4 w-4" />
                <span className="text-primary-foreground/80">
                  +62 21 1234 5678
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="text-accent h-4 w-4" />
                <span className="text-primary-foreground/80">
                  sales@indopresisi.co.id
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="text-accent mt-0.5 h-4 w-4" />
                <span className="text-primary-foreground/80">
                  Jl. Industri Raya No. 123
                  <br />
                  Kawasan Industri MM2100
                  <br />
                  Bekasi, Jawa Barat 17520
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-primary-foreground/20 text-primary-foreground/60 mt-8 border-t pt-8 text-center text-sm">
          <p>© 2024 Indo Presisi. Semua hak dilindungi.</p>
        </div>
      </div>
    </footer>
  );
}
