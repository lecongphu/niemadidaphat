export const runtime = 'edge';

export const dynamic = "force-dynamic";

import ProductCard from "@/components/ProductCard";
import { listProducts } from "@/lib/productsRepo";

export default async function CatalogPage() {
  const products = await listProducts();
  return (
    <div className="space-y-8 sm:space-y-12">
      <div className="text-center space-y-3 sm:space-y-4 px-4">
        <div className="flex justify-center mb-3 sm:mb-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 lotus-gradient rounded-full flex items-center justify-center peaceful-shadow">
            <span className="text-white text-xl sm:text-2xl">📚</span>
          </div>
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold">Ấn phẩm Kinh sách</h1>
        <p className="wisdom-text text-base sm:text-lg max-w-2xl mx-auto">
          Thư viện âm thanh thanh tịnh với những tác phẩm kinh điển được biên tập kỹ lưỡng, 
          mang đến sự bình an cho tâm hồn.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
        {products.map((p) => (
          <ProductCard key={p.id} product={{
            id: p.id,
            slug: p.slug,
            title: p.title,
            author: p.author,
            narrator: p.narrator ?? undefined,
            duration: p.duration,
          }} />
        ))}
      </div>
      {products.length === 0 && (
        <div className="serene-card p-8 sm:p-12 text-center mx-2">
          <div className="w-12 h-12 sm:w-16 sm:h-16 lotus-gradient rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <span className="text-white text-xl sm:text-2xl">🪷</span>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold mb-2">Sắp có nhiều ấn phẩm hơn</h3>
          <p className="wisdom-text text-sm sm:text-base">Chúng tôi đang chuẩn bị thêm nhiều tác phẩm kinh điển để phục vụ bạn.</p>
        </div>
      )}
    </div>
  );
}


