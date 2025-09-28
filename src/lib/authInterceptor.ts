// Auth Interceptor để handle auth errors và refresh token
import { supabase } from './supabase';

class AuthInterceptor {
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;

  async handleAuthError(error: unknown): Promise<boolean> {
    // Nếu đã có refresh đang chạy, chờ nó hoàn thành
    if (this.isRefreshing && this.refreshPromise) {
      return await this.refreshPromise;
    }

    // Nếu lỗi là auth related và có thể refresh
    if (this.isAuthError(error)) {
      this.isRefreshing = true;
      this.refreshPromise = this.refreshToken();
      
      try {
        const success = await this.refreshPromise;
        return success;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    }

    return false;
  }

  private isAuthError(error: unknown): boolean {
    if (!error) return false;
    
    const errorObj = error as { message?: string; code?: string };
    const errorMessage = errorObj.message?.toLowerCase() || '';
    const errorCode = errorObj.code || '';
    
    return (
      errorMessage.includes('jwt') ||
      errorMessage.includes('token') ||
      errorMessage.includes('unauthorized') ||
      errorMessage.includes('authentication') ||
      errorCode === 'PGRST301' || // Supabase auth error
      errorCode === '401'
    );
  }

  private async refreshToken(): Promise<boolean> {
    try {
      console.log('🔄 Attempting to refresh token...');
      
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('❌ Token refresh failed:', error);
        return false;
      }
      
      if (data.session) {
        console.log('✅ Token refreshed successfully');
        return true;
      }
      
      console.log('❌ No session returned from refresh');
      return false;
    } catch (error) {
      console.error('❌ Token refresh error:', error);
      return false;
    }
  }

  // Wrapper cho API calls
  async withAuthRetry<T>(apiCall: () => Promise<T>): Promise<T> {
    try {
      return await apiCall();
    } catch (error) {
      const shouldRetry = await this.handleAuthError(error);
      
      if (shouldRetry) {
        console.log('🔄 Retrying API call after token refresh...');
        return await apiCall();
      }
      
      throw error;
    }
  }
}

export const authInterceptor = new AuthInterceptor();
export default authInterceptor;
