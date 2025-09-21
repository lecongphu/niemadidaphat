import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase không được cấu hình' },
        { status: 500 }
      );
    }

    // Get all roles from Supabase
    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select('*')
      .order('created_at', { ascending: true });

    if (rolesError) {
      console.error('Roles query error:', rolesError);
      return NextResponse.json(
        { error: 'Lỗi lấy danh sách roles' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: roles || []
    });

  } catch (error: unknown) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { error: 'Lỗi lấy danh sách roles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, display_name, description, permissions } = body;

    if (!name || !display_name) {
      return NextResponse.json(
        { error: 'Tên và tên hiển thị là bắt buộc' },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase không được cấu hình' },
        { status: 500 }
      );
    }

    // Check if role already exists
    const { data: existingRole, error: checkError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', name)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Role check error:', checkError);
      return NextResponse.json(
        { error: 'Lỗi kiểm tra role' },
        { status: 500 }
      );
    }

    if (existingRole) {
      return NextResponse.json(
        { error: 'Role đã tồn tại' },
        { status: 409 }
      );
    }

    // Create new role
    const { data: newRole, error: createError } = await supabase
      .from('roles')
      .insert({
        name,
        display_name,
        description: description || '',
        permissions: permissions || [],
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (createError || !newRole) {
      console.error('Role creation error:', createError);
      return NextResponse.json(
        { error: 'Lỗi tạo role' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: newRole
    });

  } catch (error: unknown) {
    console.error('Error creating role:', error);
    return NextResponse.json(
      { error: 'Lỗi tạo role' },
      { status: 500 }
    );
  }
}