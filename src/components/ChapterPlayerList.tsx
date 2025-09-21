"use client";

import { useState } from "react";
import GlobalPlayer from "@/components/GlobalPlayer";
import PDFReader from "@/components/PDFReader";
import type { Product } from "@/lib/types";
import { getOptimizedAudioUrl, useAdaptiveAudioQuality } from "@/lib/audioOptimization";
import { useAudio } from "@/contexts/AudioContext";
import { useChapters } from "@/hooks/useChapters";

interface ChapterPlayerListProps {
  product: Product;
  showTitle?: boolean;
}

export default function ChapterPlayerList({ product, showTitle = true }: ChapterPlayerListProps) {
  const adaptiveQuality = useAdaptiveAudioQuality();
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null);
  const [showPDF, setShowPDF] = useState(false);
  const { currentTime, currentTrack } = useAudio();
  
  // Sử dụng hook để lấy chapters
  const { chapters, loading: chaptersLoading, error: chaptersError } = useChapters({
    productId: product.id
  });
  
  // Lọc những chapters có audio_url
  const chaptersWithAudio = chapters.filter(chapter => chapter.audio_url);

  // Loading state
  if (chaptersLoading) {
    return (
      <div className="space-y-4">
        {showTitle && (
          <div className="text-center">
            <h3 className="text-xl sm:text-2xl font-bold mb-2">{product.title}</h3>
            <p className="text-sm sm:text-base text-gray-600">
              Tác giả: {product.author} • Thời lượng: {product.duration}
            </p>
          </div>
        )}
        <div className="text-center py-8 text-gray-600 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-4xl mb-3">⏳</div>
          <div className="font-medium mb-2">Đang tải danh sách tập...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (chaptersError) {
    return (
      <div className="space-y-4">
        {showTitle && (
          <div className="text-center">
            <h3 className="text-xl sm:text-2xl font-bold mb-2">{product.title}</h3>
            <p className="text-sm sm:text-base text-gray-600">
              Tác giả: {product.author} • Thời lượng: {product.duration}
            </p>
          </div>
        )}
        <div className="text-center py-8 text-red-600 bg-red-50 rounded-lg border border-red-200">
          <div className="text-4xl mb-3">❌</div>
          <div className="font-medium mb-2">Lỗi tải danh sách tập</div>
          <div className="text-sm text-red-500">{chaptersError}</div>
        </div>
      </div>
    );
  }

  if (chaptersWithAudio.length === 0) {
    // Không có chapters với audio - hiển thị thông báo
    return (
      <div className="space-y-4">
        {showTitle && (
          <div className="text-center">
            <h3 className="text-xl sm:text-2xl font-bold mb-2">{product.title}</h3>
            <p className="text-sm sm:text-base text-gray-600">
              Tác giả: {product.author} • Thời lượng: {product.duration}
            </p>
          </div>
        )}
        <div className="text-center py-8 text-amber-600 bg-amber-50 rounded-lg border border-amber-200">
          <div className="text-4xl mb-3">🎵</div>
          <div className="font-medium mb-2">Chưa có audio để phát</div>
          <div className="text-sm text-amber-500">Vui lòng thêm các tập audio trong trang quản trị</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {showTitle && (
        <div className="text-center space-y-2 sm:space-y-3">
          <h3 className="text-xl sm:text-2xl font-bold">{product.title}</h3>
          <p className="text-sm sm:text-base text-gray-600">
            Tác giả: {product.author} • {chaptersWithAudio.length} tập
          </p>
          {product.narrator && (
            <p className="text-sm text-gray-500">Giọng đọc: {product.narrator}</p>
          )}
          {product.pdf_url && (
            <div className="flex items-center justify-center gap-2 mt-3">
              <button
                onClick={() => setShowPDF(!showPDF)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  showPDF 
                    ? 'lotus-gradient text-white shadow-lg' 
                    : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                }`}
              >
                {showPDF ? '📖 Ẩn sách' : '📖 Hiển thị sách'}
              </button>
              <span className="text-xs text-amber-600">Đồng bộ với audio</span>
            </div>
          )}
        </div>
      )}

      <div className="space-y-4 sm:space-y-6">
        <div className="text-center">
          <h4 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-amber-800">
            📚 Danh sách các tập
          </h4>
        </div>
        
        {/* Spotify-style Table */}
        <div className="bg-gradient-to-br from-amber-50 via-amber-100 to-amber-200 rounded-xl overflow-hidden shadow-lg">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-amber-300/50 text-xs font-medium text-amber-800 uppercase tracking-wide">
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-5">Tập</div>
            <div className="col-span-3">Tên bài giảng</div>
            <div className="col-span-2">Thời lượng</div>
            <div className="col-span-1 text-center">Tải xuống</div>
          </div>
          
          {/* Table Body */}
          <div className="divide-y divide-amber-200/50">
            {chaptersWithAudio.map((chapter, index) => (
              <div key={chapter.id}>
                {/* Table Row */}
                <div 
                  className={`grid grid-cols-12 gap-4 px-4 py-3 hover:bg-amber-200/30 transition-colors group cursor-pointer ${
                    expandedChapter === index ? 'bg-amber-200/40' : ''
                  }`}
                  onClick={() => setExpandedChapter(expandedChapter === index ? null : index)}
                >
                  {/* Track Number */}
                  <div className="col-span-1 flex items-center justify-center">
                    {expandedChapter === index ? (
                      <span className="text-amber-800 text-lg">🔽</span>
                    ) : (
                      <>
                        <span className="text-amber-700 font-medium group-hover:hidden">
                          {index + 1}
                        </span>
                        <span className="hidden group-hover:block text-amber-800">
                          ▶️
                        </span>
                      </>
                    )}
                  </div>
                  
                  {/* Title & Info */}
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded flex items-center justify-center">
                      <span className="text-white text-lg">🎵</span>
                    </div>
                    <div>
                      <div className="font-medium text-amber-900 group-hover:underline">
                        {chapter.title}
                      </div>
                      <div className="text-sm text-amber-700">
                        {product.author}
                      </div>
                    </div>
                  </div>
                  
                  {/* Album */}
                  <div className="col-span-3 flex items-center text-sm text-amber-800 truncate">
                    {product.title}
                  </div>
                  
                  {/* Duration */}
                  <div className="col-span-2 flex items-center text-sm text-amber-700">
                    {chapter.duration_seconds 
                      ? `${Math.floor(chapter.duration_seconds / 60)}:${(chapter.duration_seconds % 60).toString().padStart(2, '0')}`
                      : '~:~~'
                    }
                  </div>
                  
                  {/* Download Button */}
                  <div className="col-span-1 flex items-center justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (chapter.audio_url) {
                          const link = document.createElement('a');
                          link.href = getOptimizedAudioUrl(chapter.audio_url, { quality: adaptiveQuality });
                          link.download = `${chapter.title}.mp3`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }
                      }}
                      className="text-amber-600 hover:text-amber-800 transition-colors p-1 rounded hover:bg-amber-200"
                      title="Tải xuống tập này"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Player Component - Show only when expanded */}
                {expandedChapter === index && (
                  <div className="px-4 pb-3 bg-amber-100/50 border-t border-amber-200/50">
                    <GlobalPlayer
                      title={`${product.title} - ${chapter.title}`}
                      src={getOptimizedAudioUrl(chapter.audio_url!, { quality: adaptiveQuality })}
                      persistKey={`${product.slug}-chapter-${chapter.id}`}
                      artist={product.author}
                      album={product.title}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {product.description && (
        <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-amber-50 rounded-lg border border-amber-200">
          <h5 className="font-semibold text-amber-900 mb-2 sm:mb-3">Mô tả</h5>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
            {product.description}
          </p>
        </div>
      )}

      {/* PDF Reader */}
      {product.pdf_url && showPDF && (
        <div className="mt-6 sm:mt-8">
          <PDFReader
            pdfUrl={product.pdf_url}
            title={product.title}
            currentTime={
              currentTrack && currentTrack.src.includes(product.slug) 
                ? currentTime 
                : 0
            }
            onPageChange={(page) => {
              console.log(`PDF page changed to: ${page}`);
            }}
          />
        </div>
      )}
    </div>
  );
}

