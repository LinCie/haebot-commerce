import type { CustomerFormData } from "../schemas/customer-form.schema";

export function formatCustomerInfo(data: CustomerFormData): string {
  return `Full Name: ${data.fullName}
Phone: ${data.phone}
Email: ${data.email}
Street: ${data.street}
City: ${data.city}
Province: ${data.province}
Postal Code: ${data.postalCode}
Notes: ${data.notes || ""}`;
}
