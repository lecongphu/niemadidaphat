import { NextRequest, NextResponse } from 'next/server';
import { SupabaseService } from '@/lib/supabaseService';

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, confirmPassword } = await request.json();

    // Validate input
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Email, password và họ tên là bắt buộc' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Mật khẩu xác nhận không khớp' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Mật khẩu phải có ít nhất 6 ký tự' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await SupabaseService.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email này đã được sử dụng' },
        { status: 409 }
      );
    }

    // Sign up with Supabase
    const { data, error } = await SupabaseService.signUp(email, password, {
      full_name: fullName
    });

    if (error) {
      console.error('Sign up error:', error);
      return NextResponse.json(
        { error: 'Lỗi khi tạo tài khoản: ' + error.message },
        { status: 400 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'Không thể tạo tài khoản' },
        { status: 400 }
      );
    }

    // Create user profile
    const profileData = {
      user_id: data.user.id,
      full_name: fullName,
      email: email,
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const userProfile = await SupabaseService.createUserProfile(profileData);

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: data.user.id,
          email: data.user.email,
          profile: userProfile
        },
        needsConfirmation: !data.session // If no session, email confirmation is required
      },
      message: data.session 
        ? 'Tài khoản đã được tạo thành công' 
        : 'Tài khoản đã được tạo. Vui lòng kiểm tra email để xác nhận.'
    }, { status: 201 });

  } catch (error) {
    console.error('Sign up API error:', error);
    return NextResponse.json(
      { 
        error: 'Lỗi server khi tạo tài khoản', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
