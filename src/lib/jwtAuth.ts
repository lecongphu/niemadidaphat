/**
 * JWT Authentication System
 * Thay thế hoàn toàn Supabase Auth với JWT tự quản lý
 */

export interface AuthUser {
  id: string;
  email?: string;
  full_name: string;
  avatar_url?: string;
  provider?: string;
  google_id?: string;
  role?: string;
  created_at?: string;
  last_active?: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: AuthUser;
    token: string;
    expires_at: string;
  };
  error?: string;
}

class JwtAuth {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly USER_KEY = 'auth_user';
  private static readonly API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

  /**
   * Đăng nhập với Google One-Tap credential
   */
  static async signInWithGoogle(credential: string): Promise<AuthResponse> {
    try {
      console.log('Đăng nhập với Google credential...');
      
      const response = await fetch(`${this.API_BASE}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential }),
      });

      const result: AuthResponse = await response.json();

      if (result.success && result.data) {
        // Lưu token và user info vào localStorage
        this.setToken(result.data.token);
        this.setUser(result.data.user);
        
        console.log('Đăng nhập thành công:', result.data.user);
        return result;
      } else {
        throw new Error(result.error || 'Đăng nhập thất bại');
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Có lỗi xảy ra khi đăng nhập'
      };
    }
  }

  /**
   * Đăng xuất
   */
  static async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      const token = this.getToken();
      
      if (token) {
        // Gọi API logout để invalidate token trên server
        await fetch(`${this.API_BASE}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }).catch(console.error); // Ignore errors if server is down
      }

      // Clear local storage
      this.clearAuth();
      
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Có lỗi xảy ra khi đăng xuất'
      };
    }
  }

  /**
   * Lấy thông tin user hiện tại
   */
  static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const token = this.getToken();
      if (!token) {
        return null;
      }

      const response = await fetch(`${this.API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Token invalid, clear auth
        this.clearAuth();
        return null;
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        // Update user info in localStorage
        this.setUser(result.data);
        return result.data;
      }

      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      this.clearAuth();
      return null;
    }
  }

  /**
   * Lấy user từ localStorage (không gọi API)
   */
  static getCachedUser(): AuthUser | null {
    try {
      const userStr = localStorage.getItem(this.USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  /**
   * Kiểm tra xem user có đăng nhập không
   */
  static isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getCachedUser();
    return !!(token && user);
  }

  /**
   * Lấy token từ localStorage
   */
  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Lưu token vào localStorage
   */
  private static setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Lưu user info vào localStorage
   */
  private static setUser(user: AuthUser): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Xóa tất cả auth data khỏi localStorage
   */
  private static clearAuth(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem('guest_id');
    localStorage.removeItem('user_preferences');
  }

  /**
   * Refresh token (nếu cần)
   */
  static async refreshToken(): Promise<{ success: boolean; error?: string }> {
    try {
      const token = this.getToken();
      if (!token) {
        return { success: false, error: 'No token to refresh' };
      }

      const response = await fetch(`${this.API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success && result.data) {
        this.setToken(result.data.token);
        return { success: true };
      } else {
        this.clearAuth();
        return { success: false, error: result.error || 'Token refresh failed' };
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      this.clearAuth();
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Token refresh failed'
      };
    }
  }

  /**
   * Tạo HTTP headers với authorization
   */
  static getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  /**
   * Debug auth state
   */
  static debugAuthState() {
    return {
      isAuthenticated: this.isAuthenticated(),
      hasToken: !!this.getToken(),
      cachedUser: this.getCachedUser(),
      timestamp: new Date().toISOString()
    };
  }
}

export default JwtAuth;
