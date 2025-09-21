import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/products/[slug] - Lấy product theo slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Await params trước khi sử dụng
    const { slug } = await params;
    
    const { searchParams } = new URL(request.url);
    const includeChapters = searchParams.get('includeChapters') !== 'false'; // Default true

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase không được cấu hình' },
        { status: 500 }
      );
    }

    // Lấy thông tin product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Không tìm thấy product' },
        { status: 404 }
      );
    }

    // Nếu không cần chapters, trả về product
    if (!includeChapters) {
      return NextResponse.json({
        success: true,
        data: product
      });
    }

    // Lấy chapters của product
    const { data: chapters, error: chaptersError } = await supabase
      .from('chapters')
      .select('*')
      .eq('product_id', product.id)
      .order('sort_order', { ascending: true });

    if (chaptersError) {
      console.error('Chapters query error:', chaptersError);
      // Trả về product không có chapters nếu lỗi
      return NextResponse.json({
        success: true,
        data: {
          ...product,
          chapters: []
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...product,
        chapters: chapters || []
      }
    });

  } catch (error) {
    console.error('Get product by slug error:', error);
    return NextResponse.json(
      { 
        error: 'Lỗi lấy thông tin product', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// PUT /api/products/[slug] - Cập nhật product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Await params trước khi sử dụng
    const { slug } = await params;
    
    const updateData = await request.json();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase không được cấu hình' },
        { status: 500 }
      );
    }

    // Kiểm tra product tồn tại
    const { data: existingProduct, error: productError } = await supabase
      .from('products')
      .select('id')
      .eq('slug', slug)
      .single();

    if (productError || !existingProduct) {
      return NextResponse.json(
        { error: 'Không tìm thấy product' },
        { status: 404 }
      );
    }

    // Cập nhật product
    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingProduct.id)
      .select()
      .single();

    if (updateError || !updatedProduct) {
      console.error('Update product error:', updateError);
      return NextResponse.json(
        { error: 'Lỗi cập nhật product' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedProduct,
      message: 'Cập nhật product thành công'
    });

  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { 
        error: 'Lỗi cập nhật product', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
