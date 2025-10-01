import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// GET /api/chapters - Lấy danh sách chapters
router.get('/', async (req, res) => {
  try {
    const { productId, limit = '50', offset = '0' } = req.query;
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);

    let sqlQuery = 'SELECT * FROM chapters WHERE 1=1';
    const params = [];

    // Apply product filter if provided
    if (productId) {
      params.push(productId);
      sqlQuery += ' AND product_id = $1';
    }

    sqlQuery += ' ORDER BY sort_order ASC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limitNum, offsetNum);

    const result = await query(sqlQuery, params);

    return res.json({
      success: true,
      data: result.rows || [],
      count: result.rows.length
    });

  } catch (error) {
    console.error('Get chapters error:', error);
    return res.status(500).json({ 
      success: false,
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
      return res.status(400).json({ 
        success: false,
        error: 'Product ID và title là bắt buộc' 
      });
    }

    // Kiểm tra product tồn tại
    const productResult = await query(
      'SELECT id FROM products WHERE id = $1',
      [chapterData.product_id]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Không tìm thấy product' 
      });
    }

    // Lấy sort_order tiếp theo
    const lastChapterResult = await query(
      'SELECT sort_order FROM chapters WHERE product_id = $1 ORDER BY sort_order DESC LIMIT 1',
      [chapterData.product_id]
    );

    const nextSortOrder = (lastChapterResult.rows[0]?.sort_order || 0) + 1;

    // Tạo chapter
    const result = await query(
      `INSERT INTO chapters (product_id, title, audio_url, duration_seconds, sort_order)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        chapterData.product_id,
        chapterData.title,
        chapterData.audio_url || null,
        chapterData.duration_seconds || null,
        chapterData.sort_order || nextSortOrder
      ]
    );

    return res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Tạo chapter thành công'
    });

  } catch (error) {
    console.error('Create chapter error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Lỗi tạo chapter', 
      details: error.message 
    });
  }
});

// GET /api/chapters/product/:productId - Lấy chapters theo product ID
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    const result = await query(
      'SELECT * FROM chapters WHERE product_id = $1 ORDER BY sort_order ASC',
      [productId]
    );

    return res.json({
      success: true,
      data: result.rows || [],
      count: result.rows.length
    });

  } catch (error) {
    console.error('Get chapters error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Lỗi lấy chapters', 
      details: error.message 
    });
  }
});

// PUT /api/chapters/:id - Cập nhật chapter
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Build update query dynamically
    const fields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = ['title', 'audio_url', 'duration_seconds', 'sort_order'];

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        fields.push(`${field} = $${paramCount}`);
        values.push(updateData[field]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Không có trường nào để cập nhật' 
      });
    }

    // Add updated_at
    fields.push(`updated_at = NOW()`);
    
    // Add id for WHERE clause
    values.push(id);

    const sqlQuery = `UPDATE chapters SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await query(sqlQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Không tìm thấy chapter' 
      });
    }

    return res.json({
      success: true,
      data: result.rows[0],
      message: 'Cập nhật chapter thành công'
    });

  } catch (error) {
    console.error('Update chapter error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Lỗi cập nhật chapter', 
      details: error.message 
    });
  }
});

// DELETE /api/chapters/:id - Xóa chapter
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM chapters WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Không tìm thấy chapter' 
      });
    }

    return res.json({
      success: true,
      message: 'Xóa chapter thành công'
    });

  } catch (error) {
    console.error('Delete chapter error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Lỗi xóa chapter', 
      details: error.message 
    });
  }
});

export default router;

