import { supabase } from './supabase';
import SupabaseAuth from './supabaseAuth';

export interface UserRole {
  id: string;
  name: string;
  display_name: string;
  permissions: string[];
  assigned_at: string;
  expires_at: string | null;
  is_active: boolean;
}

export interface UserWithRoles {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  roles: UserRole[];
  permissions: string[];
}

// Lấy thông tin user hiện tại với roles
export async function getCurrentUserWithRoles(): Promise<UserWithRoles | null> {
  try {
    const { user } = await SupabaseAuth.getCurrentUser();
    
    if (!user) {
      return null;
    }

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching user profile:', profileError);
      return null;
    }

    // Get user roles with role details
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select(`
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
      `)
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (rolesError) {
      console.error('Error fetching user roles:', rolesError);
      return null;
    }

    const roles: UserRole[] = (userRoles || []).map((userRole: {
      id: string;
      role: string;
      permissions: string[];
      assigned_at: string;
      expires_at: string | null;
      is_active: boolean;
      roles: {
        name: string;
        display_name: string;
        description: string;
      }[] | null;
    }) => ({
      id: userRole.id,
      name: userRole.roles?.[0]?.name || userRole.role,
      display_name: userRole.roles?.[0]?.display_name || userRole.role,
      permissions: userRole.permissions || [],
      assigned_at: userRole.assigned_at || new Date().toISOString(),
      expires_at: userRole.expires_at || null,
      is_active: userRole.is_active || false
    }));

    // Flatten permissions from all roles
    const permissions = roles.reduce((acc: string[], role: UserRole) => {
      return [...acc, ...role.permissions];
    }, []);

    return {
      id: user.id,
      email: user.email || '',
      full_name: userProfile?.full_name || user.user_metadata?.full_name || null,
      avatar_url: userProfile?.avatar_url || user.user_metadata?.avatar_url || null,
      roles,
      permissions: [...new Set(permissions)] // Remove duplicates
    };

  } catch (error) {
    console.error('Error getting current user with roles:', error);
    return null;
  }
}

// Kiểm tra xem user có quyền cụ thể không
export async function hasPermission(permission: string): Promise<boolean> {
  try {
    const userWithRoles = await getCurrentUserWithRoles();
    
    if (!userWithRoles) {
      return false;
    }

    // Super admin có tất cả quyền
    if (userWithRoles.permissions.includes('*')) {
      return true;
    }

    // Kiểm tra quyền cụ thể
    return userWithRoles.permissions.includes(permission);

  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

// Kiểm tra xem user có role cụ thể không
export async function hasRole(roleName: string): Promise<boolean> {
  try {
    const userWithRoles = await getCurrentUserWithRoles();
    
    if (!userWithRoles) {
      return false;
    }

    return userWithRoles.roles.some(role => role.name === roleName);

  } catch (error) {
    console.error('Error checking role:', error);
    return false;
  }
}

// Kiểm tra xem user có phải admin không
export async function isAdmin(): Promise<boolean> {
  return await hasRole('admin') || await hasRole('super_admin');
}

// Kiểm tra xem user có phải super admin không
export async function isSuperAdmin(): Promise<boolean> {
  return await hasRole('super_admin');
}

// Middleware để bảo vệ route
export function requirePermission(permission: string) {
  return async function middleware() {
    const hasAccess = await hasPermission(permission);
    
    if (!hasAccess) {
      throw new Error('Access denied: Insufficient permissions');
    }
  };
}

// Middleware để bảo vệ route cho admin
export function requireAdmin() {
  return async function middleware() {
    const isAdminUser = await isAdmin();
    
    if (!isAdminUser) {
      throw new Error('Access denied: Admin access required');
    }
  };
}

// Middleware để bảo vệ route cho super admin
export function requireSuperAdmin() {
  return async function middleware() {
    const isSuperAdminUser = await isSuperAdmin();
    
    if (!isSuperAdminUser) {
      throw new Error('Access denied: Super admin access required');
    }
  };
}

// Lấy danh sách tất cả permissions có sẵn
export const AVAILABLE_PERMISSIONS = {
  // User management
  'users.read': 'Xem danh sách người dùng',
  'users.create': 'Tạo người dùng mới',
  'users.update': 'Cập nhật thông tin người dùng',
  'users.delete': 'Xóa người dùng',
  'users.manage_roles': 'Quản lý vai trò người dùng',
  
  // Product management
  'products.read': 'Xem sản phẩm',
  'products.create': 'Tạo sản phẩm mới',
  'products.update': 'Cập nhật sản phẩm',
  'products.delete': 'Xóa sản phẩm',
  'products.manage_chapters': 'Quản lý chương sản phẩm',
  
  // Analytics
  'analytics.read': 'Xem thống kê',
  'analytics.export': 'Xuất báo cáo',
  
  // Feedback
  'feedback.read': 'Xem góp ý',
  'feedback.update': 'Cập nhật trạng thái góp ý',
  'feedback.delete': 'Xóa góp ý',
  
  // System
  'system.settings': 'Cài đặt hệ thống',
  'system.logs': 'Xem logs hệ thống',
  
  // Super admin
  '*': 'Toàn quyền hệ thống'
} as const;

export type Permission = keyof typeof AVAILABLE_PERMISSIONS;
