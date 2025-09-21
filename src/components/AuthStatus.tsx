"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { clearSavedLoginInfo } from "@/lib/loginStorage";
import GoogleOneTap from "./GoogleOneTap";
import { SupabaseAuth, type AuthUser } from "@/lib/supabaseAuth";

export default function AuthStatus() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();

    // Lắng nghe thay đổi auth state từ Supabase
    const { data: { subscription } } = SupabaseAuth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
      } else if (session?.user) {
        const profile = await SupabaseAuth.getUserProfile();
        setUser(profile);
      }
      setLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await SupabaseAuth.getCurrentUser();
      
      if (currentUser.user) {
        const profile = await SupabaseAuth.getUserProfile();
        setUser(profile);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    // Xóa thông tin đăng nhập đã lưu
    clearSavedLoginInfo();
    
    // Đăng xuất khỏi Supabase
    await SupabaseAuth.signOut();
    
    // Chuyển về trang chủ
    router.push("/");
  };

  const handleGoogleSignIn = () => {
    // Google One-Tap sẽ được khởi tạo tự động
    // Không cần xử lý gì ở đây vì One-Tap tự động hiển thị
    console.log('Google One-Tap sẽ được khởi tạo tự động');
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
        <span className="text-sm text-gray-600">Đang tải...</span>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center space-x-2 lg:space-x-4">
        <Link
          href="/tai-khoan/trang-ca-nhan"
          className="flex items-center space-x-1 lg:space-x-2 bg-white/90 hover:bg-white text-amber-800 px-2 lg:px-3 py-1 lg:py-2 rounded-lg shadow-sm hover:shadow-md transition-all text-xs lg:text-sm"
        >
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.full_name}
              className="w-6 h-6 lg:w-8 lg:h-8 rounded-full border border-gray-200"
            />
          ) : (
            <span className="text-sm lg:text-base">👨‍💼</span>
          )}
          <span className="font-medium hidden sm:inline">
            {user.full_name}
          </span>
        </Link>
        
        <div className="hidden lg:flex items-center space-x-2">
          <Link
            href="/admin"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Admin
          </Link>
          <button
            onClick={handleSignOut}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    );
  }

  // Show Google One-Tap and fallback options when not logged in
  return (
    <>
      {/* Google One-Tap sẽ tự động hiển thị */}
      <GoogleOneTap 
        onSuccess={() => {
          console.log('Google One-Tap đăng nhập thành công');
          checkAuth(); // Refresh auth state
        }}
        onError={(error) => {
          console.error('Google One-Tap lỗi:', error);
        }}
      />
      
      <div className="flex items-center space-x-2">
        <div className="text-xs lg:text-sm text-gray-600 bg-white/90 px-2 lg:px-3 py-1 lg:py-2 rounded-lg shadow-sm">
          <Link 
            href="/tai-khoan/dang-nhap"
            className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
          >
            Đăng nhập thủ công
          </Link>
        </div>
      </div>
    </>
  );
}