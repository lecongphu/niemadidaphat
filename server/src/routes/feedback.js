import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// POST /api/feedback - Gửi góp ý
router.post('/', async (req, res) => {
  try {
    const { message } = req.body;

    if (!supabase) {
      return res.status(500).json({ error: 'Supabase Admin không được cấu hình' });
    }

    // Get user info from Authorization header if available
    const authHeader = req.headers.authorization;
    let userId = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (!error && user) {
          userId = user.id;
        }
      } catch (error) {
        console.warn('Error verifying Supabase token:', error);
      }
    }

    // Validation
    if (!message) {
      return res.status(400).json({ error: 'Nội dung góp ý là bắt buộc' });
    }

    if (message.length < 10 || message.length > 5000) {
      return res.status(400).json({ error: 'Nội dung góp ý phải từ 10-5000 ký tự' });
    }

    // Get client info
    const ipAddress = req.headers['x-forwarded-for'] || 
                     req.headers['x-real-ip'] || 
                     req.ip || 
                     'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Insert feedback to Supabase
    const feedbackData = {
      message: message.trim(),
      user_id: userId,
      ip_address: ipAddress,
      user_agent: userAgent,
      status: 'pending',
      priority: 'medium',
      user_type: userId ? 'registered' : 'anonymous',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('feedback')
      .insert(feedbackData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to insert feedback: ${error.message}`);
    }

    return res.json({
      success: true,
      message: 'Góp ý của bạn đã được gửi thành công. Cảm ơn bạn!',
      id: data.id
    });

  } catch (error) {
    console.error('Feedback API error:', error);
    return res.status(500).json({ error: 'Lỗi server. Vui lòng thử lại sau.' });
  }
});

// GET /api/feedback - Lấy danh sách feedback
router.get('/', async (req, res) => {
  try {
    const { status = 'all', priority = 'all', page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (!supabase) {
      return res.status(500).json({ error: 'Supabase Admin không được cấu hình' });
    }

    // Build Supabase query
    let query = supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });

    // Filter by status
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    // Filter by priority
    if (priority !== 'all') {
      query = query.eq('priority', priority);
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('feedback')
      .select('*', { count: 'exact', head: true });

    if (status !== 'all') {
      countQuery = countQuery.eq('status', status);
    }
    if (priority !== 'all') {
      countQuery = countQuery.eq('priority', priority);
    }

    const { count, error: countError } = await countQuery;
    if (countError) throw countError;

    // Apply pagination
    const offset = (pageNum - 1) * limitNum;
    query = query.range(offset, offset + limitNum - 1);

    const { data, error } = await query;
    if (error) throw error;

    return res.json({
      success: true,
      data: data || [],
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limitNum)
      }
    });

  } catch (error) {
    console.error('Feedback GET API error:', error);
    return res.status(500).json({ error: 'Lỗi server' });
  }
});

// PUT /api/feedback - Cập nhật feedback
router.put('/', async (req, res) => {
  try {
    const { id, status, priority, admin_notes } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'ID góp ý là bắt buộc' });
    }

    if (!supabase) {
      return res.status(500).json({ error: 'Supabase Admin không được cấu hình' });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (admin_notes !== undefined) updateData.admin_notes = admin_notes;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('feedback')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update feedback: ${error.message}`);
    }

    return res.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Feedback PUT API error:', error);
    return res.status(500).json({ error: 'Lỗi server' });
  }
});

// DELETE /api/feedback - Xóa feedback
router.delete('/', async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'ID góp ý là bắt buộc' });
    }

    if (!supabase) {
      return res.status(500).json({ error: 'Supabase Admin không được cấu hình' });
    }

    const { error } = await supabase
      .from('feedback')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete feedback: ${error.message}`);
    }

    return res.json({
      success: true,
      message: 'Góp ý đã được xóa thành công'
    });

  } catch (error) {
    console.error('Feedback DELETE API error:', error);
    return res.status(500).json({ error: 'Lỗi server' });
  }
});

export default router;
