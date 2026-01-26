import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function prefixImageUrl(url: string, isNew: boolean) {
  return isNew
    ? `${import.meta.env.PUBLIC_R2_URL}/${url}`
    : `${import.meta.env.PUBLIC_LARAVEL_STORAGE ?? "http://localhost:8000"}/${url}`;
}
