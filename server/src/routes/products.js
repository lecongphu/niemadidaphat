import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// GET /api/products - Lấy danh sách products
router.get('/', async (req, res) => {
  try {
    const { category, search, limit = '20', offset = '0', includeChapters = 'false' } = req.query;
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);

    // Build SQL query
    let sqlQuery = 'SELECT * FROM products WHERE 1=1';
    const params = [];
    let paramCount = 1;

    // Apply category filter
    if (category) {
      params.push(category);
      sqlQuery += ` AND category = $${paramCount}`;
      paramCount++;
    }

    // Apply search filter
    if (search) {
      params.push(`%${search}%`);
      sqlQuery += ` AND (title ILIKE $${paramCount} OR description ILIKE $${paramCount} OR author ILIKE $${paramCount})`;
      paramCount++;
    }

    // Order by
    sqlQuery += ' ORDER BY created_at DESC';

    // Get all products for count
    const allProductsResult = await query(sqlQuery, params);
    const allProducts = allProductsResult.rows;

    // Apply pagination
    const paginatedProducts = allProducts.slice(offsetNum, offsetNum + limitNum);

    // Nếu cần include chapters
    if (includeChapters === 'true' && paginatedProducts.length > 0) {
      const productsWithChapters = await Promise.all(
        paginatedProducts.map(async (product) => {
          const chaptersResult = await query(
            'SELECT * FROM chapters WHERE product_id = $1 ORDER BY sort_order ASC',
            [product.id]
          );

          return {
            ...product,
            chapters: chaptersResult.rows || []
          };
        })
      );

      return res.json({
        success: true,
        data: productsWithChapters,
        count: allProducts.length
      });
    }

    return res.json({
      success: true,
      data: paginatedProducts,
      count: allProducts.length
    });

  } catch (error) {
    console.error('Get products error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Lỗi lấy danh sách products', 
      details: error.message 
    });
  }
});

// POST /api/products - Tạo product mới
router.post('/', async (req, res) => {
  try {
    const productData = req.body;

    // Validate required fields
    if (!productData.title || !productData.author || !productData.description) {
      return res.status(400).json({ 
        success: false,
        error: 'Title, author và description là bắt buộc' 
      });
    }

    // Tạo slug nếu chưa có
    if (!productData.slug) {
      productData.slug = productData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();
    }

    // Kiểm tra slug unique
    const existingResult = await query(
      'SELECT id FROM products WHERE slug = $1',
      [productData.slug]
    );

    if (existingResult.rows.length > 0) {
      productData.slug = `${productData.slug}-${Date.now()}`;
    }

    // Tạo product
    const result = await query(
      `INSERT INTO products (
        slug, title, author, translator, interpreter, speaker, narrator,
        lecture_date, duration, duration_seconds, description, cover_url,
        pdf_url, category, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        productData.slug,
        productData.title,
        productData.author,
        productData.translator || null,
        productData.interpreter || null,
        productData.speaker || null,
        productData.narrator || null,
        productData.lecture_date || null,
        productData.duration || null,
        productData.duration_seconds || null,
        productData.description,
        productData.cover_url || null,
        productData.pdf_url || null,
        productData.category || null,
        productData.created_by || null
      ]
    );

    return res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Tạo product thành công'
    });

  } catch (error) {
    console.error('Create product error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Lỗi tạo product', 
      details: error.message 
    });
  }
});

// GET /api/products/:slug - Lấy product theo slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const result = await query(
      'SELECT * FROM products WHERE slug = $1',
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Không tìm thấy product' 
      });
    }

    return res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Get product by slug error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Lỗi lấy product', 
      details: error.message 
    });
  }
});

// PUT /api/products/:id - Cập nhật product
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Build update query dynamically
    const fields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = [
      'slug', 'title', 'author', 'translator', 'interpreter', 'speaker', 
      'narrator', 'lecture_date', 'duration', 'duration_seconds', 'description', 
      'cover_url', 'pdf_url', 'category'
    ];

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

    const sqlQuery = `UPDATE products SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await query(sqlQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Không tìm thấy product' 
      });
    }

    return res.json({
      success: true,
      data: result.rows[0],
      message: 'Cập nhật product thành công'
    });

  } catch (error) {
    console.error('Update product error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Lỗi cập nhật product', 
      details: error.message 
    });
  }
});

// DELETE /api/products/:id - Xóa product
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Delete product (chapters will be cascade deleted if foreign key is set up properly)
    const result = await query(
      'DELETE FROM products WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Không tìm thấy product' 
      });
    }

    return res.json({
      success: true,
      message: 'Xóa product thành công'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Lỗi xóa product', 
      details: error.message 
    });
  }
});

export default router;
