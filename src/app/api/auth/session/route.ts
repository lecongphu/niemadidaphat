import { NextRequest, NextResponse } from 'next/server';
import { SupabaseService } from '@/lib/supabaseService';
import { cookies } from 'next/headers';

// GET /api/auth/session - Get current session
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    
    const accessToken = cookieStore.get('sb-access-token')?.value;
    const refreshToken = cookieStore.get('sb-refresh-token')?.value;

    if (!accessToken && !refreshToken) {
      return NextResponse.json({
        success: false,
        data: null,
        message: 'Không có session'
      });
    }

    // Get session from Supabase
    const { data, error } = await SupabaseService.getSession(accessToken);

    if (error || !data.session) {
      // Try to refresh token
      if (refreshToken) {
        const refreshResult = await SupabaseService.refreshSession(refreshToken);
        
        if (refreshResult.data.session) {
          // Update cookies with new tokens
          cookieStore.set('sb-access-token', refreshResult.data.session.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: refreshResult.data.session.expires_in || 3600,
            path: '/'
          });

          if (refreshResult.data.session.refresh_token) {
            cookieStore.set('sb-refresh-token', refreshResult.data.session.refresh_token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 60 * 60 * 24 * 30, // 30 days
              path: '/'
            });
          }

          // Get user profile
          const userProfile = await SupabaseService.getUserProfile(refreshResult.data.user?.id);

          return NextResponse.json({
            success: true,
            data: {
              user: {
                id: refreshResult.data.user?.id,
                email: refreshResult.data.user?.email,
                profile: userProfile
              },
              session: {
                access_token: refreshResult.data.session.access_token,
                expires_at: refreshResult.data.session.expires_at,
                expires_in: refreshResult.data.session.expires_in
              }
            }
          });
        }
      }

      // Clear invalid cookies
      cookieStore.delete('sb-access-token');
      cookieStore.delete('sb-refresh-token');

      return NextResponse.json({
        success: false,
        data: null,
        message: 'Session không hợp lệ'
      });
    }

    // Get user profile
    const userProfile = await SupabaseService.getUserProfile(data.user?.id);

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: data.user?.id,
          email: data.user?.email,
          profile: userProfile
        },
        session: {
          access_token: data.session.access_token,
          expires_at: data.session.expires_at,
          expires_in: data.session.expires_in
        }
      }
    });

  } catch (error) {
    console.error('Get session API error:', error);
    return NextResponse.json(
      { 
        error: 'Lỗi server khi lấy session', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
