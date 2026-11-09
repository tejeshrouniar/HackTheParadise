/**
 * cn() — Utility for safe, conflict-free Tailwind class merging.
 * Combines clsx (conditional classes) + tailwind-merge (removes conflicting Tailwind utilities).
 *
 * Usage:
 *   cn('px-4 py-2', isActive && 'bg-magic', 'bg-night-900')
 *   // tailwind-merge resolves bg conflicts cleanly
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
