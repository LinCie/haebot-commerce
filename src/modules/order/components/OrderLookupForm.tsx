import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "astro/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  number: z.string().min(1, "Nomor transaksi wajib diisi"),
  phone: z.string().regex(/^\d{4}$/, "Masukkan 4 digit terakhir nomor telepon"),
});

type FormData = z.infer<typeof formSchema>;

interface OrderLookupFormProps {
  onSubmit: (number: string, phone: string) => Promise<void>;
  isLoading: boolean;
}

export function OrderLookupForm({ onSubmit, isLoading }: OrderLookupFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onSubmit",
    defaultValues: {
      number: "",
      phone: "",
    },
  });

  const handleSubmit = async (data: FormData) => {
    await onSubmit(data.number, data.phone);
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="bg-card rounded-lg border p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-semibold">Cari Pesanan Anda</h2>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Transaksi</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Contoh: TXN-2024-001234"
                      disabled={isLoading}
                      autoComplete="off"
                      aria-describedby="number-description"
                    />
                  </FormControl>
                  <p
                    id="number-description"
                    className="text-muted-foreground text-sm"
                  >
                    Nomor transaksi yang dikirim melalui WhatsApp
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>4 Digit Terakhir Nomor Telepon</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Contoh: 1234"
                      maxLength={4}
                      inputMode="numeric"
                      disabled={isLoading}
                      autoComplete="off"
                      aria-describedby="phone-description"
                    />
                  </FormControl>
                  <p
                    id="phone-description"
                    className="text-muted-foreground text-sm"
                  >
                    4 digit terakhir nomor telepon yang digunakan saat checkout
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Mencari..." : "Cari Pesanan"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
