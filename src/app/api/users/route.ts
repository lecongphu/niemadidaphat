import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/users - Lấy danh sách users với phân trang và filter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || 'all';
    const status = searchParams.get('status') || 'all';

    const offset = (page - 1) * limit;

    // Build Supabase query
    let query = supabase
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
      .order('created_at', { ascending: false });

    // Apply search filter
    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    // Apply status filter
    if (status !== 'all') {
      query = query.eq('profile_active', status === 'active');
    }

    // Note: Role filtering will be done after fetching data
    // since we're using left join and need to filter on the client side

    // Get all users first (we'll apply pagination after filtering)
    const { data: allUsers, error: usersError } = await query;

    if (usersError) {
      console.error('Users query error:', usersError);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    // Format users with roles
    let usersWithRoles = (allUsers || []).map(user => ({
      id: user.id,
      email: user.email,
      user_created_at: user.created_at,
      last_sign_in_at: user.last_login_at,
      email_confirmed_at: user.email ? user.created_at : null, // Assume confirmed if email exists
      full_name: user.full_name,
      avatar_url: user.avatar_url,
      phone: user.phone,
      bio: user.bio,
      last_login_at: user.last_login_at,
      login_count: user.login_count || 0,
      profile_active: user.profile_active,
      roles: user.user_roles?.map((role: {
        id: string;
        role: string;
        permissions: string[];
        assigned_at: string;
        expires_at: string | null;
        is_active: boolean;
      }) => ({
        id: role.id,
        name: role.role,
        display_name: role.role.charAt(0).toUpperCase() + role.role.slice(1),
        permissions: role.permissions || [],
        assigned_at: role.assigned_at,
        expires_at: role.expires_at,
        is_active: role.is_active
      })) || []
    }));

    // Apply role filter after fetching data
    if (role !== 'all') {
      usersWithRoles = usersWithRoles.filter(user => 
        user.roles.some((r: {
          id: string;
          name: string;
          display_name: string;
          permissions: string[];
          assigned_at: string;
          expires_at: string | null;
          is_active: boolean;
        }) => r.name === role && r.is_active)
      );
    }

    // Apply pagination after all filtering
    const totalCount = usersWithRoles.length;
    const paginatedUsers = usersWithRoles.slice(offset, offset + limit);

    return NextResponse.json({
      users: paginatedUsers,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/users - Tạo user mới (chỉ admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, full_name, role } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase không được cấu hình' },
        { status: 500 }
      );
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: full_name || '',
        provider: 'email'
      }
    });

    if (authError) {
      console.error('Auth user creation error:', authError);
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      );
    }

    // Create user profile
    const userProfile = {
      id: authData.user.id,
      email: email,
      full_name: full_name || '',
      provider: 'email',
      profile_active: true,
      created_at: new Date().toISOString(),
      last_active: new Date().toISOString()
    };

    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert(userProfile);

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Try to delete the auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      );
    }

    // Assign role if provided
    if (role) {
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: role,
          is_active: true,
          assigned_at: new Date().toISOString()
        });

      if (roleError) {
        console.error('Role assignment error:', roleError);
        // Continue even if role assignment fails
      }
    }

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: authData.user.id,
        email: email,
        full_name: full_name || '',
        profile_active: true
      }
    });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
