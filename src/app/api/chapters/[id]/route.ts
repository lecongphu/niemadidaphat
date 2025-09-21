import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ChapterUpdateInput } from '@/lib/types';

// Helper function để validate chapter ID
function validateChapterId(id: string | undefined) {
  if (!id) {
    return { error: 'Chapter ID là bắt buộc', status: 400 };
  }

  // UUID validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return { error: 'Chapter ID không đúng định dạng UUID', status: 400 };
  }

  return null;
}

// GET /api/chapters/[id] - Lấy thông tin chapter
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params trước khi sử dụng
    const { id } = await params;
    
    // Validate params.id
    const validationError = validateChapterId(id);
    if (validationError) {
      return NextResponse.json(
        { error: validationError.error },
        { status: validationError.status }
      );
    }

    const { data: chapter, error: chapterError } = await supabase
      .from('chapters')
      .select('*')
      .eq('id', id)
      .single();

    if (chapterError || !chapter) {
      return NextResponse.json(
        { error: 'Không tìm thấy chapter' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: chapter
    });

  } catch (error) {
    console.error('Get chapter error:', error);
    return NextResponse.json(
      { 
        error: 'Lỗi lấy thông tin chapter', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// PUT /api/chapters/[id] - Cập nhật chapter
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params trước khi sử dụng
    const { id } = await params;
    
    // Validate params.id
    const validationError = validateChapterId(id);
    if (validationError) {
      return NextResponse.json(
        { error: validationError.error },
        { status: validationError.status }
      );
    }

    const updateData: ChapterUpdateInput = await request.json();

    // Kiểm tra chapter tồn tại
    const { data: existingChapter, error: chapterError } = await supabase
      .from('chapters')
      .select('*')
      .eq('id', id)
      .single();

    if (chapterError || !existingChapter) {
      return NextResponse.json(
        { error: 'Không tìm thấy chapter' },
        { status: 404 }
      );
    }

    // Cập nhật chapter
    const { data: updatedChapter, error: updateError } = await supabase
      .from('chapters')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError || !updatedChapter) {
      console.error('Update chapter error:', updateError);
      return NextResponse.json(
        { error: 'Lỗi cập nhật chapter' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedChapter,
      message: 'Cập nhật chapter thành công'
    });

  } catch (error) {
    console.error('Update chapter error:', error);
    return NextResponse.json(
      { 
        error: 'Lỗi cập nhật chapter', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// DELETE /api/chapters/[id] - Xóa chapter
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params trước khi sử dụng
    const { id } = await params;
    
    // Validate params.id
    const validationError = validateChapterId(id);
    if (validationError) {
      return NextResponse.json(
        { error: validationError.error },
        { status: validationError.status }
      );
    }

    // Kiểm tra chapter tồn tại
    const { data: chapter, error: chapterError } = await supabase
      .from('chapters')
      .select('*')
      .eq('id', id)
      .single();

    if (chapterError || !chapter) {
      return NextResponse.json(
        { error: 'Không tìm thấy chapter' },
        { status: 404 }
      );
    }

    // Xóa chapter
    const { error: deleteError } = await supabase
      .from('chapters')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Delete chapter error:', deleteError);
      return NextResponse.json(
        { error: 'Lỗi xóa chapter' },
        { status: 500 }
      );
    }

    // Đánh số lại các chapter còn lại của product này
    const { data: remainingChapters, error: chaptersError } = await supabase
      .from('chapters')
      .select('*')
      .eq('product_id', chapter.product_id)
      .order('sort_order', { ascending: true });

    if (!chaptersError && remainingChapters && remainingChapters.length > 0) {
      // Cập nhật sort_order cho các chapter còn lại
      for (let i = 0; i < remainingChapters.length; i++) {
        const ch = remainingChapters[i];
        const newSortOrder = i + 1;
        const newTitle = ch.title.startsWith('Tập ') ? `Tập ${newSortOrder}` : ch.title;

        await supabase
          .from('chapters')
          .update({
            sort_order: newSortOrder,
            title: newTitle,
            updated_at: new Date().toISOString()
          })
          .eq('id', ch.id);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Xóa chapter thành công',
      deletedChapter: chapter
    });

  } catch (error) {
    console.error('Delete chapter error:', error);
    return NextResponse.json(
      { 
        error: 'Lỗi xóa chapter', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
