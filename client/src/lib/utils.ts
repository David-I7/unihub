import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Extracts a 1-2 character uppercase initials string from a username, email, or full name.
 */
export function getInitials(
  nameOrEmail?: string | null,
  fallback = "U",
): string {
  if (!nameOrEmail) return fallback;
  const clean = nameOrEmail.trim();
  if (!clean) return fallback;

  // If email, extract the local username segment
  const text = clean.includes("@") ? clean.split("@")[0] : clean;

  // Split on whitespace, dots, underscores, or hyphens
  const parts = text.split(/[\s._-]+/).filter(Boolean);

  if (parts.length >= 2 && parts[0].length > 0 && parts[1].length > 0) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return clean.slice(0, 2).toUpperCase();
}
