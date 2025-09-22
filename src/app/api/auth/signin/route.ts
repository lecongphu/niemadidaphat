import { NextRequest, NextResponse } from 'next/server';
import { SupabaseService } from '@/lib/supabaseService';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email và password là bắt buộc' },
        { status: 400 }
      );
    }

    // Sign in with Supabase
    const { data, error } = await SupabaseService.signIn(email, password);

    if (error) {
      console.error('Sign in error:', error);
      return NextResponse.json(
        { error: 'Email hoặc password không đúng' },
        { status: 401 }
      );
    }

    if (!data.user || !data.session) {
      return NextResponse.json(
        { error: 'Đăng nhập thất bại' },
        { status: 401 }
      );
    }

    // Set cookies for session management
    const cookieStore = cookies();
    
    // Set access token cookie
    cookieStore.set('sb-access-token', data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: data.session.expires_in || 3600,
      path: '/'
    });

    // Set refresh token cookie
    cookieStore.set('sb-refresh-token', data.session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/'
    });

    // Get user profile
    const userProfile = await SupabaseService.getUserProfile(data.user.id);

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: data.user.id,
          email: data.user.email,
          profile: userProfile
        },
        session: {
          access_token: data.session.access_token,
          expires_at: data.session.expires_at,
          expires_in: data.session.expires_in
        }
      },
      message: 'Đăng nhập thành công'
    });

  } catch (error) {
    console.error('Sign in API error:', error);
    return NextResponse.json(
      { 
        error: 'Lỗi server khi đăng nhập', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
