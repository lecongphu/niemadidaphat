import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/chapters/product/[productId] - Lấy chapters của một product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    // Await params trước khi sử dụng
    const { productId } = await params;
    
    const { searchParams } = new URL(request.url);
    // const includeProductInfo = searchParams.get('includeProduct') === 'true';

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase không được cấu hình' },
        { status: 500 }
      );
    }

    // Validate productId format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(productId)) {
      return NextResponse.json(
        { error: 'Product ID không đúng định dạng UUID' },
        { status: 400 }
      );
    }

    // Lấy chapters của product
    const { data: chapters, error: chaptersError } = await supabase
      .from('chapters')
      .select('*')
      .eq('product_id', productId)
      .order('sort_order', { ascending: true });

    if (chaptersError) {
      console.error('Chapters query error:', chaptersError);
      return NextResponse.json(
        { error: 'Lỗi lấy chapters của product' },
        { status: 500 }
      );
    }

    // Kiểm tra product tồn tại nếu không có chapters
    if (!chapters || chapters.length === 0) {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, title')
        .eq('id', productId)
        .single();

      if (productError || !product) {
        return NextResponse.json(
          { error: 'Không tìm thấy product' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: chapters || [],
      count: chapters?.length || 0,
      productId: productId
    });

  } catch (error) {
    console.error('Get product chapters error:', error);
    return NextResponse.json(
      { 
        error: 'Lỗi lấy chapters của product', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
