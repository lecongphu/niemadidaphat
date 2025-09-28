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
    const includeStats = searchParams.get('includeStats') === 'true';

    const offset = (page - 1) * limit;

    // OPTIMIZED: Single query to get all users with roles and role details
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
        user_roles!user_profiles_id_fkey1 (
          id,
          role,
          permissions,
          assigned_at,
          expires_at,
          is_active,
          roles!user_roles_role_id_fkey (
            name,
            display_name,
            description
          )
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

    // OPTIMIZED: Get all users in single query
    const { data: allUsers, error: usersError } = await query;

    if (usersError) {
      console.error('Users query error:', usersError);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    // OPTIMIZED: Format users with proper role handling
    let usersWithRoles = (allUsers || []).map(user => {
      // Handle user_roles which can be array or single object from Supabase join
      const userRoles = Array.isArray(user.user_roles)
        ? user.user_roles
        : (user.user_roles ? [user.user_roles] : []);

      return {
        id: user.id,
        email: user.email,
        user_created_at: user.created_at,
        last_sign_in_at: user.last_login_at,
        email_confirmed_at: user.email ? user.created_at : null,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        phone: user.phone,
        bio: user.bio,
        last_login_at: user.last_login_at,
        login_count: user.login_count || 0,
        profile_active: user.profile_active,
        roles: userRoles.map((userRole: Record<string, unknown>) => {
          const role = userRole.role as string;
          const roles = userRole.roles as Record<string, unknown> | undefined;
          return {
            id: userRole.id,
            name: roles?.name as string || role,
            display_name: roles?.display_name as string || (role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Unknown'),
            permissions: userRole.permissions as string[] || [],
            assigned_at: userRole.assigned_at,
            expires_at: userRole.expires_at,
            is_active: userRole.is_active
          };
        })
      };
    });

    // Apply role filter after formatting
    if (role !== 'all') {
      usersWithRoles = usersWithRoles.filter(user => 
        user.roles.some(r => r.name === role && r.is_active)
      );
    }

    // OPTIMIZED: Calculate stats if requested (avoid separate API call)
    let stats = null;
    if (includeStats) {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      stats = {
        total_users: usersWithRoles.length,
        new_users_7d: usersWithRoles.filter(user => new Date(user.user_created_at) >= sevenDaysAgo).length,
        new_users_30d: usersWithRoles.filter(user => new Date(user.user_created_at) >= thirtyDaysAgo).length,
        active_users: usersWithRoles.filter(user => user.profile_active !== false).length,
        inactive_users: usersWithRoles.filter(user => user.profile_active === false).length,
        users_with_roles: usersWithRoles.filter(user => user.roles && user.roles.length > 0).length,
        users_without_roles: usersWithRoles.filter(user => !user.roles || user.roles.length === 0).length
      };
    }

    // Apply pagination after all filtering
    const totalCount = usersWithRoles.length;
    const paginatedUsers = usersWithRoles.slice(offset, offset + limit);

    const response: Record<string, unknown> = {
      users: paginatedUsers,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    };

    if (stats) {
      response.stats = stats;
    }

    return NextResponse.json(response);

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
          id: authData.user.id,
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
