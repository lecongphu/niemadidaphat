"use client";

import { useState, useEffect } from 'react';
import { SupabaseAuth, type AuthUser } from '@/lib/supabaseAuth';

interface UserProfileProps {
  className?: string;
}

export default function UserProfile({ className = '' }: UserProfileProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const currentUser = await SupabaseAuth.getCurrentUser();
      
      if (currentUser.user) {
        const profile = await SupabaseAuth.getUserProfile();
        setUser(profile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };


  const handleSignOut = async () => {
    try {
      await SupabaseAuth.signOut();
      window.location.reload();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Thông tin tài khoản
        </h2>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          🔗 Google
        </span>
      </div>

      <div className="space-y-4">
        {/* User Avatar */}
        {user.avatar_url && (
          <div className="flex justify-center">
            <img
              src={user.avatar_url}
              alt={user.full_name}
              className="w-20 h-20 rounded-full border-4 border-gray-200"
            />
          </div>
        )}

        {/* User Info */}
        <div>
          <label className="block text-sm font-medium text-gray-500">Họ tên</label>
          <p className="mt-1 text-sm text-gray-900">{user.full_name}</p>
        </div>

        {user.email && (
          <div>
            <label className="block text-sm font-medium text-gray-500">Email</label>
            <p className="mt-1 text-sm text-gray-900">{user.email}</p>
          </div>
        )}

        {user.provider && (
          <div>
            <label className="block text-sm font-medium text-gray-500">Nhà cung cấp</label>
            <p className="mt-1 text-sm text-gray-900 capitalize">{user.provider}</p>
          </div>
        )}

        {user.created_at && (
          <div>
            <label className="block text-sm font-medium text-gray-500">Ngày tạo</label>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(user.created_at).toLocaleDateString('vi-VN')}
            </p>
          </div>
        )}

        {user.last_active && (
          <div>
            <label className="block text-sm font-medium text-gray-500">Hoạt động cuối</label>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(user.last_active).toLocaleString('vi-VN')}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="pt-4 border-t border-gray-200 space-y-3">
          <button
            onClick={handleSignOut}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            🚪 Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
}
