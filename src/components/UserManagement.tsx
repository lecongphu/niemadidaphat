"use client";

import React, { useEffect, useState, useCallback } from "react";
import { supabase } from '@/lib/supabase';

// Types
interface User {
  id: string;
  email: string;
  user_created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  bio: string | null;
  last_login_at: string | null;
  login_count: number;
  profile_active: boolean;
  roles: Array<{
    id: string;
    name: string;
    display_name: string;
    permissions: string[];
    assigned_at: string;
    expires_at: string | null;
    is_active: boolean;
  }>;
}

interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  permissions: string[];
}

interface UserStats {
  total_users: number;
  new_users_7d: number;
  new_users_30d: number;
  active_users: number;
  inactive_users: number;
  users_with_roles: number;
  users_without_roles: number;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUserForRole, setSelectedUserForRole] = useState<User | null>(null);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);

  const pageSize = 10;

  // Load data
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load users from Supabase with their roles
      const { data: usersData, error: usersError } = await supabase
        .from('user_profiles')
        .select(`
          *,
          user_roles!user_roles_user_id_fkey (
            id,
            role,
            permissions,
            assigned_at,
            expires_at,
            is_active,
            roles!user_roles_role_id_fkey (
              name,
              display_name
            )
          )
        `);

      if (usersError) throw usersError;

      // Transform data to match expected format
      const usersWithRoles = (usersData || []).map(user => ({
        ...user,
        user_created_at: user.created_at,
        profile_active: user.is_active !== false,
        roles: (user.user_roles || []).map((userRole: {
          id: string;
          role: string;
          permissions: string[];
          assigned_at: string;
          expires_at: string | null;
          is_active: boolean;
          roles: {
            name: string;
            display_name: string;
          } | null;
        }) => ({
          id: userRole.id,
          name: userRole.roles?.name || userRole.role,
          display_name: userRole.roles?.display_name || userRole.role,
          permissions: userRole.permissions || [],
          assigned_at: userRole.assigned_at,
          expires_at: userRole.expires_at,
          is_active: userRole.is_active !== false
        }))
      })) as User[];
      
      setUsers(usersWithRoles);
      setTotalPages(Math.ceil(usersWithRoles.length / pageSize));

    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  const loadRoles = useCallback(async () => {
    try {
      // Load roles from Supabase
      const { data: rolesData, error } = await supabase
        .from('roles')
        .select('*');

      if (error) throw error;
      
      setRoles(rolesData || []);
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      // Load users from Supabase for stats calculation
      const { data: allUsers, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          user_roles!user_roles_user_id_fkey (id)
        `);

      if (error) throw error;
      
      // Calculate stats
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const usersWithRoles = (allUsers || []).map(user => ({
        ...user,
        user_created_at: user.created_at,
        profile_active: user.is_active !== false,
        roles: user.user_roles || []
      }));
      
      const stats: UserStats = {
        total_users: usersWithRoles.length,
        new_users_7d: usersWithRoles.filter(user => new Date(user.user_created_at) >= sevenDaysAgo).length,
        new_users_30d: usersWithRoles.filter(user => new Date(user.user_created_at) >= thirtyDaysAgo).length,
        active_users: usersWithRoles.filter(user => user.profile_active !== false).length,
        inactive_users: usersWithRoles.filter(user => user.profile_active === false).length,
        users_with_roles: usersWithRoles.filter(user => user.roles && user.roles.length > 0).length,
        users_without_roles: usersWithRoles.filter(user => !user.roles || user.roles.length === 0).length
      };
      
      setStats(stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, []);

  useEffect(() => {
    loadUsers();
    loadRoles();
    loadStats();
  }, [loadUsers, loadRoles, loadStats]);

  // Realtime listener for user updates
  useEffect(() => {
    const channel = supabase
      .channel('user_profiles_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'user_profiles' },
        () => {
          // Only reload if we're not currently loading to avoid conflicts
          if (!loading) {
            loadUsers();
            loadStats();
          }
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'user_roles' },
        () => {
          // Only reload if we're not currently loading to avoid conflicts
          if (!loading) {
            loadUsers();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loading, loadUsers, loadStats]);

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = selectedRole === "all" || 
      user.roles.some(role => role.name === selectedRole);

    return matchesSearch && matchesRole;
  });

  // Handle role assignment
  const handleAssignRole = async (userId: string, roleId: string) => {
    try {
      // Add role to user_roles table
      const roleData = {
        user_id: userId,
        role: roles.find(r => r.id === roleId)?.name || '',
        assigned_at: new Date().toISOString(),
        expires_at: null,
        is_active: true
      };
      
      // Add to Supabase
      const { error } = await supabase
        .from('user_roles')
        .insert(roleData);

      if (error) throw error;

      // Reload users
      await loadUsers();
      setShowRoleModal(false);
      setSelectedUserForRole(null);
    } catch (error) {
      console.error('Error assigning role:', error);
    }
  };

  const handleRemoveRole = async (userId: string, roleId: string) => {
    try {
      // Delete the user role record
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      // Reload users
      await loadUsers();
    } catch (error) {
      console.error('Error removing role:', error);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      // Update user profile in Supabase
      const { error } = await supabase
        .from('user_profiles')
        .update({
          is_active: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      // Reload users
      await loadUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const openRoleModal = (user: User) => {
    setSelectedUserForRole(user);
    // Get roles that user doesn't already have
    const userRoleNames = user.roles.map(r => r.name);
    const available = roles.filter(role => !userRoleNames.includes(role.name));
    setAvailableRoles(available);
    setShowRoleModal(true);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Chưa có';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getRoleBadgeColor = (roleName: string) => {
    const colors: Record<string, string> = {
      'super_admin': 'bg-red-100 text-red-800',
      'admin': 'bg-purple-100 text-purple-800',
      'moderator': 'bg-blue-100 text-blue-800',
      'editor': 'bg-green-100 text-green-800',
      'viewer': 'bg-gray-100 text-gray-800'
    };
    return colors[roleName] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2">Đang tải...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{stats.total_users}</div>
            <div className="text-sm text-gray-600">Tổng người dùng</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">{stats.new_users_7d}</div>
            <div className="text-sm text-gray-600">Mới 7 ngày</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-purple-600">{stats.active_users}</div>
            <div className="text-sm text-gray-600">Đang hoạt động</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-orange-600">{stats.users_with_roles}</div>
            <div className="text-sm text-gray-600">Có phân quyền</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm theo email hoặc tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="sm:w-48">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả vai trò</option>
              {roles.map(role => (
                <option key={role.id} value={role.name}>
                  {role.display_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đăng nhập cuối
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {user.avatar_url ? (
                          <img className="h-10 w-10 rounded-full" src={user.avatar_url} alt="" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.full_name || 'Chưa có tên'}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.length > 0 ? (
                        user.roles.map((role) => (
                          <span
                            key={role.id}
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(role.name)}`}
                          >
                            {role.display_name}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">Chưa có vai trò</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.profile_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.profile_active ? 'Hoạt động' : 'Tạm khóa'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.last_login_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openRoleModal(user)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Phân quyền
                      </button>
                      <button
                        onClick={() => handleToggleUserStatus(user.id, user.profile_active)}
                        className={`${
                          user.profile_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                        }`}
                      >
                        {user.profile_active ? 'Khóa' : 'Mở khóa'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Trước
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Sau
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Trang <span className="font-medium">{page}</span> / <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Trước
                  </button>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Sau
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Role Assignment Modal */}
      {showRoleModal && selectedUserForRole && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Phân quyền cho {selectedUserForRole.full_name || selectedUserForRole.email}
              </h3>
              
              {/* Current Roles */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Vai trò hiện tại:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedUserForRole.roles.map((role) => (
                    <div key={role.id} className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(role.name)}`}>
                        {role.display_name}
                      </span>
                      <button
                        onClick={() => handleRemoveRole(selectedUserForRole.id, role.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Available Roles */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Thêm vai trò:</h4>
                <div className="space-y-2">
                  {availableRoles.map((role) => (
                    <div key={role.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <div className="font-medium">{role.display_name}</div>
                        <div className="text-sm text-gray-500">{role.description}</div>
                      </div>
                      <button
                        onClick={() => handleAssignRole(selectedUserForRole.id, role.id)}
                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                      >
                        Thêm
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
