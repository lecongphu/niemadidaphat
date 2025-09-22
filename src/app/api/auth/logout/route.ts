import { NextRequest, NextResponse } from 'next/server';
import { SupabaseService } from '@/lib/supabaseService';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    
    // Get access token from cookie
    const accessToken = cookieStore.get('sb-access-token')?.value;
    
    if (accessToken) {
      // Sign out from Supabase
      await SupabaseService.signOut(accessToken);
    }

    // Clear cookies
    cookieStore.delete('sb-access-token');
    cookieStore.delete('sb-refresh-token');

    return NextResponse.json({
      success: true,
      message: 'Đăng xuất thành công'
    });

  } catch (error) {
    console.error('Logout API error:', error);
    
    // Still clear cookies even if Supabase signout fails
    const cookieStore = cookies();
    cookieStore.delete('sb-access-token');
    cookieStore.delete('sb-refresh-token');
    
    return NextResponse.json({
      success: true,
      message: 'Đăng xuất thành công'
    });
  }
}
