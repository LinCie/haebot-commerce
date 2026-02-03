import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useStore } from "@nanostores/react";
import { toast } from "sonner";
import { actions } from "astro:actions";
import { navigate } from "astro:transitions/client";
import { cartProducts, clearCart } from "@/modules/cart/stores/cart.store";
import { useCartProducts } from "@/modules/cart/hooks/use-cart-products";
import {
  customerFormSchema,
  type CustomerFormData,
} from "../schemas/customer-form.schema";
import { buildBatchOperations } from "../utils/buildBatchOperations";
import { formatCustomerInfo } from "../utils/formatCustomerInfo";
import { addCheckoutHistory } from "../stores/checkout-history.store";
import { saveFormData, getFormData, clearFormData } from "../stores/form.store";
import { Form } from "@/components/ui/form";
import { CustomerInfoForm } from "./CustomerInfoForm";
import { OrderSummary } from "./OrderSummary";
import { CheckoutButton } from "./CheckoutButton";

interface CheckoutFormProps {
  spaceId: number;
}

export function CheckoutForm({ spaceId }: CheckoutFormProps) {
  const cartItems = useStore(cartProducts);
  const { products, isLoading, error } = useCartProducts();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isCheckoutSuccessRef = useRef(false);

  // Empty cart protection (client-side)
  // Skip redirect if we just completed a successful checkout
  useEffect(() => {
    if (cartItems.length === 0 && !isCheckoutSuccessRef.current) {
      navigate("/katalog");
    }
  }, [cartItems]);

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      street: "",
      city: "",
      province: "",
      postalCode: "",
      notes: "",
    },
  });

  // Load saved form data on mount
  useEffect(() => {
    const savedData = getFormData();
    if (savedData) {
      form.reset(savedData);
    }
  }, [form]);

  // Save form data on change
  useEffect(() => {
    const subscription = form.watch((values) => {
      saveFormData(values as CustomerFormData);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async (data: CustomerFormData) => {
    try {
      setIsSubmitting(true);

      // Build batch operations
      const batchOperations = buildBatchOperations(
        data,
        cartItems,
        products,
        spaceId,
      );

      // Execute batch transaction
      const result = await actions.batchTransactionAction(batchOperations);

      if (result.error) {
        toast.error("Gagal membuat pesanan. Silakan coba lagi.");
        return;
      }

      // Extract transaction number
      const transaction = result.data?.created?.[0];

      if (!transaction || !transaction.number) {
        toast.error("Terjadi kesalahan. Silakan coba lagi.");
        return;
      }

      // Add to checkout history
      addCheckoutHistory(transaction.id, new Date().toISOString());

      // Mark as success to prevent empty cart redirect
      isCheckoutSuccessRef.current = true;

      // Prepare state for success page
      const successState = {
        transactionNumber: transaction.number,
        transactionId: transaction.id,
        cartItems,
        products,
        customerInfo: formatCustomerInfo(data),
      };

      // Store in sessionStorage since Astro's navigate() doesn't preserve state reliably
      sessionStorage.setItem("checkoutSuccess", JSON.stringify(successState));

      // Clear cart and form data
      clearCart();
      clearFormData();

      // Navigate to success page
      navigate("/bayar/sukses");
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-destructive">Gagal memuat produk: {error}</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Customer Information Form - Left Column */}
            <div className="space-y-6">
              <CustomerInfoForm form={form} disabled={isSubmitting} />

              {/* Mobile: Show button here */}
              <div className="lg:hidden">
                <CheckoutButton isSubmitting={isSubmitting} />
              </div>
            </div>

            {/* Order Summary - Right Column (Sticky on desktop) */}
            <div className="lg:sticky lg:top-4 lg:self-start">
              <div className="space-y-6 rounded-lg border p-6">
                <OrderSummary
                  cartItems={cartItems}
                  products={products}
                  isLoading={isLoading}
                  disabled={isSubmitting}
                />

                {/* Desktop: Show button here */}
                <div className="hidden lg:block">
                  <CheckoutButton isSubmitting={isSubmitting} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
