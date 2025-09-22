'use client';

import { Product, ProductCreateInput, Chapter } from './types';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
}

class ApiClient {
  private baseUrl = '/api';

  private async makeRequest<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('auth_token');
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      // Add auth header if token exists
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`);
      }

      return result;
    } catch (error) {
      console.error(`API request error (${endpoint}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'API request failed'
      };
    }
  }

  // ===== PRODUCTS =====
  async getProducts(params?: {
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
    includeChapters?: boolean;
  }): Promise<ApiResponse<Product[]>> {
    const searchParams = new URLSearchParams();
    
    if (params?.category) searchParams.set('category', params.category);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    if (params?.includeChapters) searchParams.set('includeChapters', 'true');

    const queryString = searchParams.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;

    return this.makeRequest<Product[]>(endpoint);
  }

  async getProductBySlug(slug: string): Promise<ApiResponse<Product>> {
    return this.makeRequest<Product>(`/products/${slug}`);
  }

  async createProduct(productData: ProductCreateInput): Promise<ApiResponse<Product>> {
    return this.makeRequest<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(slug: string, updates: Partial<ProductCreateInput>): Promise<ApiResponse<Product>> {
    return this.makeRequest<Product>(`/products/${slug}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteProduct(slug: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/products/${slug}`, {
      method: 'DELETE',
    });
  }

  // ===== CHAPTERS =====
  async getChaptersByProduct(productId: string): Promise<ApiResponse<Chapter[]>> {
    return this.makeRequest<Chapter[]>(`/chapters/product/${productId}`);
  }

  async getChapter(id: string): Promise<ApiResponse<Chapter>> {
    return this.makeRequest<Chapter>(`/chapters/${id}`);
  }

  async createChapter(chapterData: any): Promise<ApiResponse<Chapter>> {
    return this.makeRequest<Chapter>('/chapters', {
      method: 'POST',
      body: JSON.stringify(chapterData),
    });
  }

  async updateChapter(id: string, updates: any): Promise<ApiResponse<Chapter>> {
    return this.makeRequest<Chapter>(`/chapters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteChapter(id: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/chapters/${id}`, {
      method: 'DELETE',
    });
  }

  // ===== FOLLOW =====
  async followProduct(productId: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>('/follow', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  }

  async unfollowProduct(productId: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>('/follow', {
      method: 'DELETE',
      body: JSON.stringify({ productId }),
    });
  }

  async checkFollowStatus(productId: string): Promise<ApiResponse<{ isFollowing: boolean }>> {
    return this.makeRequest<{ isFollowing: boolean }>(`/follow?productId=${productId}`);
  }

  // ===== FEEDBACK =====
  async submitFeedback(feedbackData: {
    product_id?: string;
    chapter_id?: string;
    rating: number;
    comment?: string;
  }): Promise<ApiResponse<any>> {
    return this.makeRequest('/feedback', {
      method: 'POST',
      body: JSON.stringify(feedbackData),
    });
  }

  async getFeedback(params?: {
    productId?: string;
    chapterId?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<any[]>> {
    const searchParams = new URLSearchParams();
    
    if (params?.productId) searchParams.set('productId', params.productId);
    if (params?.chapterId) searchParams.set('chapterId', params.chapterId);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());

    const queryString = searchParams.toString();
    const endpoint = `/feedback${queryString ? `?${queryString}` : ''}`;

    return this.makeRequest(endpoint);
  }

  // ===== ANALYTICS =====
  async trackView(productId: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>('/analytics/view', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  }

  async getDashboardAnalytics(): Promise<ApiResponse<{
    products: number;
    chapters: number;
    users: number;
    totalViews: number;
  }>> {
    return this.makeRequest('/analytics/dashboard');
  }

  // ===== USER PROFILE =====
  async getUserProfile(): Promise<ApiResponse<any>> {
    return this.makeRequest('/users/profile');
  }

  async updateUserProfile(updates: {
    full_name?: string;
    avatar_url?: string;
    phone?: string;
    bio?: string;
  }): Promise<ApiResponse<any>> {
    return this.makeRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
