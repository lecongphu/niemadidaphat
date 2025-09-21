"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function OAuthErrorHandler() {
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const oauthError = searchParams.get('error');
    if (oauthError) {
      switch (oauthError) {
        case 'oauth_error':
          setError('Có lỗi xảy ra khi đăng nhập với Google. Vui lòng thử lại.');
          break;
        case 'session_error':
          setError('Không thể tạo phiên đăng nhập. Vui lòng thử lại.');
          break;
        case 'no_code':
          setError('Đăng nhập không thành công. Vui lòng thử lại.');
          break;
        default:
          setError('Có lỗi xảy ra trong quá trình đăng nhập.');
      }

      // Auto-hide error after 10 seconds
      const timer = setTimeout(() => {
        setError(null);
        // Clear URL params
        window.history.replaceState({}, '', window.location.pathname);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  if (!error) return null;

  return (
    <div className="mx-2 sm:mx-4">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-red-500">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
          <button
            onClick={() => {
              setError(null);
              window.history.replaceState({}, '', window.location.pathname);
            }}
            className="text-red-400 hover:text-red-600"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
