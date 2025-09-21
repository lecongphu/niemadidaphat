import { supabase } from './supabase';
import { createClient } from '@supabase/supabase-js';
import type { User, Session } from '@supabase/supabase-js';

// Service Role Client for admin operations (server-side only)
const getSupabaseAdmin = () => {
  if (typeof window !== 'undefined') {
    throw new Error('Supabase Admin client should only be used server-side');
  }
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    } 
  );
};

export type AuthUser = {
  id: string;
  email?: string;
  full_name: string;
  avatar_url?: string;
  provider?: string;
  created_at?: string;
  last_active?: string;
};

export class SupabaseAuth {
  // Đăng nhập với Google ID Token (được sử dụng bởi Google One-Tap)
  static async signInWithGoogleIdToken(idToken: string, nonce: string) {
    try {
      console.log('Đăng nhập với Google ID Token...');
      
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
        nonce,
      });

      if (error) {
        console.error('Google ID Token sign-in error:', error);
        throw new Error(error.message || 'Có lỗi xảy ra khi đăng nhập với Google.');
      }

      return data;
    } catch (error: unknown) {
      console.error('Google ID Token sign-in error:', error);
      throw error;
    }
  }


  // Đăng xuất
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(error.message || 'Có lỗi xảy ra khi đăng xuất.');
      }
      
      // Clear local storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('guest_id');
        localStorage.removeItem('user_preferences');
      }
      
      return { success: true };
    } catch (error: unknown) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  // Lấy user hiện tại
  static async getCurrentUser(): Promise<{ user: User | null }> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session error:', error);
        return { user: null };
      }

      if (!session?.user) {
        return { user: null };
      }

      return { 
        user: session.user
      };
    } catch (error: unknown) {
      console.error('Get current user error:', error);
      return { user: null };
    }
  }

  // Lấy thông tin profile
  static async getUserProfile(userId?: string): Promise<AuthUser | null> {
    try {
      const currentUser = await this.getCurrentUser();
      const targetUserId = userId || currentUser.user?.id;

      if (!targetUserId) {
        return null;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', targetUserId)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        avatar_url: data.avatar_url,
        provider: data.provider,
        created_at: data.created_at,
        last_active: data.last_active
      };
    } catch (error: unknown) {
      console.error('Get user profile error:', error);
      return null;
    }
  }

  // Subscribe to auth changes
  static onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }


  // Debug auth config
  static async debugAuthConfig() {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      return {
        session: session ? { userId: session.user.id, expiresAt: session.expires_at } : null,
        sessionError: sessionError?.message || null,
        user: user ? { id: user.id, email: user.email } : null,
        userError: userError?.message || null,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        timestamp: new Date().toISOString()
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { error: errorMessage };
    }
  }
}

export default SupabaseAuth;
