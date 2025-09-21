import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/users/[id] - Lấy thông tin chi tiết user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase không được cấu hình' },
        { status: 500 }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'User ID không đúng định dạng UUID' },
        { status: 400 }
      );
    }
    
    // Get user profile with roles
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select(`
        id,
        email,
        full_name,
        avatar_url,
        phone,
        bio,
        created_at,
        last_active,
        login_count,
        last_login_at,
        profile_active,
        user_roles(
          id,
          role,
          permissions,
          assigned_at,
          expires_at,
          is_active
        )
      `)
      .eq('id', id)
      .single();
    
    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Format user data
    const user = {
      ...userProfile,
      roles: (userProfile.user_roles || []).map((role: {
        id: string;
        role: string;
        permissions: string[];
        assigned_at: string;
        expires_at: string | null;
        is_active: boolean;
      }) => ({
        name: role.role,
        permissions: role.permissions,
        assigned_at: role.assigned_at,
        expires_at: role.expires_at,
        is_active: role.is_active
      }))
    };

    return NextResponse.json({ 
      success: true,
      data: user 
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }
}

// PUT /api/users/[id] - Cập nhật thông tin user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { full_name, phone, bio, profile_active } = body;

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase không được cấu hình' },
        { status: 500 }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'User ID không đúng định dạng UUID' },
        { status: 400 }
      );
    }

    // Check if user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', id)
      .single();

    if (checkError || !existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user profile
    const { data: updatedUser, error: updateError } = await supabase
      .from('user_profiles')
      .update({
        full_name,
        phone,
        bio,
        profile_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError || !updatedUser) {
      console.error('Update user error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Xóa user (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase không được cấu hình' },
        { status: 500 }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'User ID không đúng định dạng UUID' },
        { status: 400 }
      );
    }

    // Check if user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', id)
      .single();

    if (checkError || !existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Soft delete by setting profile_active to false
    const { data: updatedProfile, error: profileError } = await supabase
      .from('user_profiles')
      .update({
        profile_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (profileError || !updatedProfile) {
      console.error('Profile deactivation error:', profileError);
      return NextResponse.json(
        { error: 'Failed to deactivate user profile' },
        { status: 500 }
      );
    }

    // Deactivate all user roles
    const { error: rolesError } = await supabase
      .from('user_roles')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', id);

    if (rolesError) {
      console.error('Roles deactivation error:', rolesError);
      // Continue even if roles deactivation fails
    }

    return NextResponse.json({
      success: true,
      message: 'User deactivated successfully',
      data: updatedProfile
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
