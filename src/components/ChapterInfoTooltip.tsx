"use client";

import { useState } from 'react';
import AudioPreview from './AudioPreview';

interface ChapterInfoTooltipProps {
  chapter: {
    id: string;
    title: string;
    audio_url?: string | null;
    duration_seconds?: number | null;
  };
  index: number;
  validationInfo?: {
    warnings: string[];
    recommendations: string[];
    formatInfo: {
      displayName: string;
      quality: string;
      browserSupport: string;
      recommendedFor: string[];
    };
  } | null;
  onDetectDuration: () => void;
  onDelete?: () => void;
  detectingChapter: number | null;
}

export default function ChapterInfoTooltip({
  chapter,
  index,
  validationInfo,
  onDetectDuration,
  // onDelete,
  detectingChapter
}: ChapterInfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 border border-blue-300"
        onClick={() => setIsOpen(!isOpen)}
        title="Nghe thử audio và xem thông tin chapter"
      >
        🎵 Nghe thử
      </button>
      
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Tooltip Content */}
          <div className="absolute top-full left-0 mt-1 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-4">
            <div className="space-y-3">
              {/* Chapter Basic Info */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">🎵 Chapter {index + 1} - Nghe thử</h4>
                <div className="space-y-1 text-sm">
                  <div><strong>Tên:</strong> {chapter.title || "Chưa đặt tên"}</div>
                  <div><strong>Audio URL:</strong> {chapter.audio_url ? "✅ Đã có" : "❌ Chưa có"}</div>
                  <div><strong>Thời lượng:</strong> {chapter.duration_seconds ? `${Math.floor(chapter.duration_seconds / 60)}:${(chapter.duration_seconds % 60).toString().padStart(2, '0')}` : "Chưa xác định"}</div>
                </div>
              </div>

              {/* Audio Preview */}
              {chapter.audio_url && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">🎵 Nghe thử</h5>
                  <AudioPreview 
                    audioUrl={chapter.audio_url}
                    title={chapter.title || `Tập ${index + 1}`}
                    className="text-sm"
                  />
                </div>
              )}

              {/* Format Validation Info */}
              {validationInfo && (
                <div className="space-y-2">
                  {validationInfo.formatInfo && (
                    <div className="text-xs bg-blue-50 border border-blue-200 rounded p-2">
                      <div className="font-medium text-blue-800 mb-1">
                        📁 Format: {validationInfo.formatInfo.displayName}
                      </div>
                      <div className="text-blue-700 space-y-1">
                        <div>• Quality: {validationInfo.formatInfo.quality}</div>
                        <div>• Browser support: {validationInfo.formatInfo.browserSupport}</div>
                        <div>• Best for: {validationInfo.formatInfo.recommendedFor.join(', ')}</div>
                      </div>
                    </div>
                  )}
                  
                  {validationInfo.warnings.length > 0 && (
                    <div className="text-xs bg-yellow-50 border border-yellow-200 rounded p-2">
                      <div className="font-medium text-yellow-800 mb-1">⚠️ Thông tin:</div>
                      {validationInfo.warnings.map((warning, i) => (
                        <div key={i} className="text-yellow-700">• {warning}</div>
                      ))}
                      <div className="text-yellow-700 mt-2 font-medium">
                        💡 File vẫn có thể upload được, chỉ là thông tin để bạn biết
                      </div>
                    </div>
                  )}
                  
                  {validationInfo.recommendations.length > 0 && (
                    <div className="text-xs bg-green-50 border border-green-200 rounded p-2">
                      <div className="font-medium text-green-800 mb-1">💡 Gợi ý:</div>
                      {validationInfo.recommendations.map((rec, i) => (
                        <div key={i} className="text-green-700">• {rec}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-gray-200">
                <button
                  type="button"
                  className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 border border-green-300"
                  disabled={!chapter.audio_url || detectingChapter === index}
                  onClick={() => {
                    onDetectDuration();
                    setIsOpen(false);
                  }}
                >
                  {detectingChapter === index ? '⏳ Đang tính...' : '⏱️ Tính thời lượng'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
