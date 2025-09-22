'use client';

import { useState, useEffect, useCallback } from 'react';
import { authClient } from '@/lib/authClient';

interface User {
  id: string;
  email: string;
  profile?: {
    full_name: string;
    avatar_url?: string;
    phone?: string;
    bio?: string;
  };
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Load initial session
  const loadSession = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // First check localStorage for immediate UI update
      const cachedUser = authClient.getCurrentUser();
      if (cachedUser) {
        setState({
          user: cachedUser,
          isLoading: true, // Still loading from server
          isAuthenticated: true,
        });
      }

      // Then verify with server
      const response = await authClient.getSession();
      
      if (response.success && response.data?.user) {
        setState({
          user: response.data.user,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.error('Load session error:', error);
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, []);

  // Sign in
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const response = await authClient.signIn({ email, password });
      
      if (response.success && response.data?.user) {
        setState({
          user: response.data.user,
          isLoading: false,
          isAuthenticated: true,
        });
        return { success: true, message: response.message };
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: response.error };
      }
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Lỗi đăng nhập' 
      };
    }
  }, []);

  // Sign up
  const signUp = useCallback(async (data: {
    email: string;
    password: string;
    confirmPassword: string;
    fullName: string;
  }) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const response = await authClient.signUp(data);
      
      setState(prev => ({ ...prev, isLoading: false }));
      
      if (response.success) {
        if (response.data?.user && !response.data.needsConfirmation) {
          // User is signed in immediately
          setState({
            user: response.data.user,
            isLoading: false,
            isAuthenticated: true,
          });
        }
        return { 
          success: true, 
          message: response.message,
          needsConfirmation: response.data?.needsConfirmation 
        };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Lỗi đăng ký' 
      };
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      await authClient.signOut();
      
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
      
      // Redirect to home or login page
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
      
      return { success: true };
    } catch (error) {
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Lỗi đăng xuất' 
      };
    }
  }, []);

  // Update user profile
  const updateProfile = useCallback((updates: Partial<User['profile']>) => {
    setState(prev => ({
      ...prev,
      user: prev.user ? {
        ...prev.user,
        profile: { ...prev.user.profile, ...updates }
      } : null
    }));
  }, []);

  // Initialize auth state on mount
  useEffect(() => {
    loadSession();
  }, [loadSession]);

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshSession: loadSession,
  };
}
