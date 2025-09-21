import { NextRequest, NextResponse } from 'next/server';

// OAuth callback route - chỉ để fallback, không sử dụng cho Google One-Tap
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const origin = requestUrl.origin;

  // Redirect về trang chủ với thông báo rằng nên sử dụng Google One-Tap
  console.log('OAuth callback được gọi - khuyến khích sử dụng Google One-Tap thay thế');
  return NextResponse.redirect(`${origin}/?info=use_one_tap`);
}
