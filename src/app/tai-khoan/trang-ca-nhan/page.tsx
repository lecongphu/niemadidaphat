"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtAuth } from '@/lib/jwtAuth';
import type { AuthUser } from '@/lib/jwtAuth';

export default function ProfilePage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = jwtAuth.getCurrentUser();
      
      if (!currentUser) {
        router.push('/');
        return;
      }

      setUser(currentUser);
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 lotus-gradient rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white text-2xl">🪷</span>
          </div>
          <p className="text-amber-700/80">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold wisdom-text">Trang cá nhân</h1>
          <p className="mt-2 text-amber-700/80">
            Quản lý thông tin tài khoản của bạn
          </p>
        </div>

        {/* User Info Card */}
        <div className="serene-card p-6 sm:p-8 mb-6">
          <div className="flex items-center gap-4 mb-6">
            {user?.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt={user.full_name}
                className="w-20 h-20 rounded-full"
              />
            ) : (
              <div className="w-20 h-20 lotus-gradient rounded-full flex items-center justify-center">
                <span className="text-white text-3xl">🪷</span>
              </div>
            )}
            <div>
              <h2 className="text-2xl font-semibold wisdom-text">{user?.full_name}</h2>
              <p className="text-amber-700/80">{user?.email}</p>
            </div>
          </div>

          {/* Account Type */}
          <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
            <div>
              <h3 className="font-medium wisdom-text">Loại tài khoản</h3>
              <p className="text-sm text-amber-700/80">
                Tài khoản Google - {user?.provider}
              </p>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              ✅ Đã xác thực
            </span>
          </div>
        </div>

        {/* Features */}
        <div className="serene-card p-6 sm:p-8">
          <h3 className="text-xl font-semibold wisdom-text mb-4">
            🌟 Tính năng tài khoản
          </h3>
          <ul className="space-y-2 text-amber-700/80">
            <li className="flex items-center gap-2">
              <span className="text-green-600">✅</span>
              <span>Nghe nhạc và đọc sách</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✅</span>
              <span>Theo dõi sản phẩm yêu thích</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✅</span>
              <span>Gửi phản hồi và góp ý</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✅</span>
              <span>Đồng bộ dữ liệu trên nhiều thiết bị</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
