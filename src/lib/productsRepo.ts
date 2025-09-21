import { SupabaseService } from "@/lib/supabaseService";
import type { Product, ProductCreateInput, ProductUpdateInput } from "@/lib/types";

export async function listProducts(): Promise<Product[]> {
  return await SupabaseService.getProducts();
}

export async function listProductsPaged(params: {
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ items: Product[]; total: number }> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 10));
  
  let allProducts: Product[];

  if (params.search && params.search.trim()) {
    // Use Supabase search functionality
    allProducts = await SupabaseService.searchProducts(params.search);
  } else {
    // Get all products
    allProducts = await SupabaseService.getProducts();
  }
  
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const items = allProducts.slice(startIndex, endIndex);
  
  return { items, total: allProducts.length };
}

export async function getProductBySlugDb(slug: string): Promise<Product | null> {
  return await SupabaseService.getProductBySlug(slug);
}

export async function createProduct(input: ProductCreateInput): Promise<Product> {
  return await SupabaseService.createProduct(input);
}

export async function updateProduct(id: string, input: ProductUpdateInput): Promise<Product> {
  return await SupabaseService.updateProduct(id, input);
}

export async function deleteProduct(id: string): Promise<void> {
  return await SupabaseService.deleteProduct(id);
}

export async function listProductsByCategory(category: string): Promise<Product[]> {
  const allProducts = await SupabaseService.getProducts();
  return allProducts.filter(product => product.category === category);
}


