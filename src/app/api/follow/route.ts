import { NextRequest, NextResponse } from 'next/server';
import { SupabaseService } from '@/lib/supabaseService';
import { SupabaseAuth } from '@/lib/supabaseAuth';

export const runtime = 'nodejs';

// POST /api/follow - Follow a product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, userId } = body;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID là bắt buộc' },
        { status: 400 }
      );
    }

    // Nếu không có userId, lấy từ auth hiện tại
    let currentUserId = userId;
    if (!currentUserId) {
      const { user } = await SupabaseAuth.getCurrentUser();
      if (!user) {
        return NextResponse.json(
          { error: 'Cần đăng nhập để follow sản phẩm' },
          { status: 401 }
        );
      }
      currentUserId = user.id;
    }

    // Follow sản phẩm
    await SupabaseService.followProduct(productId, currentUserId);

    return NextResponse.json({
      success: true,
      message: 'Đã follow sản phẩm thành công'
    });

  } catch (error: unknown) {
    console.error('Follow product error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi follow sản phẩm';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE /api/follow - Unfollow a product
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, userId } = body;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID là bắt buộc' },
        { status: 400 }
      );
    }

    // Nếu không có userId, lấy từ auth hiện tại
    let currentUserId = userId;
    if (!currentUserId) {
      const { user } = await SupabaseAuth.getCurrentUser();
      if (!user) {
        return NextResponse.json(
          { error: 'Cần đăng nhập để unfollow sản phẩm' },
          { status: 401 }
        );
      }
      currentUserId = user.id;
    }

    // Unfollow sản phẩm
    await SupabaseService.unfollowProduct(productId, currentUserId);

    return NextResponse.json({
      success: true,
      message: 'Đã unfollow sản phẩm thành công'
    });

  } catch (error: unknown) {
    console.error('Unfollow product error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi unfollow sản phẩm';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// GET /api/follow - Check if user is following a product
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const userId = searchParams.get('userId');

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID là bắt buộc' },
        { status: 400 }
      );
    }

    // Nếu không có userId, lấy từ auth hiện tại
    let currentUserId = userId;
    if (!currentUserId) {
      const { user } = await SupabaseAuth.getCurrentUser();
      if (!user) {
        return NextResponse.json({
          isFollowing: false
        });
      }
      currentUserId = user.id;
    }

    // Kiểm tra follow status
    const isFollowing = await SupabaseService.isFollowing(productId, currentUserId!);

    return NextResponse.json({
      isFollowing,
      productId,
      userId: currentUserId
    });

  } catch (error: unknown) {
    console.error('Check follow status error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi kiểm tra follow status';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}