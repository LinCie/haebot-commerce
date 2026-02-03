import { persistentAtom } from "@nanostores/persistent";
import type { CustomerFormData } from "../schemas/customer-form.schema";

type FormState = CustomerFormData | null;

export const formState = persistentAtom<FormState>("checkout-form", null, {
  encode: JSON.stringify,
  decode: JSON.parse,
});

export const saveFormData = (data: CustomerFormData) => {
  formState.set(data);
};

export const getFormData = (): CustomerFormData | null => {
  return formState.get();
};

export const clearFormData = () => {
  formState.set(null);
};
