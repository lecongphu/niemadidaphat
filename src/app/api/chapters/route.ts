import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ChapterCreateInput } from '@/lib/types';

// GET /api/chapters - Lấy danh sách chapters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase không được cấu hình' },
        { status: 500 }
      );
    }

    // Build query
    let query = supabase
      .from('chapters')
      .select('*')
      .order('sort_order', { ascending: true })
      .range(offset, offset + limit - 1);

    // Apply product filter if provided
    if (productId) {
      query = query.eq('product_id', productId);
    }

    const { data: chapters, error: chaptersError, count } = await query;

    if (chaptersError) {
      console.error('Chapters query error:', chaptersError);
      return NextResponse.json(
        { error: 'Lỗi lấy danh sách chapters' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: chapters || [],
      count: chapters?.length || 0,
      total: count || 0
    });

  } catch (error) {
    console.error('Get chapters error:', error);
    return NextResponse.json(
      { 
        error: 'Lỗi lấy danh sách chapters', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// POST /api/chapters - Tạo chapter mới
export async function POST(request: NextRequest) {
  try {
    const chapterData: ChapterCreateInput = await request.json();

    // Validate required fields
    if (!chapterData.product_id || !chapterData.title) {
      return NextResponse.json(
        { error: 'Product ID và title là bắt buộc' },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase không được cấu hình' },
        { status: 500 }
      );
    }

    // Kiểm tra product tồn tại
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id')
      .eq('id', chapterData.product_id)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Không tìm thấy product' },
        { status: 404 }
      );
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
      return NextResponse.json(
        { error: 'Lỗi tạo chapter' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: newChapter,
      message: 'Tạo chapter thành công'
    }, { status: 201 });

  } catch (error) {
    console.error('Create chapter error:', error);
    return NextResponse.json(
      { 
        error: 'Lỗi tạo chapter', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
