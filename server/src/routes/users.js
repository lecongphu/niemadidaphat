import express from 'express';
import { supabase, supabaseAdmin } from '../config/supabase.js';

const router = express.Router();

// GET /api/users - Lấy danh sách users
router.get('/', async (req, res) => {
  try {
    const { 
      page = '1', 
      limit = '10', 
      search = '', 
      role = 'all', 
      status = 'all',
      includeStats = 'false'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Get all users with roles
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

    const { data: allUsers, error: usersError } = await query;

    if (usersError) {
      console.error('Users query error:', usersError);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }

    // Format users with proper role handling
    let usersWithRoles = (allUsers || []).map(user => {
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
        roles: userRoles.map((userRole) => {
          const roleData = userRole.role;
          const rolesData = userRole.roles;
          return {
            id: userRole.id,
            name: rolesData?.name || roleData,
            display_name: rolesData?.display_name || (roleData ? roleData.charAt(0).toUpperCase() + roleData.slice(1) : 'Unknown'),
            permissions: userRole.permissions || [],
            assigned_at: userRole.assigned_at,
            expires_at: userRole.expires_at,
            is_active: userRole.is_active
          };
        })
      };
    });

    // Apply role filter
    if (role !== 'all') {
      usersWithRoles = usersWithRoles.filter(user => 
        user.roles.some(r => r.name === role && r.is_active)
      );
    }

    // Calculate stats if requested
    let stats = null;
    if (includeStats === 'true') {
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

    // Apply pagination
    const totalCount = usersWithRoles.length;
    const paginatedUsers = usersWithRoles.slice(offset, offset + limitNum);

    const response = {
      users: paginatedUsers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    };

    if (stats) {
      response.stats = stats;
    }

    return res.json(response);

  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST /api/users - Tạo user mới
router.post('/', async (req, res) => {
  try {
    const { email, password, full_name, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Supabase Admin không được cấu hình' });
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
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
      return res.status(500).json({ error: 'Failed to create user account' });
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
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return res.status(500).json({ error: 'Failed to create user profile' });
    }

    // Assign role if provided
    if (role) {
      await supabase
        .from('user_roles')
        .insert({
          id: authData.user.id,
          role: role,
          is_active: true,
          assigned_at: new Date().toISOString()
        });
    }

    return res.json({
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
    return res.status(500).json({ error: 'Failed to create user' });
  }
});

export default router;
