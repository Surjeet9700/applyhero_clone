import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to get initials for avatar fallback
export const getInitials = (name?: string | null): string => {
  if (!name) return 'U';
  const names = name.split(' ').filter(Boolean); // Filter out empty strings
  if (names.length === 0) return 'U';
  if (names.length === 1) return names[0][0].toUpperCase();
  return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
};
