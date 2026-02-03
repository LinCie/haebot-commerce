import React from "react";
import { Button } from "@/components/ui/button";

interface CheckoutButtonProps {
  isSubmitting: boolean;
  disabled?: boolean;
}

export function CheckoutButton({
  isSubmitting,
  disabled = false,
}: CheckoutButtonProps) {
  return (
    <Button
      type="submit"
      disabled={isSubmitting || disabled}
      className="w-full"
      size="lg"
    >
      {isSubmitting ? "Memproses..." : "Lanjutkan Pembayaran"}
    </Button>
  );
}
