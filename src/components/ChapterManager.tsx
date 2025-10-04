"use client";

import React, { useState } from 'react';
import { Chapter } from '@/lib/types';
import { useAdminChapters } from '@/hooks/useAdminChapters';
import AudioUploaderR2 from './AudioUploaderR2';
import ChapterInfoTooltip from './ChapterInfoTooltip';

interface ChapterManagerProps {
  productId: string;
  productTitle: string;
  productSlug: string;
}

interface EditingChapter {
  id: string;
  title: string;
  audio_url: string;
  duration_seconds: number;
}

const ChapterManager: React.FC<ChapterManagerProps> = ({
  productId,
  productTitle,
  productSlug
}) => {
  const {
    chapters,
    loading,
    error,
    updateChapter,
    saveChapter,
    deleteChapter
  } = useAdminChapters({ productId });

  const [editingChapter, setEditingChapter] = useState<EditingChapter | null>(null);
  const [calculatingDuration, setCalculatingDuration] = useState<string | null>(null);


  const handleEditChapter = (chapter: Chapter) => {
    setEditingChapter({
      id: chapter.id,
      title: chapter.title,
      audio_url: chapter.audio_url || '',
      duration_seconds: chapter.duration_seconds || 0
    });
  };

  const handleSaveEdit = async () => {
    if (!editingChapter) return;

    try {
      const chapterIndex = chapters.findIndex(ch => ch.id === editingChapter.id);
      if (chapterIndex === -1) return;

      await updateChapter(chapterIndex, {
        title: editingChapter.title,
        audio_url: editingChapter.audio_url,
        duration_seconds: editingChapter.duration_seconds
      });

      // Save to database
      const updatedChapter = chapters[chapterIndex];
      await saveChapter({
        ...updatedChapter,
        title: editingChapter.title,
        audio_url: editingChapter.audio_url,
        duration_seconds: editingChapter.duration_seconds
      });

      setEditingChapter(null);
    } catch (error) {
      console.error('Error saving chapter:', error);
      alert('Lỗi khi lưu chapter');
    }
  };

  const handleDeleteChapter = async (chapter: Chapter) => {
    if (!confirm(`Bạn có chắc muốn xóa chapter "${chapter.title}"?`)) {
      return;
    }

    try {
      await deleteChapter(chapter.id);
    } catch (error) {
      console.error('Error deleting chapter:', error);
      alert('Lỗi khi xóa chapter');
    }
  };

  const handleAudioUpload = async (url: string, filePath: string) => {
    if (editingChapter) {
      // Update audio URL first
      setEditingChapter({
        ...editingChapter,
        audio_url: url
      });

      // Auto-calculate duration
      setCalculatingDuration(editingChapter.id);
      
    }
  };



  if (loading) {
    return (
      <div className="space-y-4 border-t pt-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-4 border-t pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium">Quản lý Chapters (Các tập MP3)</h2>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-sm">
          {error}
        </div>
      )}
      
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="text-sm text-gray-600 mb-3">
          Sản phẩm: <span className="font-medium">{productTitle}</span> • 
          Tổng chapters: <span className="font-medium">{chapters.length}</span>
        </div>


        {/* Edit Chapter Form */}
        {editingChapter && (
          <div className="bg-white rounded border p-4 mb-4">
            <h3 className="font-medium mb-3">Chỉnh sửa Chapter</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên Chapter
                </label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  value={editingChapter.title}
                  onChange={(e) => setEditingChapter({
                    ...editingChapter,
                    title: e.target.value
                  })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Audio URL
                </label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 mb-2"
                  placeholder="URL audio file..."
                  value={editingChapter.audio_url}
                  onChange={(e) => setEditingChapter({
                    ...editingChapter,
                    audio_url: e.target.value
                  })}
                />
                <AudioUploaderR2
                  onUploadSuccess={handleAudioUpload}
                  label="Upload Audio File"
                  slug={productSlug}
                />
                
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thời lượng (giây)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    className="flex-1 border rounded px-3 py-2"
                    value={editingChapter.duration_seconds}
                    onChange={(e) => setEditingChapter({
                      ...editingChapter,
                      duration_seconds: parseInt(e.target.value) || 0
                    })}
                  />
                  {editingChapter.audio_url && (
                    <button
                      type="button"
                      className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
                      onClick={() => {
                        const currentChapter = chapters.find(c => c.id === editingChapter.id);
                       
                      }}
                      disabled={calculatingDuration === editingChapter.id}
                    >
                      {calculatingDuration === editingChapter.id ? '⏳' : '🔄'} Tự động
                    </button>
                  )}
                </div>
                {calculatingDuration === editingChapter.id && (
                  <div className="text-sm text-blue-600 mt-1">
                    ⏳ Đang tính toán duration từ audio file...
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  onClick={handleSaveEdit}
                >
                  Lưu
                </button>
                <button
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                  onClick={() => setEditingChapter(null)}
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}
        
        {chapters.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🎵</div>
            <p>Chưa có chapter nào</p>
            <p className="text-sm">Thêm chapter đầu tiên để bắt đầu</p>
          </div>
        ) : (
          <div className="space-y-3">
            {chapters.map((chapter, index) => (
              <div key={chapter.id} className="bg-white rounded border p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{chapter.title}</div>
                    <div className="text-sm text-gray-600">
                      {chapter.audio_url ? (
                        <span className="text-green-600">✓ Có audio</span>
                      ) : (
                        <span className="text-red-600">⚠ Chưa có audio</span>
                      )}
                      {chapter.duration_seconds && chapter.duration_seconds > 0 && (
                        <span className="ml-2">
                          • {Math.floor(chapter.duration_seconds / 60)}:{String(chapter.duration_seconds % 60).padStart(2, '0')}
                        </span>
                      )}
                      <span className="ml-2 text-gray-400">
                        • Thứ tự: {chapter.sort_order}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChapterInfoTooltip
                      chapter={chapter}
                      index={index}
                      onDetectDuration={() => 0}
                      detectingChapter={calculatingDuration === chapter.id ? index : null}
                    />
                    <button 
                      className="px-2 py-1 text-xs rounded border hover:bg-gray-50"
                      onClick={() => handleEditChapter(chapter)}
                    >
                      Sửa
                    </button>
                    <button 
                      className="px-2 py-1 text-xs rounded border border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteChapter(chapter)}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ChapterManager;
