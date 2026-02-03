import { z } from "zod";

export const customerFormSchema = z.object({
  fullName: z.string().min(1, "Nama lengkap harus diisi"),
  phone: z
    .string()
    .min(1, "Nomor telepon harus diisi")
    .regex(/^(\+62|62|08)\d+$/, "Format nomor telepon tidak valid"),
  email: z.string().min(1, "Email harus diisi").email("Email tidak valid"),
  street: z.string().min(1, "Alamat harus diisi"),
  city: z.string().min(1, "Kota harus diisi"),
  province: z.string().min(1, "Provinsi harus diisi"),
  postalCode: z.string().min(1, "Kode pos harus diisi"),
  notes: z.string().optional(),
});

export type CustomerFormData = z.infer<typeof customerFormSchema>;
