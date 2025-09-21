"use client";

import { useState, useEffect } from 'react';
import { SupabaseService } from '@/lib/supabaseService';
import { isAdmin } from '@/lib/authUtils';

interface AnalyticsData {
  summary: {
    total_products: number;
    total_followers: number;
    total_views: number;
    total_unique_views: number;
    active_users_today: number;
    growth_rate: number;
  };
  products: Array<{
    id: string;
    title: string;
    author: string;
    category?: string | null;
    total_views?: number;
    unique_views?: number;
    followers_count?: number;
    created_at?: string;
  }>;
  categories: Array<{
    name: string;
    products: number;
    totalViews: number;
    totalFollowers: number;
  }>;
}

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdminUser, setIsAdminUser] = useState(false);

  useEffect(() => {
    const checkAdminAndFetchData = async () => {
      try {
        // Kiểm tra quyền admin
        const adminStatus = await isAdmin();
        setIsAdminUser(adminStatus);

        if (!adminStatus) {
          setError('Bạn không có quyền truy cập trang này');
          setLoading(false);
          return;
        }

        // Fetch analytics data
        await fetchAnalytics();
      } catch (err: unknown) {
        console.error('Error checking admin status:', err);
        setError('Có lỗi xảy ra khi kiểm tra quyền truy cập');
        setLoading(false);
      }
    };

    checkAdminAndFetchData();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch basic analytics
      const basicAnalytics = await SupabaseService.getAnalytics();
      
      // Fetch products with stats
      const products = await SupabaseService.getProducts();
      
      // Calculate category stats
      const categoryStats = products.reduce((acc: Record<string, {
        name: string;
        products: number;
        totalViews: number;
        totalFollowers: number;
      }>, product) => {
        const category = product.category || 'other';
        if (!acc[category]) {
          acc[category] = {
            name: category,
            products: 0,
            totalViews: 0,
            totalFollowers: 0
          };
        }
        acc[category].products++;
        acc[category].totalViews += product.total_views || 0;
        acc[category].totalFollowers += product.followers_count || 0;
        return acc;
      }, {});

      const analyticsData: AnalyticsData = {
        summary: {
          total_products: basicAnalytics.products,
          total_followers: products.reduce((sum, p) => sum + (p.followers_count || 0), 0),
          total_views: basicAnalytics.totalViews,
          total_unique_views: products.reduce((sum, p) => sum + (p.unique_views || 0), 0),
          active_users_today: basicAnalytics.users,
          growth_rate: 0 // TODO: Calculate growth rate
        },
        products: products.slice(0, 10), // Top 10 products
        categories: Object.values(categoryStats)
      };

      setAnalytics(analyticsData);
      setError(null);
    } catch (err: unknown) {
      console.error('Error fetching analytics:', err);
      setError('Có lỗi xảy ra khi tải dữ liệu analytics');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdminUser && !loading) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800 font-medium">Không có quyền truy cập</div>
        <div className="text-red-600 text-sm mt-1">
          Bạn cần có quyền admin để xem trang này.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800 font-medium">Lỗi tải dữ liệu</div>
        <div className="text-red-600 text-sm mt-1">{error}</div>
        <button
          onClick={fetchAnalytics}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Làm mới
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Tổng sản phẩm</div>
          <div className="text-2xl font-bold text-gray-900">{analytics.summary.total_products}</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Tổng lượt theo dõi</div>
          <div className="text-2xl font-bold text-gray-900">{analytics.summary.total_followers}</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Tổng lượt xem</div>
          <div className="text-2xl font-bold text-gray-900">{analytics.summary.total_views}</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Người dùng hoạt động</div>
          <div className="text-2xl font-bold text-gray-900">{analytics.summary.active_users_today}</div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Sản phẩm hàng đầu</h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lượt xem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Theo dõi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Danh mục
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{product.title}</div>
                        <div className="text-sm text-gray-500">{product.author}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.total_views || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.followers_count || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {product.category || 'Khác'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Thống kê theo danh mục</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {analytics.categories.map((category) => (
              <div key={category.name} className="border border-gray-200 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-900 capitalize">{category.name}</div>
                <div className="mt-2 space-y-1">
                  <div className="text-xs text-gray-500">Sản phẩm: {category.products}</div>
                  <div className="text-xs text-gray-500">Lượt xem: {category.totalViews}</div>
                  <div className="text-xs text-gray-500">Theo dõi: {category.totalFollowers}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}