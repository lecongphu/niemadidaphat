export const runtime = 'edge';

import ChapterPlayerList from "@/components/ChapterPlayerList";
import { getProductBySlugDb } from "@/lib/productsRepo";
import { getTimeAgo } from "@/lib/dateUtils";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};


export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlugDb(slug);
  if (!product) return notFound();

  return (
    <div className="space-y-8 sm:space-y-12">
      <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
        <div className="lg:w-1/3">
          <div className="w-full aspect-[3/2] bg-gradient-to-br from-amber-50 to-orange-100 rounded-lg border border-amber-200 flex items-center justify-center shadow-sm">
            {product.cover_url ? (
              <img 
                src={product.cover_url} 
                alt={product.title}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="text-center p-4">
                <div className="text-3xl sm:text-4xl mb-2">🪷</div>
                <span className="text-amber-800 text-sm font-medium">{product.title}</span>
              </div>
            )}
          </div>
        </div>
        <div className="lg:flex-1 space-y-4 sm:space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-amber-900 mb-2">{product.title}</h1>
            <p className="text-gray-700 text-sm sm:text-base">
              <span className="font-medium">Tác giả:</span> {product.author}
              {product.narrator && (
                <>
                  <br />
                  <span className="font-medium">Giọng đọc:</span> {product.narrator}
                </>
              )}
            </p>
            <p className="text-gray-600 text-sm sm:text-base mt-2">
              <span className="font-medium">Thời lượng:</span> {product.duration}
            </p>
            {product.lecture_date && (
              <p className="text-gray-600 text-sm sm:text-base mt-1">
                <span className="font-medium">Ngày giảng:</span> {getTimeAgo(product.lecture_date)}
              </p>
            )}
          </div>
          {product.description && (
            <div className="p-4 sm:p-6 bg-amber-50 rounded-lg border border-amber-200">
              <h3 className="font-semibold text-amber-900 mb-2 sm:mb-3">Mô tả</h3>
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed">{product.description}</p>
            </div>
          )}
        </div>
      </div>

      <section>
        <ChapterPlayerList product={product} showTitle={false} />
      </section>
    </div>
  );
}


