import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to safely get name from Teacher or Category
export function getName(value: string | { _id: string; name: string } | { name: string } | any): string {
	if (!value) return '';
	if (typeof value === 'string') return value;
	if (typeof value === 'object' && 'name' in value) return value.name;
	return '';
}
