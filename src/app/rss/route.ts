import { NextResponse } from "next/server";

export async function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Kinh Sách Âm Thanh - RSS</title>
    <link>https://example.com</link>
    <description>Các bài viết mới (placeholder)</description>
    <item>
      <title>Bài viết mẫu</title>
      <link>https://example.com/blog/bai-viet-mau</link>
      <guid>https://example.com/blog/bai-viet-mau</guid>
      <description>Nội dung mẫu</description>
    </item>
  </channel>
</rss>`;
  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}


