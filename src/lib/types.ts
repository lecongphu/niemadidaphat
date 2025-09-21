export type Chapter = {
  id: string;                    // UUID từ database
  product_id: string;            // ID của product chứa chapter này
  chapter_id: string;            // ID từ JSONB gốc (ví dụ: "chapter-1757354163121")
  title: string;                 // Tiêu đề chapter
  audio_url?: string | null;     // URL file audio cho tập này
  duration_seconds?: number | null; // Thời lượng tập này (giây)
  sort_order: number;            // Thứ tự sắp xếp trong product
  created_at?: string;           // Thời gian tạo
  updated_at?: string;           // Thời gian cập nhật
};

export type Product = {
  id: string;
  slug: string;
  title: string;
  author: string;
  translator?: string | null;     // Dịch kinh (người dịch từ Sanskrit/Pali)
  interpreter?: string | null;    // Chuyển ngữ (người chuyển từ Hán văn sang Việt)
  speaker?: string | null;        // Người giảng
  narrator?: string | null;       // Người đọc (giữ lại để backward compatibility)
  lecture_date?: string | null;    // Ngày giảng pháp thoại hoặc tụng kinh
  duration: string;               // Display format: "2h 30m 45s"
  duration_seconds?: number | null; // Storage format: total seconds
  description: string;
  cover_url?: string | null;      // Ảnh bìa sản phẩm
  pdf_url?: string | null;        // PDF file để đọc sách
  category?: string | null;       // 'nhan-qua' | 'gioi-luat' | 'niem-phat'
  followers_count?: number;       // Số người follow
  total_views?: number;           // Tổng lượt xem
  unique_views?: number;          // Lượt xem duy nhất
  avg_view_duration?: number;     // Thời gian xem trung bình (giây)
  last_viewed_at?: string | null; // Lần xem cuối cùng
  created_at?: string;
  updated_at?: string;
};

export type ProductCreateInput = Omit<Product, "id" | "created_at" | "updated_at">;
export type ProductUpdateInput = Partial<Omit<Product, "id" | "created_at" | "updated_at" | "slug">> & { slug?: string };

// Types cho chapters
export type ChapterCreateInput = Omit<Chapter, "id" | "created_at" | "updated_at">;
export type ChapterUpdateInput = Partial<Omit<Chapter, "id" | "product_id" | "created_at" | "updated_at">>;

// Type cho product với chapters (khi cần join)
export type ProductWithChapters = Product & {
  chapters: Chapter[];
};

// Type cho chapter với thông tin product (từ view)
export type ChapterWithProduct = Chapter & {
  product_title: string;
  product_slug: string;
  product_author: string;
  product_category: string;
};


