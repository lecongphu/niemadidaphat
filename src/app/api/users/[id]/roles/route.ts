import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST /api/users/[id]/roles - Gán role cho user
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { role_id, expires_at } = body;

    if (!role_id) {
      return NextResponse.json(
        { error: 'Role ID is required' },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase Admin không được cấu hình' },
        { status: 500 }
      );
    }

    // Check if user already has this role
    const { data: existingRole, error: existingRoleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', id)
      .eq('role_id', role_id)
      .single();

    if (existingRole) {
      // Reactivate existing role
      const { error: updateError } = await supabase
        .from('user_roles')
        .update({
          is_active: true,
          expires_at,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingRole.id);

      if (updateError) {
        throw new Error(`Failed to update role: ${updateError.message}`);
      }
    } else {
      // Create new role assignment
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: id,
          role_id,
          expires_at,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        throw new Error(`Failed to create role: ${insertError.message}`);
      }
    }

    return NextResponse.json({
      message: 'Role assigned successfully'
    });

  } catch (error) {
    console.error('Error assigning role:', error);
    return NextResponse.json(
      { error: 'Failed to assign role' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id]/roles/[roleId] - Xóa role của user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const roleId = searchParams.get('role_id');

    if (!roleId) {
      return NextResponse.json(
        { error: 'Role ID is required' },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase Admin không được cấu hình' },
        { status: 500 }
      );
    }

    // Deactivate role assignment
    const { error: updateError } = await supabase
      .from('user_roles')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', id)
      .eq('role_id', roleId);

    if (updateError) {
      throw new Error(`Failed to remove role: ${updateError.message}`);
    }

    return NextResponse.json({
      message: 'Role removed successfully'
    });

  } catch (error) {
    console.error('Error removing role:', error);
    return NextResponse.json(
      { error: 'Failed to remove role' },
      { status: 500 }
    );
  }
}
