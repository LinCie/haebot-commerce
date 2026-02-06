import type { CustomerFormData } from "../schemas/customer-form.schema";
import type { z } from "astro/zod";
import type {
  transactionAddressesSchema,
  transactionPlayersSchema,
  transactionTimestampsSchema,
} from "../schemas/transaction.schema";

type addressesData = z.infer<typeof transactionAddressesSchema>;
type PlayersData = z.infer<typeof transactionPlayersSchema>;
type TimestampsData = z.infer<typeof transactionTimestampsSchema>;

/**
 * Transform customer form data into structured addresses object.
 * Maps form field names to backend schema field names.
 */
export function buildAddressesData(formData: CustomerFormData): addressesData {
  return {
    street: formData.street,
    city: formData.city,
    state: formData.province, // Map province → state
    zip: formData.postalCode, // Map postalCode → zip
    country: "Indonesia", // Default country
  };
}

/**
 * Transform customer form data into structured players/customer object.
 */
export function buildPlayersData(formData: CustomerFormData): PlayersData {
  return {
    name: formData.fullName,
    phone: formData.phone,
    email: formData.email,
  };
}

/**
 * Build timestamps object with createdAt set to current time.
 * Other timestamp fields are left undefined (set by backend during order lifecycle).
 */
export function buildTimestampsData(): TimestampsData {
  return {
    createdAt: new Date(),
  };
}
