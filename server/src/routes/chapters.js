import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// GET /api/chapters - Lấy danh sách chapters
router.get('/', async (req, res) => {
  try {
    const { productId, limit = '50', offset = '0' } = req.query;
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);

    if (!supabase) {
      return res.status(500).json({ error: 'Supabase không được cấu hình' });
    }

    // Build query
    let query = supabase
      .from('chapters')
      .select('*')
      .order('sort_order', { ascending: true })
      .range(offsetNum, offsetNum + limitNum - 1);

    // Apply product filter if provided
    if (productId) {
      query = query.eq('product_id', productId);
    }

    const { data: chapters, error: chaptersError, count } = await query;

    if (chaptersError) {
      console.error('Chapters query error:', chaptersError);
      return res.status(500).json({ error: 'Lỗi lấy danh sách chapters' });
    }

    return res.json({
      success: true,
      data: chapters || [],
      count: chapters?.length || 0,
      total: count || 0
    });

  } catch (error) {
    console.error('Get chapters error:', error);
    return res.status(500).json({ 
      error: 'Lỗi lấy danh sách chapters', 
      details: error.message 
    });
  }
});

// POST /api/chapters - Tạo chapter mới
router.post('/', async (req, res) => {
  try {
    const chapterData = req.body;

    // Validate required fields
    if (!chapterData.product_id || !chapterData.title) {
      return res.status(400).json({ error: 'Product ID và title là bắt buộc' });
    }

    if (!supabase) {
      return res.status(500).json({ error: 'Supabase không được cấu hình' });
    }

    // Kiểm tra product tồn tại
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id')
      .eq('id', chapterData.product_id)
      .single();

    if (productError || !product) {
      return res.status(404).json({ error: 'Không tìm thấy product' });
    }

    // Lấy sort_order tiếp theo
    const { data: lastChapter, error: lastChapterError } = await supabase
      .from('chapters')
      .select('sort_order')
      .eq('product_id', chapterData.product_id)
      .order('sort_order', { ascending: false })
      .limit(1)
      .single();

    if (lastChapterError && lastChapterError.code !== 'PGRST116') {
      console.error('Last chapter query error:', lastChapterError);
    }

    const nextSortOrder = (lastChapter?.sort_order || 0) + 1;

    // Tạo chapter
    const { data: newChapter, error: createError } = await supabase
      .from('chapters')
      .insert({
        product_id: chapterData.product_id,
        title: chapterData.title,
        audio_url: chapterData.audio_url || null,
        duration_seconds: chapterData.duration_seconds || null,
        sort_order: nextSortOrder,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (createError || !newChapter) {
      console.error('Create chapter error:', createError);
      return res.status(500).json({ error: 'Lỗi tạo chapter' });
    }

    return res.status(201).json({
      success: true,
      data: newChapter,
      message: 'Tạo chapter thành công'
    });

  } catch (error) {
    console.error('Create chapter error:', error);
    return res.status(500).json({ 
      error: 'Lỗi tạo chapter', 
      details: error.message 
    });
  }
});

export default router;
