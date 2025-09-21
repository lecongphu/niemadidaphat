import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const runtime = 'nodejs';

// POST /api/analytics/view - Track product view
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, userId, viewDuration } = body;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase không được cấu hình' },
        { status: 500 }
      );
    }

    // Get client IP and user agent
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const referrer = request.headers.get('referer') || null;

    // Track product view
    const { data: viewRecord, error: insertError } = await supabase
      .from('product_views')
      .insert({
        product_id: productId,
        user_id: userId || null,
        ip_address: ip !== 'unknown' ? ip : null,
        user_agent: userAgent,
        referrer: referrer,
        view_duration: viewDuration || 0,
        viewed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError || !viewRecord) {
      console.error('View tracking error:', insertError);
      return NextResponse.json(
        { error: 'Failed to track view' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'View tracked successfully',
      viewId: viewRecord.id
    });

  } catch (error) {
    console.error('Error in view tracking API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/analytics/view?productId=xxx - Get view statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase không được cấu hình' },
        { status: 500 }
      );
    }

    // Get product analytics
    const { count: totalViews } = await supabase
      .from('product_views')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', productId);

    // Get unique views (distinct IP addresses)
    const { data: uniqueViewsData, error: uniqueViewsError } = await supabase
      .from('product_views')
      .select('ip_address')
      .eq('product_id', productId)
      .not('ip_address', 'is', null);

    if (uniqueViewsError) {
      console.error('Unique views query error:', uniqueViewsError);
    }

    // Calculate unique views
    const uniqueIPs = new Set((uniqueViewsData || []).map(view => view.ip_address));
    const uniqueViews = uniqueIPs.size;

    // Get average view duration
    const { data: durationData, error: durationError } = await supabase
      .from('product_views')
      .select('view_duration')
      .eq('product_id', productId)
      .not('view_duration', 'is', null);

    if (durationError) {
      console.error('Duration query error:', durationError);
    }

    const avgViewDuration = durationData && durationData.length > 0 
      ? durationData.reduce((sum, view) => sum + (view.view_duration || 0), 0) / durationData.length
      : 0;
    
    const analytics = {
      id: productId,
      total_views: totalViews || 0,
      unique_views: uniqueViews,
      avg_view_duration: Math.round(avgViewDuration)
    };

    // Get recent views (last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const { data: recentViews, error: recentViewsError } = await supabase
      .from('product_views')
      .select('*')
      .eq('product_id', productId)
      .gte('viewed_at', twentyFourHoursAgo.toISOString())
      .order('viewed_at', { ascending: false })
      .limit(100);

    if (recentViewsError) {
      console.error('Recent views query error:', recentViewsError);
    }

    return NextResponse.json({
      success: true,
      data: {
        analytics,
        recentViews: recentViews || []
      }
    });

  } catch (error) {
    console.error('Error in analytics API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
