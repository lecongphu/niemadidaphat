type Props = { params: Promise<{ slug: string }> };

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  return (
    <article className="prose max-w-none">
      <h1 className="text-3xl font-semibold">Bài viết: {slug}</h1>
      <p className="text-gray-600">Nội dung bài viết sẽ hiển thị tại đây (placeholder).</p>
    </article>
  );
}


