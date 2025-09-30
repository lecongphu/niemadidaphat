import { useState, useEffect } from 'react';
import { Chapter, ChapterWithProduct, ChapterCreateInput, ChapterUpdateInput } from '@/lib/types';
import { apiClient } from '@/lib/apiConfig';

interface UseChaptersOptions {
  productId?: string;
  includeProductInfo?: boolean;
}

interface UseChaptersReturn {
  chapters: Chapter[] | ChapterWithProduct[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  createChapter: (chapterData: ChapterCreateInput) => Promise<void>;
  updateChapter: (id: string, updateData: ChapterUpdateInput) => Promise<void>;
  deleteChapter: (id: string) => Promise<void>;
}

export function useChapters(options: UseChaptersOptions = {}): UseChaptersReturn {
  const [chapters, setChapters] = useState<Chapter[] | ChapterWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChapters = async () => {
    try {
      setLoading(true);
      setError(null);

      let chapters: Chapter[];
      
      if (options.productId) {
        chapters = await apiClient.get(`/chapters/product/${options.productId}`);
      } else {
        // Get all chapters
        chapters = await apiClient.get('/chapters');
      }

      setChapters(chapters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      console.error('Error fetching chapters:', err);
    } finally {
      setLoading(false);
    }
  };

  const createChapter = async (chapterData: ChapterCreateInput) => {
    try {
      await apiClient.post('/chapters', chapterData);

      // Refresh chapters list
      await fetchChapters();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tạo chapter');
      throw err;
    }
  };

  const updateChapter = async (id: string, updateData: ChapterUpdateInput) => {
    try {
      await apiClient.put(`/chapters/${id}`, updateData);

      // Update local state
      setChapters(prev => 
        prev.map(chapter => 
          chapter.id === id ? { ...chapter, ...updateData } : chapter
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi cập nhật chapter');
      throw err;
    }
  };

  const deleteChapter = async (id: string) => {
    try {
      await apiClient.delete(`/chapters/${id}`);

      // Remove from local state
      setChapters(prev => prev.filter(chapter => chapter.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi xóa chapter');
      throw err;
    }
  };

  useEffect(() => {
    fetchChapters();
  }, [options.productId, options.includeProductInfo]);

  return {
    chapters,
    loading,
    error,
    refetch: fetchChapters,
    createChapter,
    updateChapter,
    deleteChapter,
  };
}