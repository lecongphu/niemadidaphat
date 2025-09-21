"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SupabaseAuth, type AuthUser } from '@/lib/supabaseAuth';
import UserProfile from '@/components/UserProfile';

export default function ProfilePage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await SupabaseAuth.getCurrentUser();
      
      if (!currentUser.user) {
        // No authenticated user, redirect to home
        router.push('/');
        return;
      }

      const profile = await SupabaseAuth.getUserProfile();
      setUser(profile);
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Trang cá nhân</h1>
          <p className="mt-2 text-gray-600">
            Quản lý thông tin tài khoản và cài đặt của bạn
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Profile */}
          <div className="lg:col-span-1">
            <UserProfile />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Thông tin chi tiết
              </h2>

              <div className="space-y-6">
                {/* Account Type */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Loại tài khoản</h3>
                    <p className="text-sm text-gray-600">
                      Tài khoản đăng ký - Có email
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    📧 Đăng ký
                  </span>
                </div>

                {/* Features for Registered Users */}
                {user?.email && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-medium text-green-900 mb-2">
                      🌟 Tính năng tài khoản
                    </h3>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>✅ Nghe nhạc và đọc sách</li>
                      <li>✅ Theo dõi sản phẩm yêu thích</li>
                      <li>✅ Gửi phản hồi và góp ý</li>
                      <li>✅ Đồng bộ dữ liệu trên nhiều thiết bị</li>
                      <li>✅ Khôi phục tài khoản khi quên mật khẩu</li>
                      <li>✅ Nhận thông báo qua email</li>
                      <li>✅ Bảo mật cao</li>
                    </ul>
                  </div>
                )}

                {/* Privacy Note */}
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">
                    🔒 Quyền riêng tư
                  </h3>
                  <p className="text-sm text-gray-600">
                    Chúng tôi chỉ thu thập thông tin cần thiết để cung cấp dịch vụ. Email của bạn sẽ được bảo mật tuyệt đối.
                  </p>
                </div>

                {/* Usage Stats (placeholder) */}
                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <h3 className="font-medium text-indigo-900 mb-2">
                    📊 Thống kê sử dụng
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-indigo-600 font-medium">Sản phẩm đã theo dõi</p>
                      <p className="text-indigo-800">0</p>
                    </div>
                    <div>
                      <p className="text-indigo-600 font-medium">Phản hồi đã gửi</p>
                      <p className="text-indigo-800">0</p>
                    </div>
                    <div>
                      <p className="text-indigo-600 font-medium">Thời gian nghe</p>
                      <p className="text-indigo-800">0 phút</p>
                    </div>
                    <div>
                      <p className="text-indigo-600 font-medium">Trang đã xem</p>
                      <p className="text-indigo-800">0</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
