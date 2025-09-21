import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { bunnyStorage } from '@/lib/bunnyStorage';

// Supabase Admin is already initialized in the import

export async function DELETE(request: NextRequest) {
  try {
    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID là bắt buộc' },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase Admin không được cấu hình' },
        { status: 500 }
      );
    }

    // Lấy thông tin sản phẩm trước khi xóa
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Không tìm thấy sản phẩm' },
        { status: 404 }
      );
    }

    const deletedFiles: string[] = [];

    // Xóa PDF file nếu có
    if (product.pdf_url) {
      try {
        const filePath = bunnyStorage.extractFilePath(product.pdf_url);
        if (filePath) {
          const deleteResult = await bunnyStorage.deleteFile(filePath);
          if (deleteResult.success) {
            deletedFiles.push(`PDF: ${filePath}`);
            console.log(`✅ Đã xóa PDF file: ${filePath}`);
          } else {
            console.error('❌ Lỗi xóa PDF file:', deleteResult.error);
          }
        }
      } catch (error) {
        console.error('❌ Lỗi xóa PDF file:', error);
      }
    }

    // Xóa cover image nếu có
    if (product.cover_url) {
      try {
        const filePath = bunnyStorage.extractFilePath(product.cover_url);
        if (filePath) {
          const deleteResult = await bunnyStorage.deleteFile(filePath);
          if (deleteResult.success) {
            deletedFiles.push(`Cover: ${filePath}`);
            console.log(`✅ Đã xóa cover image: ${filePath}`);
          } else {
            console.error('❌ Lỗi xóa cover image:', deleteResult.error);
          }
        }
      } catch (error) {
        console.error('❌ Lỗi xóa cover image:', error);
      }
    }

    // Lấy tất cả chapters của product để xóa audio files
    const { data: chapters, error: chaptersError } = await supabase
      .from('chapters')
      .select('audio_url')
      .eq('product_id', productId);

    if (!chaptersError && chapters) {
      for (const chapter of chapters) {
        if (chapter.audio_url) {
          try {
            const filePath = bunnyStorage.extractFilePath(chapter.audio_url);
            if (filePath) {
              const deleteResult = await bunnyStorage.deleteFile(filePath);
              if (deleteResult.success) {
                deletedFiles.push(`Audio: ${filePath}`);
                console.log(`✅ Đã xóa audio file: ${filePath}`);
              } else {
                console.error('❌ Lỗi xóa audio file:', deleteResult.error);
              }
            }
          } catch (error) {
            console.error('❌ Lỗi xóa audio file:', error);
          }
        }
      }
    }

    // Xóa tất cả related data (chapters, followers, views) trước khi xóa product
    const deletePromises = [
      // Xóa tất cả chapters liên quan
      supabase
        .from('chapters')
        .delete()
        .eq('product_id', productId),
      
      // Xóa tất cả followers liên quan
      supabase
        .from('followers')
        .delete()
        .eq('product_id', productId),
      
      // Xóa tất cả product_views liên quan
      supabase
        .from('product_views')
        .delete()
        .eq('product_id', productId)
    ];

    // Thực hiện tất cả deletes parallel
    await Promise.all(deletePromises);

    // Cuối cùng xóa sản phẩm
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (deleteError) {
      throw new Error(`Lỗi xóa sản phẩm: ${deleteError.message}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Đã xóa sản phẩm và tất cả file liên quan thành công',
      deletedProduct: {
        id: product.id,
        title: product.title,
        slug: product.slug
      },
      deletedFiles: deletedFiles
    });

  } catch (error) {
    console.error('Product deletion error:', error);
    return NextResponse.json(
      { 
        error: 'Lỗi xóa sản phẩm', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
