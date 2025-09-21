import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'userId và role là bắt buộc' },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase không được cấu hình' },
        { status: 500 }
      );
    }

    // Validate UUID format for userId
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return NextResponse.json(
        { error: 'User ID không đúng định dạng UUID' },
        { status: 400 }
      );
    }

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Không tìm thấy user' },
        { status: 404 }
      );
    }

    // Check if role already exists for this user
    const { data: existingRole, error: existingRoleError } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .eq('role', role)
      .eq('is_active', true)
      .single();

    if (existingRoleError && existingRoleError.code !== 'PGRST116') {
      console.error('Existing role check error:', existingRoleError);
    }

    if (existingRole) {
      return NextResponse.json(
        { error: 'User đã có role này' },
        { status: 409 }
      );
    }
    
    // Assign role to user
    const { data: newRole, error: insertError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role: role,
        permissions: [], // Default empty permissions
        is_active: true,
        assigned_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError || !newRole) {
      console.error('Role assignment error:', insertError);
      return NextResponse.json(
        { error: 'Lỗi gán role' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { 
        id: newRole.id, 
        userId, 
        role: newRole.role,
        assigned_at: newRole.assigned_at
      }
    });

  } catch (error: unknown) {
    console.error('Error assigning role:', error);
    return NextResponse.json(
      { error: 'Lỗi gán role' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'userId và role là bắt buộc' },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase không được cấu hình' },
        { status: 500 }
      );
    }

    // Validate UUID format for userId
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return NextResponse.json(
        { error: 'User ID không đúng định dạng UUID' },
        { status: 400 }
      );
    }

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Không tìm thấy user' },
        { status: 404 }
      );
    }

    // Check if role exists for this user
    const { data: existingRole, error: existingRoleError } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .eq('role', role)
      .eq('is_active', true)
      .single();

    if (existingRoleError && existingRoleError.code !== 'PGRST116') {
      console.error('Existing role check error:', existingRoleError);
    }

    if (!existingRole) {
      return NextResponse.json(
        { error: 'User không có role này' },
        { status: 404 }
      );
    }
    
    // Remove role from user (soft delete)
    const { data: updatedRole, error: updateError } = await supabase
      .from('user_roles')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('role', role)
      .eq('is_active', true)
      .select()
      .single();

    if (updateError || !updatedRole) {
      console.error('Role removal error:', updateError);
      return NextResponse.json(
        { error: 'Lỗi xóa role' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { 
        userId, 
        role: updatedRole.role, 
        removed: true,
        updated_at: updatedRole.updated_at
      }
    });

  } catch (error: unknown) {
    console.error('Error removing role:', error);
    return NextResponse.json(
      { error: 'Lỗi xóa role' },
      { status: 500 }
    );
  }
}
