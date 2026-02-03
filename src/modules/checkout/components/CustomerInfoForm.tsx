import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { UseFormReturn } from "react-hook-form";
import type { CustomerFormData } from "../schemas/customer-form.schema";

interface CustomerInfoFormProps {
  form: UseFormReturn<CustomerFormData>;
  disabled?: boolean;
}

export function CustomerInfoForm({
  form,
  disabled = false,
}: CustomerInfoFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Informasi Pelanggan</h2>
        <p className="text-muted-foreground text-sm">
          Lengkapi data Anda untuk pengiriman
        </p>
      </div>

      <FormField
        control={form.control}
        name="fullName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nama Lengkap</FormLabel>
            <FormControl>
              <Input
                {...field}
                disabled={disabled}
                placeholder="Masukkan nama lengkap"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nomor Telepon</FormLabel>
            <FormControl>
              <Input
                {...field}
                type="tel"
                disabled={disabled}
                placeholder="+6281234567890"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input
                {...field}
                type="email"
                disabled={disabled}
                placeholder="email@contoh.com"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="street"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Alamat Jalan</FormLabel>
            <FormControl>
              <Input
                {...field}
                disabled={disabled}
                placeholder="Nama jalan, nomor rumah"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kota</FormLabel>
              <FormControl>
                <Input {...field} disabled={disabled} placeholder="Nama kota" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="province"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Provinsi</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={disabled}
                  placeholder="Nama provinsi"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="postalCode"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Kode Pos</FormLabel>
            <FormControl>
              <Input {...field} disabled={disabled} placeholder="12345" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Catatan (Opsional)</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                disabled={disabled}
                placeholder="Catatan tambahan untuk pesanan Anda"
                rows={3}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
