import { supabase } from './supabase';
import { 
  Product, 
  ProductCreateInput, 
  ProductUpdateInput, 
  ProductWithChapters,
  Chapter, 
  ChapterCreateInput, 
  ChapterUpdateInput,
  ChapterWithProduct 
} from './types';

// Error handling helper
const handleSupabaseError = (error: unknown, operation: string): never => {
  console.error(`Supabase ${operation} error:`, error);
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  throw new Error(`${operation} failed: ${errorMessage}`);
};

// Simple cache for better performance
class SimpleCache<T> {
  private cache = new Map<string, { data: T; timestamp: number }>();
  private ttl: number;

  constructor(ttlMinutes = 5) {
    this.ttl = ttlMinutes * 60 * 1000;
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  set(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }
}

// Cache instances
const productsCache = new SimpleCache<Product[]>(10);
const productCache = new SimpleCache<Product>(5);
const chaptersCache = new SimpleCache<Chapter[]>(5);

export class SupabaseService {
  // ===== AUTHENTICATION =====
  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      return { data, error };
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: null, error };
    }
  }

  static async signUp(email: string, password: string, metadata?: { full_name?: string }) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata || {}
        }
      });

      return { data, error };
    } catch (error) {
      console.error('Sign up error:', error);
      return { data: null, error };
    }
  }

  static async signOut(accessToken?: string) {
    try {
      if (accessToken) {
        // Set the session before signing out
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: '' // We don't have refresh token here
        });
      }
      
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error };
    }
  }

  static async getSession(accessToken?: string) {
    try {
      if (accessToken) {
        // Verify the token by setting it
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: '' // We'll handle refresh separately
        });

        if (error) return { data: null, error };

        return { data, error: null };
      }

      const { data, error } = await supabase.auth.getSession();
      return { data, error };
    } catch (error) {
      console.error('Get session error:', error);
      return { data: null, error };
    }
  }

  static async refreshSession(refreshToken: string) {
    try {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken
      });

      return { data, error };
    } catch (error) {
      console.error('Refresh session error:', error);
      return { data: null, error };
    }
  }

  static async getUserByEmail(email: string) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Get user by email error:', error);
      return null;
    }
  }

  static async createUserProfile(profileData: {
    user_id: string;
    full_name: string;
    email: string;
    avatar_url?: string | null;
    created_at: string;
    updated_at: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          id: profileData.user_id,
          full_name: profileData.full_name,
          email: profileData.email,
          avatar_url: profileData.avatar_url,
          created_at: profileData.created_at,
          updated_at: profileData.updated_at,
          profile_active: true,
          login_count: 1,
          last_login_at: profileData.created_at
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      return handleSupabaseError(error, 'createUserProfile');
    }
  }

  // ===== PRODUCTS =====
  static async getProducts(): Promise<Product[]> {
    const cached = productsCache.get('all');
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const products = data || [];
      productsCache.set('all', products);
      return products;
    } catch (error) {
      return handleSupabaseError(error, 'getProducts');
    }
  }

  static async getProductBySlug(slug: string): Promise<Product | null> {
    const cached = productCache.get(slug);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      if (data) {
        productCache.set(slug, data);
      }
      
      return data;
    } catch (error) {
      return handleSupabaseError(error, 'getProductBySlug');
    }
  }

  static async createProduct(product: ProductCreateInput): Promise<Product> {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();

      if (error) throw error;

      // Clear cache
      productsCache.clear();
      
      return data;
    } catch (error) {
      return handleSupabaseError(error, 'createProduct');
    }
  }

  static async updateProduct(id: string, updates: ProductUpdateInput): Promise<Product> {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Clear cache
      productsCache.clear();
      if (data.slug) {
        productCache.set(data.slug, data);
      }

      return data;
    } catch (error) {
      return handleSupabaseError(error, 'updateProduct');
    }
  }

  static async deleteProduct(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Clear cache
      productsCache.clear();
      productCache.clear();
    } catch (error) {
      return handleSupabaseError(error, 'deleteProduct');
    }
  }

  // ===== CHAPTERS =====
  static async getChaptersByProductId(productId: string): Promise<Chapter[]> {
    const cached = chaptersCache.get(productId);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('product_id', productId)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      const chapters = data || [];
      chaptersCache.set(productId, chapters);
      return chapters;
    } catch (error) {
      return handleSupabaseError(error, 'getChaptersByProductId');
    }
  }

  static async getChapterById(id: string): Promise<Chapter | null> {
    try {
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return data;
    } catch (error) {
      return handleSupabaseError(error, 'getChapterById');
    }
  }

  static async createChapter(chapter: ChapterCreateInput): Promise<Chapter> {
    try {
      const { data, error } = await supabase
        .from('chapters')
        .insert(chapter)
        .select()
        .single();

      if (error) throw error;

      // Clear cache for this product
      chaptersCache.clear();
      
      return data;
    } catch (error) {
      return handleSupabaseError(error, 'createChapter');
    }
  }

  static async updateChapter(id: string, updates: ChapterUpdateInput): Promise<Chapter> {
    try {
      const { data, error } = await supabase
        .from('chapters')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Clear cache
      chaptersCache.clear();

      return data;
    } catch (error) {
      return handleSupabaseError(error, 'updateChapter');
    }
  }

  static async deleteChapter(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('chapters')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Clear cache
      chaptersCache.clear();
    } catch (error) {
      return handleSupabaseError(error, 'deleteChapter');
    }
  }

  // ===== PRODUCT WITH CHAPTERS =====
  static async getProductWithChapters(slug: string): Promise<ProductWithChapters | null> {
    try {
      // Get product first
      const product = await this.getProductBySlug(slug);
      if (!product) return null;

      // Get chapters
      const chapters = await this.getChaptersByProductId(product.id);

      return {
        ...product,
        chapters
      };
    } catch (error) {
      return handleSupabaseError(error, 'getProductWithChapters');
    }
  }

  // ===== FOLLOWERS =====
  static async followProduct(productId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('followers')
        .insert({ product_id: productId, user_id: userId });

      if (error && error.code !== '23505') { // Ignore duplicate key error
        throw error;
      }

      // Update followers count
      await this.updateProductFollowersCount(productId);
    } catch (error) {
      return handleSupabaseError(error, 'followProduct');
    }
  }

  static async unfollowProduct(productId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('followers')
        .delete()
        .eq('product_id', productId)
        .eq('user_id', userId);

      if (error) throw error;

      // Update followers count
      await this.updateProductFollowersCount(productId);
    } catch (error) {
      return handleSupabaseError(error, 'unfollowProduct');
    }
  }

  static async isFollowing(productId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('followers')
        .select('id')
        .eq('product_id', productId)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return !!data;
    } catch (error) {
      return handleSupabaseError(error, 'isFollowing');
    }
  }

  private static async updateProductFollowersCount(productId: string): Promise<void> {
    try {
      const { count, error } = await supabase
        .from('followers')
        .select('*', { count: 'exact', head: true })
        .eq('product_id', productId);

      if (error) throw error;

      await supabase
        .from('products')
        .update({ followers_count: count || 0 })
        .eq('id', productId);

      // Clear cache
      productsCache.clear();
      productCache.clear();
    } catch (error) {
      console.error('Error updating followers count:', error);
    }
  }

  // ===== PRODUCT VIEWS =====
  static async trackProductView(productId: string, userId?: string): Promise<void> {
    try {
      const viewData: {
        product_id: string;
        viewed_at: string;
        user_id?: string;
      } = {
        product_id: productId,
        viewed_at: new Date().toISOString()
      };

      if (userId) {
        viewData.user_id = userId;
      }

      const { error } = await supabase
        .from('product_views')
        .insert(viewData);

      if (error) throw error;

      // Update product view stats (async, don't wait)
      this.updateProductViewStats(productId).catch(console.error);
    } catch (error) {
      console.error('Error tracking product view:', error);
    }
  }

  private static async updateProductViewStats(productId: string): Promise<void> {
    try {
      // Get total views
      const { count: totalViews, error: totalError } = await supabase
        .from('product_views')
        .select('*', { count: 'exact', head: true })
        .eq('product_id', productId);

      if (totalError) throw totalError;

      // Get unique views (distinct user_ids)
      const { count: uniqueViews, error: uniqueError } = await supabase
        .from('product_views')
        .select('user_id', { count: 'exact', head: true })
        .eq('product_id', productId)
        .not('user_id', 'is', null);

      if (uniqueError) throw uniqueError;

      // Update product stats
      await supabase
        .from('products')
        .update({
          total_views: totalViews || 0,
          unique_views: uniqueViews || 0,
          last_viewed_at: new Date().toISOString()
        })
        .eq('id', productId);

      // Clear cache
      productsCache.clear();
      productCache.clear();
    } catch (error) {
      console.error('Error updating product view stats:', error);
    }
  }

  // ===== USER PROFILES =====
  static async getUserProfile(userId: string): Promise<{
    id: string;
    email?: string;
    full_name: string;
    avatar_url?: string;
    phone?: string;
    bio?: string;
    created_at: string;
    last_active?: string;
    login_count?: number;
    last_login_at?: string;
    profile_active: boolean;
  } | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return data;
    } catch (error) {
      return handleSupabaseError(error, 'getUserProfile');
    }
  }

  static async updateUserProfile(userId: string, updates: {
    full_name?: string;
    avatar_url?: string;
    phone?: string;
    bio?: string;
    last_active?: string;
    login_count?: number;
    last_login_at?: string;
    profile_active?: boolean;
    updated_at?: string;
  }): Promise<{
    id: string;
    email?: string;
    full_name: string;
    avatar_url?: string;
    phone?: string;
    bio?: string;
    created_at: string;
    last_active?: string;
    login_count?: number;
    last_login_at?: string;
    profile_active: boolean;
  }> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({ id: userId, ...updates })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      return handleSupabaseError(error, 'updateUserProfile');
    }
  }

  // ===== SEARCH =====
  static async searchProducts(query: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`title.ilike.%${query}%,author.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      return handleSupabaseError(error, 'searchProducts');
    }
  }

  // ===== ANALYTICS =====
  static async getAnalytics(): Promise<{
    products: number;
    chapters: number;
    users: number;
    totalViews: number;
  }> {
    try {
      // Get products count
      const { count: productsCount, error: productsError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      if (productsError) throw productsError;

      // Get chapters count
      const { count: chaptersCount, error: chaptersError } = await supabase
        .from('chapters')
        .select('*', { count: 'exact', head: true });

      if (chaptersError) throw chaptersError;

      // Get users count
      const { count: usersCount, error: usersError } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });

      if (usersError) throw usersError;

      // Get total views
      const { count: totalViews, error: viewsError } = await supabase
        .from('product_views')
        .select('*', { count: 'exact', head: true });

      if (viewsError) throw viewsError;

      return {
        products: productsCount || 0,
        chapters: chaptersCount || 0,
        users: usersCount || 0,
        totalViews: totalViews || 0
      };
    } catch (error) {
      return handleSupabaseError(error, 'getAnalytics');
    }
  }
}
