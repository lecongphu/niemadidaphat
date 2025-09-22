import { NextRequest, NextResponse } from 'next/server';
import { SupabaseService } from '@/lib/supabaseService';
import { ChapterCreateInput } from '@/lib/types';
import { withOptionalAuth, withAuth } from '@/lib/authMiddleware';

// GET /api/chapters - Lấy danh sách chapters
export async function GET(request: NextRequest) {
  return withOptionalAuth(request, async (req) => {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (productId) {
      // Get chapters for specific product
      const chapters = await SupabaseService.getChaptersByProductId(productId);
      
      return NextResponse.json({
        success: true,
        data: chapters,
        count: chapters.length
      });
    } else {
      return NextResponse.json(
        { error: 'Product ID là bắt buộc' },
        { status: 400 }
      );
    }

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
  });
}

// POST /api/chapters - Tạo chapter mới (Cần authentication)
export async function POST(request: NextRequest) {
  return withAuth(request, async (req) => {
  try {
    const chapterData: ChapterCreateInput = await request.json();

    // Validate required fields
    if (!chapterData.product_id || !chapterData.title) {
      return NextResponse.json(
        { error: 'Product ID và title là bắt buộc' },
        { status: 400 }
      );
    }

    // Create chapter using SupabaseService
    const newChapter = await SupabaseService.createChapter(chapterData);

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
  });
}
