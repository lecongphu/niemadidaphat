import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Helper function to get current user
const getCurrentUser = async (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  try {
    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    return user;
  } catch {
    return null;
  }
};

// POST /api/follow - Follow a product
router.post('/', async (req, res) => {
  try {
    const { productId, userId } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID là bắt buộc' });
    }

    // Nếu không có userId, lấy từ auth hiện tại
    let currentUserId = userId;
    if (!currentUserId) {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ error: 'Cần đăng nhập để follow sản phẩm' });
      }
      currentUserId = user.id;
    }

    // Follow sản phẩm
    const { error } = await supabase
      .from('followers')
      .insert({
        product_id: productId,
        user_id: currentUserId,
        created_at: new Date().toISOString()
      });

    if (error) {
      // Nếu đã follow rồi thì bỏ qua
      if (error.code === '23505') { // Duplicate key
        return res.json({
          success: true,
          message: 'Đã follow sản phẩm rồi'
        });
      }
      throw error;
    }

    return res.json({
      success: true,
      message: 'Đã follow sản phẩm thành công'
    });

  } catch (error) {
    console.error('Follow product error:', error);
    return res.status(500).json({ error: 'Có lỗi xảy ra khi follow sản phẩm' });
  }
});

// DELETE /api/follow - Unfollow a product
router.delete('/', async (req, res) => {
  try {
    const { productId, userId } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID là bắt buộc' });
    }

    // Nếu không có userId, lấy từ auth hiện tại
    let currentUserId = userId;
    if (!currentUserId) {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ error: 'Cần đăng nhập để unfollow sản phẩm' });
      }
      currentUserId = user.id;
    }

    // Unfollow sản phẩm
    const { error } = await supabase
      .from('followers')
      .delete()
      .eq('product_id', productId)
      .eq('user_id', currentUserId);

    if (error) throw error;

    return res.json({
      success: true,
      message: 'Đã unfollow sản phẩm thành công'
    });

  } catch (error) {
    console.error('Unfollow product error:', error);
    return res.status(500).json({ error: 'Có lỗi xảy ra khi unfollow sản phẩm' });
  }
});

// GET /api/follow - Check if user is following a product
router.get('/', async (req, res) => {
  try {
    const { productId, userId } = req.query;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID là bắt buộc' });
    }

    // Nếu không có userId, lấy từ auth hiện tại
    let currentUserId = userId;
    if (!currentUserId) {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.json({ isFollowing: false });
      }
      currentUserId = user.id;
    }

    // Kiểm tra follow status
    const { data, error } = await supabase
      .from('followers')
      .select('id')
      .eq('product_id', productId)
      .eq('user_id', currentUserId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      throw error;
    }

    return res.json({
      isFollowing: !!data,
      productId,
      userId: currentUserId
    });

  } catch (error) {
    console.error('Check follow status error:', error);
    return res.status(500).json({ error: 'Có lỗi xảy ra khi kiểm tra follow status' });
  }
});

export default router;
