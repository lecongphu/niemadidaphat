import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// GET /api/products - Lấy danh sách products
router.get('/', async (req, res) => {
  try {
    const { category, search, limit = '20', offset = '0', includeChapters = 'false' } = req.query;
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);

    // Build query
    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply search filter
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,author.ilike.%${search}%`);
    }

    // Apply category filter
    if (category) {
      query = query.eq('category', category);
    }

    const { data: allProducts, error: productsError } = await query;

    if (productsError) {
      console.error('Products query error:', productsError);
      return res.status(500).json({ error: 'Lỗi lấy danh sách products' });
    }

    // Apply pagination
    const paginatedProducts = (allProducts || []).slice(offsetNum, offsetNum + limitNum);

    // Nếu cần include chapters
    if (includeChapters === 'true' && paginatedProducts.length > 0) {
      const productsWithChapters = await Promise.all(
        paginatedProducts.map(async (product) => {
          const { data: chapters } = await supabase
            .from('chapters')
            .select('*')
            .eq('product_id', product.id)
            .order('sort_order', { ascending: true });

          return {
            ...product,
            chapters: chapters || []
          };
        })
      );

      return res.json({
        success: true,
        data: productsWithChapters,
        count: allProducts?.length || 0
      });
    }

    return res.json({
      success: true,
      data: paginatedProducts,
      count: allProducts?.length || 0
    });

  } catch (error) {
    console.error('Get products error:', error);
    return res.status(500).json({ 
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
      return res.status(400).json({ error: 'Title, author và description là bắt buộc' });
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
    const { data: existingProduct } = await supabase
      .from('products')
      .select('id')
      .eq('slug', productData.slug)
      .single();

    if (existingProduct) {
      productData.slug = `${productData.slug}-${Date.now()}`;
    }

    // Tạo product
    const { data: newProduct, error: createError } = await supabase
      .from('products')
      .insert({
        ...productData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (createError || !newProduct) {
      console.error('Create product error:', createError);
      return res.status(500).json({ error: 'Lỗi tạo product' });
    }

    return res.status(201).json({
      success: true,
      data: newProduct,
      message: 'Tạo product thành công'
    });

  } catch (error) {
    console.error('Create product error:', error);
    return res.status(500).json({ 
      error: 'Lỗi tạo product', 
      details: error.message 
    });
  }
});

export default router;
