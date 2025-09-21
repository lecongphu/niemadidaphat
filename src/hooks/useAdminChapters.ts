import { useState, useEffect } from 'react';
import { Chapter } from '@/lib/types';
import { SupabaseService } from '@/lib/supabaseService';

interface UseAdminChaptersOptions {
  productId?: string;
}

interface UseAdminChaptersReturn {
  chapters: Chapter[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  addChapter: (chapter: Omit<Chapter, 'id' | 'created_at' | 'updated_at'>) => void;
  updateChapter: (index: number, chapter: Partial<Chapter>) => void;
  removeChapter: (index: number) => void;
  reorderChapters: (fromIndex: number, toIndex: number) => void;
  saveChapter: (chapter: Chapter) => Promise<void>;
  deleteChapter: (chapterId: string) => Promise<void>;
}

export function useAdminChapters(options: UseAdminChaptersOptions = {}): UseAdminChaptersReturn {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChapters = async () => {
    if (!options.productId) {
      setChapters([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Query chapters from Supabase
      const chapters = await SupabaseService.getChaptersByProductId(options.productId);

      setChapters(chapters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      console.error('Error fetching chapters:', err);
    } finally {
      setLoading(false);
    }
  };

  const addChapter = (chapter: Omit<Chapter, 'id' | 'created_at' | 'updated_at'>) => {
    const newChapter: Chapter = {
      ...chapter,
      id: `temp-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setChapters(prev => [...prev, newChapter]);
  };

  const updateChapter = (index: number, chapter: Partial<Chapter>) => {
    setChapters(prev => 
      prev.map((ch, i) => 
        i === index ? { ...ch, ...chapter } : ch
      )
    );
  };

  const removeChapter = (index: number) => {
    setChapters(prev => prev.filter((_, i) => i !== index));
  };

  const reorderChapters = (fromIndex: number, toIndex: number) => {
    setChapters(prev => {
      const newChapters = [...prev];
      const [removed] = newChapters.splice(fromIndex, 1);
      newChapters.splice(toIndex, 0, removed);
      
      // Update sort_order for all chapters
      return newChapters.map((chapter, index) => ({
        ...chapter,
        sort_order: index + 1
      }));
    });
  };

  // Save chapter to Supabase (create or update)
  const saveChapter = async (chapter: Chapter) => {
    try {
      if (chapter.id.startsWith('temp-')) {
        // Create new chapter
        const { id, created_at, updated_at, ...chapterData } = chapter;
        const newChapter = await SupabaseService.createChapter({
          ...chapterData,
          product_id: options.productId!
        });
        
        // Update local state with real ID
        setChapters(prev => 
          prev.map(ch => ch.id === chapter.id ? newChapter : ch)
        );
      } else {
        // Update existing chapter
        const { created_at, updated_at, ...chapterData } = chapter;
        await SupabaseService.updateChapter(chapter.id, chapterData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi lưu chapter');
      throw err;
    }
  };

  // Delete chapter from Supabase
  const deleteChapter = async (chapterId: string) => {
    try {
      if (!chapterId.startsWith('temp-')) {
        await SupabaseService.deleteChapter(chapterId);
      }
      
      // Remove from local state
      setChapters(prev => prev.filter(ch => ch.id !== chapterId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi xóa chapter');
      throw err;
    }
  };

  useEffect(() => {
    fetchChapters();
  }, [options.productId]);

  return {
    chapters,
    loading,
    error,
    refetch: fetchChapters,
    addChapter,
    updateChapter,
    removeChapter,
    reorderChapters,
    saveChapter,
    deleteChapter,
  };
}
