import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface CategoryStatsItem {
  name: string;
  products: number;
  totalViews: number;
  totalFollowers: number;
  avgEngagement: number;
}

export const runtime = 'nodejs';

// GET /api/analytics/dashboard - Get comprehensive admin analytics
export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase không được cấu hình' },
        { status: 500 }
      );
    }

    // Get overall summary
    const { count: totalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    const { count: totalViews } = await supabase
      .from('product_views')
      .select('*', { count: 'exact', head: true });

    const { count: totalFollowers } = await supabase
      .from('followers')
      .select('*', { count: 'exact', head: true });

    // Get today's views
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: totalViewsToday } = await supabase
      .from('product_views')
      .select('*', { count: 'exact', head: true })
      .gte('viewed_at', today.toISOString());

    // Get today's followers
    const { count: newFollowersToday } = await supabase
      .from('followers')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    const summary = {
      total_products: totalProducts || 0,
      total_followers: totalFollowers || 0,
      total_views: totalViews || 0,
      total_unique_views: totalViews || 0, // Simplified for now
      total_views_today: totalViewsToday || 0,
      new_followers_today: newFollowersToday || 0
    };

    // Get all products with analytics
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, title, category');

    if (productsError) {
      console.error('Products query error:', productsError);
      return NextResponse.json(
        { error: 'Lỗi lấy danh sách sản phẩm' },
        { status: 500 }
      );
    }

    const productsAnalytics = await Promise.all(
      (products || []).map(async (product) => {
        const { count: productViews } = await supabase
          .from('product_views')
          .select('*', { count: 'exact', head: true })
          .eq('product_id', product.id);

        const { count: productFollowers } = await supabase
          .from('followers')
          .select('*', { count: 'exact', head: true })
          .eq('product_id', product.id);
        
        return {
          id: product.id,
          title: product.title,
          category: product.category,
          total_views: productViews || 0,
          followers_count: productFollowers || 0,
          engagement_rate: (productFollowers || 0) > 0 ? parseFloat((((productFollowers || 0) / (productViews || 1)) * 100).toFixed(2)) : 0
        };
      })
    );

    // Sort by views
    productsAnalytics.sort((a, b) => b.total_views - a.total_views);

    // Get realtime followers (last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const { data: realtimeFollowers, error: followersError } = await supabase
      .from('followers')
      .select('*')
      .gte('created_at', twentyFourHoursAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(50);

    if (followersError) {
      console.error('Realtime followers query error:', followersError);
    }

    // Get top products by different metrics
    const topProductsByViews = productsAnalytics.slice(0, 5);
    const topProductsByFollowers = [...productsAnalytics]
      .sort((a, b) => b.followers_count - a.followers_count)
      .slice(0, 5);
    const topProductsByEngagement = [...productsAnalytics]
      .sort((a, b) => b.engagement_rate - a.engagement_rate)
      .slice(0, 5);

    // Get hourly views for today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const { data: hourlyViews, error: hourlyViewsError } = await supabase
      .from('product_views')
      .select('viewed_at')
      .gte('viewed_at', todayStart.toISOString());

    if (hourlyViewsError) {
      console.error('Hourly views query error:', hourlyViewsError);
    }

    // Process hourly data
    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
      const hourString = hour.toString().padStart(2, '0');
      const count = (hourlyViews || []).filter(view => {
        const viewHour = new Date(view.viewed_at).getHours();
        return viewHour === hour;
      }).length;
      
      return {
        hour: `${hourString}:00`,
        views: count
      };
    });

    // Get daily views for last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const { data: dailyViews, error: dailyViewsError } = await supabase
      .from('product_views')
      .select('viewed_at')
      .gte('viewed_at', sevenDaysAgo.toISOString());

    if (dailyViewsError) {
      console.error('Daily views query error:', dailyViewsError);
    }

    // Process daily data
    const dailyData = Array.from({ length: 7 }, (_, dayIndex) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - dayIndex));
      const dateString = date.toISOString().split('T')[0];
      
      const count = (dailyViews || []).filter(view => {
        const viewDate = new Date(view.viewed_at).toISOString().split('T')[0];
        return viewDate === dateString;
      }).length;
      
      return {
        date: dateString,
        day: date.toLocaleDateString('vi-VN', { weekday: 'short' }),
        views: count
      };
    });

    // Get category statistics
    const categoryStats = productsAnalytics.reduce((acc, product) => {
      const category = product.category || 'Khác';
      if (!acc[category]) {
        acc[category] = {
          name: category,
          products: 0,
          totalViews: 0,
          totalFollowers: 0,
          avgEngagement: 0
        };
      }
      
      acc[category].products += 1;
      acc[category].totalViews += product.total_views || 0;
      acc[category].totalFollowers += product.followers_count || 0;
      acc[category].avgEngagement += product.engagement_rate || 0;
      
      return acc;
    }, {} as Record<string, CategoryStatsItem>);

    // Calculate average engagement per category
    (Object.values(categoryStats) as CategoryStatsItem[]).forEach((cat) => {
      cat.avgEngagement = cat.products > 0 ? parseFloat((cat.avgEngagement / cat.products).toFixed(2)) : 0;
    });

    return NextResponse.json({
      success: true,
      data: {
        summary,
        productsAnalytics,
        realtimeFollowers: realtimeFollowers || [],
        topProducts: {
          byViews: topProductsByViews,
          byFollowers: topProductsByFollowers,
          byEngagement: topProductsByEngagement
        },
        charts: {
          hourlyViews: hourlyData,
          dailyViews: dailyData
        },
        categoryStats: Object.values(categoryStats),
        feedbackStats: {
          total_feedback: 0,
          pending_count: 0,
          read_count: 0,
          replied_count: 0,
          resolved_count: 0,
          urgent_count: 0,
          high_count: 0,
          recent_feedback: 0
        }
      }
    });

  } catch (error) {
    console.error('Error in analytics dashboard API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
