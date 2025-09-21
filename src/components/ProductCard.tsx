import Link from "next/link";

type ProductCardProps = {
  product: {
    id: string;
    slug: string;
    title: string;
    author: string;
    duration: string;
    narrator?: string | null;
  };
};

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="serene-card p-4 sm:p-6 flex flex-col gap-3 sm:gap-4 group hover:scale-105 peaceful-transition">
      <div className="w-full aspect-[4/3] bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl flex items-center justify-center overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-200/30 to-orange-300/30"></div>
        <div className="relative text-center space-y-1 sm:space-y-2">
          <div className="w-10 h-10 sm:w-12 sm:h-12 lotus-gradient rounded-full flex items-center justify-center mx-auto">
            <span className="text-white text-lg sm:text-xl">📿</span>
          </div>
          <p className="text-amber-700 text-xs sm:text-sm font-medium px-2">{product.title}</p>
        </div>
      </div>
      <div className="flex-1 space-y-2 sm:space-y-3">
        <h3 className="text-base sm:text-lg font-semibold leading-tight">
          <Link href={`/an-pham/${product.slug}`} className="wisdom-text hover:text-amber-600 peaceful-transition">
            {product.title}
          </Link>
        </h3>
        <div className="space-y-1 text-xs sm:text-sm">
          <p className="text-amber-700/80 flex items-center gap-1 sm:gap-2">
            <span className="text-amber-500 text-sm">✍️</span>
            <span className="truncate">{product.author}</span>
          </p>
          {product.narrator && (
            <p className="text-amber-700/80 flex items-center gap-1 sm:gap-2">
              <span className="text-amber-500 text-sm">🎤</span>
              <span className="truncate">{product.narrator}</span>
            </p>
          )}
          <p className="text-amber-700/80 flex items-center gap-1 sm:gap-2">
            <span className="text-amber-500 text-sm">⏱️</span>
            {product.duration}
          </p>
        </div>
      </div>
      <div className="pt-1 sm:pt-2">
        <Link 
          href={`/an-pham/${product.slug}`} 
          className="lotus-button w-full text-center inline-flex items-center justify-center gap-2 text-sm sm:text-base py-2 sm:py-3"
        >
          🪷 Nghe thử
        </Link>
      </div>
    </div>
  );
}


