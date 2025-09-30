import { apiClient } from "@/lib/apiConfig";
import type { Product, ProductCreateInput, ProductUpdateInput } from "@/lib/types";

export async function listProducts(): Promise<Product[]> {
  const response = await apiClient.get('/products');
  // Backend returns { success: true, data: [...], count: ... }
  return response.data || [];
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
  const response = await apiClient.get(`/products${query}`);
  
  // Backend returns { success: true, data: [...], count: ... }
  return {
    items: response.data || [],
    total: response.count || 0
  };
}

export async function getProductBySlugDb(slug: string): Promise<Product | null> {
  try {
    const response = await apiClient.get(`/products/${slug}`);
    // Backend returns { success: true, data: product }
    return response.data || null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export async function createProduct(input: ProductCreateInput): Promise<Product> {
  const response = await apiClient.post('/products', input);
  // Backend returns { success: true, data: product, message: ... }
  return response.data;
}

export async function updateProduct(id: string, input: ProductUpdateInput): Promise<Product> {
  const response = await apiClient.put(`/products/${id}`, input);
  // Backend returns { success: true, data: product, message: ... }
  return response.data;
}

export async function deleteProduct(id: string): Promise<void> {
  await apiClient.delete(`/products/${id}`);
  // Backend returns { success: true, message: ... }
}

export async function listProductsByCategory(category: string): Promise<Product[]> {
  const response = await apiClient.get(`/products?category=${category}`);
  // Backend returns { success: true, data: [...], count: ... }
  return response.data || [];
}