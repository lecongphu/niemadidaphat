'use client';

interface AuthResponse {
  success: boolean;
  data?: {
    user: {
      id: string;
      email: string;
      profile?: any;
    };
    session?: {
      access_token: string;
      expires_at: number;
      expires_in: number;
    };
    needsConfirmation?: boolean;
  };
  error?: string;
  message?: string;
}

interface SignUpData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
}

interface SignInData {
  email: string;
  password: string;
}

class AuthClient {
  private baseUrl = '/api/auth';

  async signIn(data: SignInData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include', // Important for cookies
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Đăng nhập thất bại');
      }

      // Store token in localStorage as backup
      if (result.data?.session?.access_token) {
        localStorage.setItem('auth_token', result.data.session.access_token);
        localStorage.setItem('user', JSON.stringify(result.data.user));
      }

      return result;
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Lỗi đăng nhập'
      };
    }
  }

  async signUp(data: SignUpData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Đăng ký thất bại');
      }

      return result;
    } catch (error) {
      console.error('Sign up error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Lỗi đăng ký'
      };
    }
  }

  async signOut(): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      const result = await response.json();

      // Clear localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');

      return result;
    } catch (error) {
      console.error('Sign out error:', error);
      
      // Clear localStorage even if API call fails
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      
      return {
        success: true,
        message: 'Đăng xuất thành công'
      };
    }
  }

  async getSession(): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/session`, {
        method: 'GET',
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success && result.data) {
        // Update localStorage
        if (result.data.session?.access_token) {
          localStorage.setItem('auth_token', result.data.session.access_token);
        }
        if (result.data.user) {
          localStorage.setItem('user', JSON.stringify(result.data.user));
        }
      } else {
        // Clear localStorage if session is invalid
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      }

      return result;
    } catch (error) {
      console.error('Get session error:', error);
      
      // Clear localStorage on error
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Lỗi lấy session'
      };
    }
  }

  // Get current user from localStorage (for immediate access)
  getCurrentUser() {
    if (typeof window === 'undefined') return null;
    
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  // Get current token from localStorage
  getCurrentToken() {
    if (typeof window === 'undefined') return null;
    
    return localStorage.getItem('auth_token');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getCurrentToken() && !!this.getCurrentUser();
  }
}

export const authClient = new AuthClient();
export default authClient;
