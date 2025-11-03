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

// Helper function to add Cloudinary transformation to image URL
export function getOptimizedImageUrl(url: string | undefined): string {
	if (!url) return '';

	// Check if it's a Cloudinary URL
	const cloudinaryPattern = /^https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\//;

	if (cloudinaryPattern.test(url)) {
		// Insert transformation parameters after '/upload/'
		return url.replace(
			/^(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)/,
			'$1c_pad,b_gen_fill,w_640,h_640/'
		);
	}

	// Return original URL if not Cloudinary
	return url;
}
