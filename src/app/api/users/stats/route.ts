import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/users/stats - Lấy thống kê users
export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase không được cấu hình' },
        { status: 500 }
      );
    }

    // Get basic user stats
    const { count: totalUsers } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });

    const { count: activeUsers } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('profile_active', true);

    const inactiveUsers = (totalUsers || 0) - (activeUsers || 0);

    const stats = {
      total_users: totalUsers || 0,
      active_users: activeUsers || 0,
      inactive_users: inactiveUsers
    };

    // Get role stats
    const { data: allUserRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('is_active', true);

    if (rolesError) {
      console.error('Roles query error:', rolesError);
    }

    // Group by role
    interface RoleStat {
      role: string;
      count: number;
    }

    const roleStats: RoleStat[] = (allUserRoles || []).reduce((acc: RoleStat[], userRole) => {
      const existingRole = acc.find(r => r.role === userRole.role);
      if (existingRole) {
        existingRole.count += 1;
      } else {
        acc.push({
          role: userRole.role,
          count: 1
        });
      }
      return acc;
    }, []);

    // Get recent activity (users with last_login_at)
    const { data: recentUsers, error: recentUsersError } = await supabase
      .from('user_profiles')
      .select('id, email, full_name, last_login_at, avatar_url')
      .not('last_login_at', 'is', null)
      .order('last_login_at', { ascending: false })
      .limit(10);

    if (recentUsersError) {
      console.error('Recent users query error:', recentUsersError);
    }

    return NextResponse.json({
      success: true,
      data: {
        stats,
        roleStats,
        recentUsers: recentUsers || []
      }
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    );
  }
}
