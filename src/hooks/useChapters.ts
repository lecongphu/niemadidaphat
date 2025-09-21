import { useState, useEffect } from 'react';
import { Chapter, ChapterWithProduct, ChapterCreateInput, ChapterUpdateInput } from '@/lib/types';
import { SupabaseService } from '@/lib/supabaseService';

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
        chapters = await SupabaseService.getChaptersByProductId(options.productId);
      } else {
        // TODO: Implement getAllChapters in SupabaseService if needed
        chapters = [];
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
      await SupabaseService.createChapter(chapterData);

      // Refresh chapters list
      await fetchChapters();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tạo chapter');
      throw err;
    }
  };

  const updateChapter = async (id: string, updateData: ChapterUpdateInput) => {
    try {
      await SupabaseService.updateChapter(id, updateData);

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
      await SupabaseService.deleteChapter(id);

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
