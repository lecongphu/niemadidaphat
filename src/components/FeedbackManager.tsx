'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface Feedback {
  id: string;
  message: string;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  status: 'pending' | 'read' | 'replied' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  user_display?: string;
  user_type?: 'registered' | 'anonymous';
}

interface FeedbackStats {
  total_feedback: number;
  pending_count: number;
  read_count: number;
  replied_count: number;
  resolved_count: number;
  urgent_count: number;
  high_count: number;
  recent_feedback: number;
  registered_user_feedback: number;
  anonymous_feedback: number;
}

export default function FeedbackManager() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Load feedback data
  const loadFeedbacks = useCallback(async () => {
    try {
      setLoading(true);
      
      // Build Supabase query
      let query = supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Apply filters
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters.priority !== 'all') {
        query = query.eq('priority', filters.priority);
      }
      
      // Apply pagination
      const offset = (pagination.page - 1) * pagination.limit;
      query = query.range(offset, offset + pagination.limit - 1);
      
      const { data: feedbacksData, error } = await query;
      
      if (error) throw error;
      
      setFeedbacks(feedbacksData || []);
      
      // Get total count for pagination
      let countQuery = supabase
        .from('feedback')
        .select('*', { count: 'exact', head: true });
      
      // Apply same filters to count query
      if (filters.status !== 'all') {
        countQuery = countQuery.eq('status', filters.status);
      }
      if (filters.priority !== 'all') {
        countQuery = countQuery.eq('priority', filters.priority);
      }
      
      const { count, error: countError } = await countQuery;
      
      if (countError) throw countError;
      
      const total = count || 0;
      const totalPages = Math.ceil(total / pagination.limit);
      
      setPagination(prev => ({
        ...prev,
        total,
        totalPages
      }));
      
    } catch (error) {
      console.error('Error loading feedbacks:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      // Get all feedbacks for stats
      const { data: allFeedbacks, error } = await supabase
        .from('feedback')
        .select('*');
      
      if (error) throw error;
      
      // Calculate stats
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const feedbacks = allFeedbacks || [];
      
      const stats: FeedbackStats = {
        total_feedback: feedbacks.length,
        pending_count: feedbacks.filter(f => f.status === 'pending').length,
        read_count: feedbacks.filter(f => f.status === 'read').length,
        replied_count: feedbacks.filter(f => f.status === 'replied').length,
        resolved_count: feedbacks.filter(f => f.status === 'resolved').length,
        urgent_count: feedbacks.filter(f => f.priority === 'urgent').length,
        high_count: feedbacks.filter(f => f.priority === 'high').length,
        recent_feedback: feedbacks.filter(f => new Date(f.created_at) >= sevenDaysAgo).length,
        registered_user_feedback: feedbacks.filter(f => f.user_type === 'registered').length,
        anonymous_feedback: feedbacks.filter(f => f.user_type === 'anonymous').length
      };
      
      setStats(stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, []);

  useEffect(() => {
    loadFeedbacks();
  }, [loadFeedbacks]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Realtime listener for feedback updates
  useEffect(() => {
    const channel = supabase
      .channel('feedback_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'feedback' },
        () => {
          // Only reload if we're not currently loading to avoid conflicts
          if (!loading) {
            loadFeedbacks();
            loadStats();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loading, loadFeedbacks, loadStats]);

  // Update feedback status
  const updateFeedback = async (id: string, updates: Partial<Feedback>) => {
    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('feedback')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      loadFeedbacks();
      loadStats();
      if (selectedFeedback?.id === id) {
        setSelectedFeedback({ ...selectedFeedback, ...updates });
      }
      
      // Show success message for admin_notes
      if (updates.admin_notes !== undefined) {
        alert('Phản hồi đã được lưu thành công!');
      }
    } catch (error) {
      console.error('Error updating feedback:', error);
      alert('Không thể lưu phản hồi. Vui lòng thử lại.');
    }
  };

  // Delete feedback
  const deleteFeedback = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa góp ý này?')) return;

    try {
      const { error } = await supabase
        .from('feedback')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      loadFeedbacks();
      loadStats();
      if (selectedFeedback?.id === id) {
        setSelectedFeedback(null);
      }
    } catch (error) {
      console.error('Error deleting feedback:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'read': return 'bg-blue-100 text-blue-800';
      case 'replied': return 'bg-green-100 text-green-800';
      case 'resolved': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="serene-card p-4 text-center">
            <div className="text-2xl font-bold wisdom-text">{stats.total_feedback}</div>
            <div className="text-sm text-amber-600/70">Tổng góp ý</div>
          </div>
          <div className="serene-card p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending_count}</div>
            <div className="text-sm text-amber-600/70">Chưa xem</div>
          </div>
          <div className="serene-card p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.urgent_count}</div>
            <div className="text-sm text-amber-600/70">Khẩn cấp</div>
          </div>
          <div className="serene-card p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.recent_feedback}</div>
            <div className="text-sm text-amber-600/70">7 ngày qua</div>
          </div>
          <div className="serene-card p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.registered_user_feedback}</div>
            <div className="text-sm text-amber-600/70">Đã đăng nhập</div>
          </div>
          <div className="serene-card p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{stats.anonymous_feedback}</div>
            <div className="text-sm text-amber-600/70">Ẩn danh</div>
          </div>
        </div>
      )}

        {/* Filters */}
        <div className="serene-card p-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4">
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">Chưa xem</option>
                <option value="read">Đã xem</option>
                <option value="replied">Đã phản hồi</option>
                <option value="resolved">Đã giải quyết</option>
              </select>
              
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">Tất cả độ ưu tiên</option>
                <option value="urgent">Khẩn cấp</option>
                <option value="high">Cao</option>
                <option value="medium">Trung bình</option>
                <option value="low">Thấp</option>
              </select>
            </div>
            
            <button
              onClick={() => {
                loadFeedbacks();
                loadStats();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg transition-colors"
              title="Làm mới dữ liệu"
            >
              <span className={`text-sm ${loading ? 'animate-spin' : ''}`}>
                🔄
              </span>
              <span className="text-sm font-medium">Làm mới</span>
            </button>
          </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Feedback List */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : feedbacks.length === 0 ? (
            <div className="text-center py-8 text-amber-600/70">Không có góp ý nào</div>
          ) : (
            feedbacks.map((feedback) => (
              <div
                key={feedback.id}
                className={`serene-card p-4 cursor-pointer transition-all ${
                  selectedFeedback?.id === feedback.id ? 'ring-2 ring-amber-500' : ''
                }`}
                onClick={() => setSelectedFeedback(feedback)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex gap-2 flex-wrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(feedback.status)}`}>
                      {feedback.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(feedback.priority)}`}>
                      {feedback.priority}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      feedback.user_type === 'registered' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {feedback.user_type === 'registered' ? 'Đã đăng nhập' : 'Ẩn danh'}
                    </span>
                    {feedback.admin_notes && (
                      <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        💬 Đã phản hồi
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-amber-700/80 text-sm mb-2 line-clamp-3">
                  {feedback.message}
                </p>
                <div className="flex justify-between items-center text-xs text-amber-600/70">
                  <span>{formatDate(feedback.created_at)}</span>
                  <div className="text-right">
                    {feedback.user_display && (
                      <div className="font-medium">{feedback.user_display}</div>
                    )}
                    {feedback.ip_address && (
                      <div>IP: {feedback.ip_address}</div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
                className="px-3 py-2 border border-amber-300 rounded-lg disabled:opacity-50"
              >
                Trước
              </button>
              <span className="px-3 py-2">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-2 border border-amber-300 rounded-lg disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          )}
        </div>

        {/* Feedback Detail */}
        <div className="lg:col-span-1">
          {selectedFeedback ? (
            <div className="serene-card p-6 space-y-4 sticky top-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold wisdom-text">Chi tiết góp ý</h3>
                <button
                  onClick={() => deleteFeedback(selectedFeedback.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  🗑️ Xóa
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium wisdom-text mb-1">Trạng thái</label>
                <select
                  value={selectedFeedback.status}
                  onChange={(e) => updateFeedback(selectedFeedback.id, { status: e.target.value as 'pending' | 'read' | 'replied' | 'resolved' })}
                  className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="pending">Chưa xem</option>
                  <option value="read">Đã xem</option>
                  <option value="replied">Đã phản hồi</option>
                  <option value="resolved">Đã giải quyết</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium wisdom-text mb-1">Độ ưu tiên</label>
                <select
                  value={selectedFeedback.priority}
                  onChange={(e) => updateFeedback(selectedFeedback.id, { priority: e.target.value as 'low' | 'medium' | 'high' | 'urgent' })}
                  className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="low">Thấp</option>
                  <option value="medium">Trung bình</option>
                  <option value="high">Cao</option>
                  <option value="urgent">Khẩn cấp</option>
                </select>
              </div>


              <div>
                <label className="block text-sm font-medium wisdom-text mb-1">Người gửi</label>
                <div className="p-2 bg-amber-50 rounded-lg text-sm text-amber-700/80">
                  {selectedFeedback.user_display || 'Anonymous'}
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    selectedFeedback.user_type === 'registered' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedFeedback.user_type === 'registered' ? 'Đã đăng nhập' : 'Ẩn danh'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium wisdom-text mb-1">Nội dung</label>
                <div className="p-3 bg-amber-50 rounded-lg text-sm text-amber-700/80 max-h-40 overflow-y-auto">
                  {selectedFeedback.message}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium wisdom-text mb-1">Phản hồi từ Admin</label>
                <textarea
                  value={selectedFeedback.admin_notes || ''}
                  onChange={(e) => {
                    setSelectedFeedback({
                      ...selectedFeedback,
                      admin_notes: e.target.value
                    });
                  }}
                  rows={4}
                  className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  placeholder="Viết phản hồi cho người dùng..."
                />
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => {
                      if (!selectedFeedback.admin_notes?.trim()) {
                        alert('Vui lòng nhập nội dung phản hồi trước khi lưu!');
                        return;
                      }
                      updateFeedback(selectedFeedback.id, { admin_notes: selectedFeedback.admin_notes });
                    }}
                    disabled={!selectedFeedback.admin_notes?.trim()}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    💾 Lưu phản hồi
                  </button>
                  <button
                    onClick={() => {
                      if (selectedFeedback.admin_notes?.trim() && !confirm('Bạn có chắc muốn xóa nội dung phản hồi này?')) {
                        return;
                      }
                      setSelectedFeedback({
                        ...selectedFeedback,
                        admin_notes: ''
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                  >
                    🗑️ Xóa
                  </button>
                </div>
                <div className="text-xs text-amber-600/70 mt-1">
                  💡 Phản hồi này sẽ hiển thị cho người dùng trong trang &ldquo;Góp ý của tôi&rdquo;
                </div>
              </div>

              <div className="text-xs text-amber-600/70 space-y-1">
                <p><strong>Tạo:</strong> {formatDate(selectedFeedback.created_at)}</p>
                <p><strong>Cập nhật:</strong> {formatDate(selectedFeedback.updated_at)}</p>
                {selectedFeedback.ip_address && (
                  <p><strong>IP:</strong> {selectedFeedback.ip_address}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="serene-card p-6 text-center text-amber-600/70">
              Chọn một góp ý để xem chi tiết
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
