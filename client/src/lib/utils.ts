import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extracts a 1-2 character uppercase initials string from a username, email, or full name.
 */
export function getInitials(nameOrEmail?: string | null, fallback = "U"): string {
  if (!nameOrEmail) return fallback;
  const clean = nameOrEmail.trim();
  if (!clean) return fallback;
  return clean.slice(0, 2).toUpperCase();
}

