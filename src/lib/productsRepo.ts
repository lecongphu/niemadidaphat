import { apiClient } from "@/lib/apiConfig";
import type { Product, ProductCreateInput, ProductUpdateInput } from "@/lib/types";

export async function listProducts(): Promise<Product[]> {
  return await apiClient.get('/products');
}

export async function listProductsPaged(params: {
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ items: Product[]; total: number }> {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.set('search', params.search);
  if (params.page) queryParams.set('page', params.page.toString());
  if (params.pageSize) queryParams.set('pageSize', params.pageSize.toString());
  
  const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
  return await apiClient.get(`/products${query}`);
}

export async function getProductBySlugDb(slug: string): Promise<Product | null> {
  try {
    return await apiClient.get(`/products/${slug}`);
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export async function createProduct(input: ProductCreateInput): Promise<Product> {
  return await apiClient.post('/products', input);
}

export async function updateProduct(id: string, input: ProductUpdateInput): Promise<Product> {
  return await apiClient.put(`/products/${id}`, input);
}

export async function deleteProduct(id: string): Promise<void> {
  await apiClient.delete(`/products/${id}`);
}

export async function listProductsByCategory(category: string): Promise<Product[]> {
  return await apiClient.get(`/products?category=${category}`);
}