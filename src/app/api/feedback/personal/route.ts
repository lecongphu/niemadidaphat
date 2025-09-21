import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/feedback/personal - Get personal feedbacks for logged in user
export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase Admin không được cấu hình' },
        { status: 500 }
      );
    }

    // Get user from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // Verify Supabase token
    let user;
    try {
      const { data: { user: authenticatedUser }, error } = await supabase.auth.getUser(token);
      if (error || !authenticatedUser) {
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        );
      }
      user = authenticatedUser;
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get user_id from query params (for additional security check)
    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get('user_id');

    // Verify that the requested user_id matches the authenticated user
    if (requestedUserId && requestedUserId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    // Get personal feedbacks from Supabase
    const { data, error } = await supabase
      .from('feedback')
      .select(`
        id,
        message,
        status,
        priority,
        admin_notes,
        created_at,
        updated_at
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch personal feedbacks: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data: data || []
    });

  } catch (error) {
    console.error('Error in personal feedback API:', error);
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    );
  }
}
