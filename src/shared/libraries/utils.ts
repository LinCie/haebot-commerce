import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function prefixImageUrl(url: string, isNew: boolean) {
  return isNew
    ? `${import.meta.env.R2_URL}/${url}`
    : `${import.meta.env.LARAVEL_STORAGE ?? "http://localhost:8000"}/${url}`;
}
