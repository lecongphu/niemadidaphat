import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { bunnyStorage } from '@/lib/bunnyStorage';

export async function DELETE(request: NextRequest) {
  try {
    const { chapterId, pdfUrl } = await request.json();

    if (!chapterId) {
      return NextResponse.json(
        { error: 'Chapter ID là bắt buộc' },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase không được cấu hình' },
        { status: 500 }
      );
    }

    // Lấy thông tin chapter cần xóa
    const { data: chapter, error: chapterError } = await supabase
      .from('chapters')
      .select('*')
      .eq('id', chapterId)
      .single();

    if (chapterError || !chapter) {
      return NextResponse.json(
        { error: 'Không tìm thấy chapter' },
        { status: 404 }
      );
    }

    // Xóa file audio trên Bunny CDN nếu có
    if (chapter.audio_url) {
      try {
        const filePath = bunnyStorage.extractFilePath(chapter.audio_url);
        if (filePath) {
          const deleteResult = await bunnyStorage.deleteFile(filePath);
          if (deleteResult.success) {
            console.log(`✅ Đã xóa audio file: ${filePath}`);
          } else {
            console.error('❌ Lỗi xóa audio file:', deleteResult.error);
          }
        }
      } catch (error) {
        console.error('❌ Lỗi xóa audio file:', error);
        // Không throw error để tiếp tục xóa chapter trong DB
      }
    }

    // Xóa file PDF trên Bunny CDN nếu có (từ product level)
    if (pdfUrl) {
      try {
        const filePath = bunnyStorage.extractFilePath(pdfUrl);
        if (filePath) {
          const deleteResult = await bunnyStorage.deleteFile(filePath);
          if (deleteResult.success) {
            console.log(`✅ Đã xóa PDF file: ${filePath}`);
          } else {
            console.error('❌ Lỗi xóa PDF file:', deleteResult.error);
          }
        }
      } catch (error) {
        console.error('❌ Lỗi xóa PDF file:', error);
        // Không throw error để tiếp tục xóa chapter trong DB
      }
    }

    // Xóa chapter khỏi database
    const { error: deleteError } = await supabase
      .from('chapters')
      .delete()
      .eq('id', chapterId);

    if (deleteError) {
      console.error('Delete chapter error:', deleteError);
      return NextResponse.json(
        { error: 'Lỗi xóa chapter từ database' },
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
      message: 'Đã xóa chapter và file thành công',
      deletedChapter: chapter
    });

  } catch (error) {
    console.error('Chapter deletion error:', error);
    return NextResponse.json(
      { 
        error: 'Lỗi xóa chapter', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
