"use client";

import { useState, useEffect, useRef } from 'react';
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist/types/src/display/api';
import { useAudio } from '@/contexts/AudioContext';

interface PDFReaderProps {
  pdfUrl: string;
  title?: string;
  currentTime?: number; // Audio current time for sync
  onPageChange?: (page: number) => void;
}

export default function PDFReader({ pdfUrl, title = "Kinh sách", currentTime = 0, onPageChange }: PDFReaderProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [pageImages, setPageImages] = useState<{[key: number]: string}>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isPlaying } = useAudio();

  // Auto page turning based on audio time (example: 30 seconds per page)
  useEffect(() => {
    if (isPlaying && currentTime > 0 && totalPages > 0) {
      const estimatedPage = Math.min(Math.floor(currentTime / 30) + 1, totalPages);
      if (estimatedPage !== currentPage && estimatedPage > 0) {
        goToPage(estimatedPage);
      }
    }
  }, [currentTime, isPlaying, totalPages, currentPage]);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage || isFlipping) return;
    
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentPage(page);
      onPageChange?.(page);
      setIsFlipping(false);
    }, 300);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  // Load PDF using PDF.js (dynamic import to avoid SSR/DOMMatrix issues)
  useEffect(() => {
    if (!pdfUrl) return;
    
    setIsLoading(true);
    setError(null);
    
    const loadPDF = async () => {
      try {
        // Dynamic import on client only
        const pdfjsLib = await import('pdfjs-dist');
        if (typeof window !== 'undefined' && pdfjsLib?.GlobalWorkerOptions) {
          // Prefer local worker served from /public to avoid CDN/CSP issues
          const localMjs = '/pdf.worker.min.mjs';
          const localJs = '/pdf.worker.min.js';
          // Try module worker first
          try {
            // If file exists, set workerSrc to local path
            pdfjsLib.GlobalWorkerOptions.workerSrc = localMjs;
          } catch {
            try {
              pdfjsLib.GlobalWorkerOptions.workerSrc = localJs;
            } catch {
              // Last resort: CDN
              pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
            }
          }
        }

        // Route through internal proxy to avoid CORS/cross-origin range issues
        const proxiedUrl = `/api/proxy/pdf?url=${encodeURIComponent(pdfUrl)}`;
        const loadingTask = pdfjsLib.getDocument({ url: proxiedUrl, isEvalSupported: false });
        const pdf = await loadingTask.promise;
        
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        setIsLoading(false);
        
        // Pre-load first few pages
        await renderPage(1);
        if (pdf.numPages > 1) await renderPage(2);
        
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError('Không thể tải file PDF. Vui lòng kiểm tra đường dẫn.');
        setIsLoading(false);
      }
    };
    
    loadPDF();
  }, [pdfUrl]);

  // Render PDF page to canvas and convert to image
  const renderPage = async (pageNum: number) => {
    if (!pdfDoc || pageImages[pageNum]) return;
    
    try {
      const page: PDFPageProxy = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 });
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) return;
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        canvas: canvas as unknown as HTMLCanvasElement,
      } as unknown as import('pdfjs-dist/types/src/display/api').RenderParameters;
      
      await (page as unknown as { render: (p: typeof renderContext) => { promise: Promise<void> } }).render(renderContext).promise;
      const imageData = canvas.toDataURL();
      
      setPageImages(prev => ({
        ...prev,
        [pageNum]: imageData
      }));
      
    } catch (err) {
      console.error(`Error rendering page ${pageNum}:`, err);
    }
  };

  // Load page images when current page changes
  useEffect(() => {
    if (pdfDoc && currentPage) {
      renderPage(currentPage);
      // Pre-load next page
      if (currentPage < totalPages) {
        renderPage(currentPage + 1);
      }
      // Pre-load previous page
      if (currentPage > 1) {
        renderPage(currentPage - 1);
      }
    }
  }, [currentPage, pdfDoc, totalPages]);

  if (!pdfUrl) {
    return (
      <div className="text-center py-12 text-amber-600 bg-amber-50 rounded-lg border border-amber-200">
        <div className="text-4xl mb-3">📚</div>
        <div className="font-medium mb-2">Chưa có sách điện tử</div>
        <div className="text-sm text-amber-500">Vui lòng thêm file PDF trong trang quản trị</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-12 text-amber-600 bg-amber-50 rounded-lg border border-amber-200">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
        <div className="font-medium">Đang tải sách...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600 bg-red-50 rounded-lg border border-red-200">
        <div className="text-4xl mb-3">❌</div>
        <div className="font-medium mb-2">Lỗi tải sách</div>
        <div className="text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div 
      className="relative bg-gradient-to-br from-amber-50 via-amber-100 to-amber-200 rounded-xl overflow-hidden shadow-lg"
      ref={containerRef}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-amber-300/50 bg-gradient-to-r from-amber-100 to-amber-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 lotus-gradient rounded-full flex items-center justify-center">
              <span className="text-white text-sm">📖</span>
            </div>
            <div>
              <h3 className="font-semibold text-amber-900">{title}</h3>
              <p className="text-xs text-amber-700">Trang {currentPage} / {totalPages}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {isPlaying && (
              <div className="flex items-center gap-1 text-green-700 bg-green-100 px-2 py-1 rounded">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Đang đồng bộ
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Book Pages */}
      <div className="relative h-96 sm:h-[500px] overflow-hidden">
        {/* Left Page (Even pages) */}
        <div className={`absolute left-0 top-0 w-1/2 h-full bg-white border-r border-amber-200 transition-transform duration-300 origin-right ${
          isFlipping ? 'transform -rotate-y-180' : ''
        }`}>
          <div className="p-2 sm:p-4 h-full flex flex-col">
            <div className="text-xs text-amber-600 mb-2">Trang {Math.max(1, currentPage - 1)}</div>
            <div className="flex-1 bg-gradient-to-br from-amber-50 to-white rounded border border-amber-100 overflow-hidden">
              {pageImages[Math.max(1, currentPage - 1)] ? (
                <img 
                  src={pageImages[Math.max(1, currentPage - 1)]} 
                  alt={`Trang ${Math.max(1, currentPage - 1)}`}
                  className="w-full h-full object-contain"
                />
              ) : totalPages > 0 ? (
                <div className="w-full h-full flex items-center justify-center text-amber-600">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-2"></div>
                    <div className="text-xs">Đang tải trang...</div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-amber-600">
                  <div className="text-center p-4">
                    <div className="text-2xl mb-2">📄</div>
                    <div className="text-xs">Chờ file PDF được tải</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Page (Odd pages) */}
        <div className={`absolute right-0 top-0 w-1/2 h-full bg-white transition-transform duration-300 origin-left ${
          isFlipping ? 'transform rotate-y-180' : ''
        }`}>
          <div className="p-2 sm:p-4 h-full flex flex-col">
            <div className="text-xs text-amber-600 mb-2 text-right">Trang {currentPage}</div>
            <div className="flex-1 bg-gradient-to-br from-white to-amber-50 rounded border border-amber-100 overflow-hidden">
              {pageImages[currentPage] ? (
                <img 
                  src={pageImages[currentPage]} 
                  alt={`Trang ${currentPage}`}
                  className="w-full h-full object-contain"
                />
              ) : totalPages > 0 ? (
                <div className="w-full h-full flex items-center justify-center text-amber-600">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-2"></div>
                    <div className="text-xs">Đang tải trang...</div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-amber-600">
                  <div className="text-center p-4">
                    <div className="text-2xl mb-2">📄</div>
                    <div className="text-xs">Chờ file PDF được tải</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page Flip Effect Overlay */}
        {isFlipping && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-200/50 to-transparent animate-pulse"></div>
        )}
      </div>

      {/* Controls */}
      <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
          <button
            onClick={prevPage}
            disabled={currentPage <= 1 || isFlipping}
            className="p-2 rounded-full hover:bg-amber-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Trang trước"
          >
            <span className="text-amber-800">⬅️</span>
          </button>
          
          <div className="flex items-center gap-2 px-3">
            <input
              type="range"
              min="1"
              max={totalPages}
              value={currentPage}
              onChange={(e) => goToPage(parseInt(e.target.value))}
              className="w-20 accent-amber-600"
              disabled={isFlipping}
            />
            <span className="text-xs text-amber-800 font-medium min-w-[60px] text-center">
              {currentPage}/{totalPages}
            </span>
          </div>

          <button
            onClick={nextPage}
            disabled={currentPage >= totalPages || isFlipping}
            className="p-2 rounded-full hover:bg-amber-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Trang sau"
          >
            <span className="text-amber-800">➡️</span>
          </button>
        </div>
      </div>

      {/* Auto-sync indicator */}
      {isPlaying && (
        <div className="absolute top-4 right-4 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Tự động lật trang
        </div>
      )}
    </div>
  );
}
