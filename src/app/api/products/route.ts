import { NextRequest, NextResponse } from 'next/server';
import { SupabaseService } from '@/lib/supabaseService';
import { ProductCreateInput } from '@/lib/types';

// GET /api/products - Lấy danh sách products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const includeChapters = searchParams.get('includeChapters') === 'true';

    // Get products
    let allProducts;
    
    if (search) {
      // Use Supabase search functionality
      allProducts = await SupabaseService.searchProducts(search);
    } else {
      // Get all products
      allProducts = await SupabaseService.getProducts();
    }

    // Filter by category if specified
    let filteredProducts = allProducts;
    if (category) {
      filteredProducts = allProducts.filter(product => product.category === category);
    }

    // Apply pagination
    const paginatedProducts = filteredProducts.slice(offset, offset + limit);

    // Nếu cần include chapters, lấy thêm chapters cho mỗi product
    if (includeChapters && paginatedProducts.length > 0) {
      const productsWithChapters = await Promise.all(
        paginatedProducts.map(async (product) => {
          const chapters = await SupabaseService.getChaptersByProductId(product.id);
          return {
            ...product,
            chapters: chapters || []
          };
        })
      );

      return NextResponse.json({
        success: true,
        data: productsWithChapters,
        count: filteredProducts.length
      });
    }

    return NextResponse.json({
      success: true,
      data: paginatedProducts,
      count: filteredProducts.length
    });

  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { 
        error: 'Lỗi lấy danh sách products', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// POST /api/products - Tạo product mới
export async function POST(request: NextRequest) {
  try {
    const productData: ProductCreateInput = await request.json();

    // Validate required fields
    if (!productData.title || !productData.author || !productData.description) {
      return NextResponse.json(
        { error: 'Title, author và description là bắt buộc' },
        { status: 400 }
      );
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
    const existingProduct = await SupabaseService.getProductBySlug(productData.slug);

    if (existingProduct) {
      productData.slug = `${productData.slug}-${Date.now()}`;
    }

    // Tạo product
    const newProduct = await SupabaseService.createProduct(productData);

    return NextResponse.json({
      success: true,
      data: newProduct,
      message: 'Tạo product thành công'
    }, { status: 201 });

  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { 
        error: 'Lỗi tạo product', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
