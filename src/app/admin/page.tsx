"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home page - admin features are being migrated
    router.push("/");
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-100 flex items-center justify-center">
      <div className="serene-card p-8 max-w-md text-center">
        <div className="w-20 h-20 lotus-gradient rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-white text-3xl">🔧</span>
        </div>
        <h1 className="text-2xl font-bold wisdom-text mb-4">
          Trang quản trị đang được nâng cấp
        </h1>
        <p className="text-amber-700/80 mb-6">
          Chức năng quản trị đang được chuyển đổi sang hệ thống mới. Vui lòng quay lại sau.
        </p>
        <p className="text-sm text-amber-600/70">
          Đang chuyển hướng về trang chủ...
        </p>
      </div>
    </div>
  );
}
