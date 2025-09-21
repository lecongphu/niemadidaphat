"use client";

import React, { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SupabaseAuth } from "@/lib/supabaseAuth";
import { SupabaseService } from "@/lib/supabaseService";
import type { Product, ProductCreateInput, ProductUpdateInput } from "@/lib/types";
import ImageUploader from "@/components/ImageUploader";
import PDFUploader from "@/components/PDFUploader";
import DurationInput from "@/components/DurationInput";
import AdminAnalytics from "@/components/AdminAnalytics";
import FeedbackManager from "@/components/FeedbackManager";
import UserManagement from "@/components/UserManagement";
import { vietnameseToSlug } from "@/lib/slugUtils";
import { useAdminChapters } from "@/hooks/useAdminChapters";
import { getCurrentUserWithRoles, isAdmin, hasPermission, type UserWithRoles } from "@/lib/authUtils";

// Type definitions - sử dụng types từ @/lib/types

// Removed unused interface

// Helper functions for Supabase operations
async function listProductsPaged({ page, pageSize, search }: { page: number; pageSize: number; search: string }) {
  let allProducts: Product[];
  
  if (search) {
    // Use Supabase search functionality
    allProducts = await SupabaseService.searchProducts(search);
  } else {
    // Get all products
    allProducts = await SupabaseService.getProducts();
  }
  
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const items = allProducts.slice(startIndex, endIndex);
  
  return { items, total: allProducts.length };
}

async function createProduct(productData: ProductCreateInput) {
  return await SupabaseService.createProduct(productData);
}

async function updateProduct(id: string, updateData: ProductUpdateInput) {
  return await SupabaseService.updateProduct(id, updateData);
}

const emptyForm = {
  title: "",
  slug: "",
  author: "",
  translator: "",
  interpreter: "",
  speaker: "",
  narrator: "",
  lecture_date: "",
  duration: "",
  duration_seconds: 0,
  description: "",
  cover_url: "",
  pdf_url: "",
  category: "",
};

function AdminPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState<string | null>(null);
  const [userRoles, setUserRoles] = useState<string[] | null>(null);
  const [userWithRoles, setUserWithRoles] = useState<UserWithRoles | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'analytics' | 'feedback' | 'users'>('products');
  const [permissions, setPermissions] = useState<{
    analytics: boolean;
    feedback: boolean;
    users: boolean;
  }>({
    analytics: false,
    feedback: false,
    users: false
  });
  const [loadingList, setLoadingList] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState<string | null>(null);
  const adminEmail = useMemo(() => process.env.NEXT_PUBLIC_ADMIN_EMAIL || "", []);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [total, setTotal] = useState(0);

  // Hook để quản lý chapters
  const {
    chapters
  } = useAdminChapters({ productId: editingId || undefined });

  useEffect(() => {
    const init = async () => {
      // Check auth state
      const { user } = await SupabaseAuth.getCurrentUser();
      if (!user) {
        router.push("/");
        return;
      }
      
      setEmail(user.email ?? null);
    
      // Load user roles and permissions
      const userWithRolesData = await getCurrentUserWithRoles();
      if (userWithRolesData) {
        setUserRoles(userWithRolesData.roles.map(role => role.display_name));
        setUserWithRoles(userWithRolesData);
        
        // Check if user has admin access
        const hasAdminAccess = await isAdmin();
        if (!hasAdminAccess) {
          router.push("/");
          return;
        }

        // Check specific permissions
        const [analytics, feedback, users] = await Promise.all([
          hasPermission('analytics.read'),
          hasPermission('feedback.read'),
          hasPermission('users.read')
        ]);

        setPermissions({
          analytics,
          feedback,
          users
        });
      } else {
        router.push("/");
        return;
      }
      
      setLoading(false);
      setLoadingList(true);
      const res = await listProductsPaged({ page: 1, pageSize, search: "" });
      setProducts(res.items);
      setTotal(res.total);
      setPage(1);
      setLoadingList(false);

      // Listen for auth state changes
      const { data: { subscription } } = SupabaseAuth.onAuthStateChange(async (event, session) => {
        if (!session?.user) {
          router.push("/");
          return;
        }
      });
      
      // Cleanup function
      return () => subscription?.unsubscribe();
    };
    void init();
  }, [router]);

  async function fetchList(nextPage: number, q: string) {
    setLoadingList(true);
    const res = await listProductsPaged({ page: nextPage, pageSize, search: q });
    setProducts(res.items);
    setTotal(res.total);
    setPage(nextPage);
    setLoadingList(false);
  }

  if (loading) return <p className="text-gray-600">Đang tải...</p>;
  if (!email || (adminEmail && email !== adminEmail)) {
    return <p className="text-red-700">Bạn không có quyền truy cập trang quản trị.</p>;
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Bắt buộc";
    if (!form.slug.trim()) e.slug = "Bắt buộc";
    if (form.slug && !/^[a-z0-9-]+$/.test(form.slug)) e.slug = "Chỉ chữ thường, số, dấu gạch ngang";
    if (!form.author.trim()) e.author = "Bắt buộc";
    if (!form.duration.trim()) e.duration = "Bắt buộc";
    if (!form.description.trim()) e.description = "Bắt buộc";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    
    try {
      if (editingId) {
        // Cập nhật product
        const updated = await updateProduct(editingId, {
          title: form.title,
          slug: form.slug,
          author: form.author,
          translator: form.translator || null,
          interpreter: form.interpreter || null,
          speaker: form.speaker || null,
          narrator: form.narrator || null,
          lecture_date: form.lecture_date || null,
          duration: form.duration,
          duration_seconds: form.duration_seconds || null,
          description: form.description,
          cover_url: form.cover_url || null,
          pdf_url: form.pdf_url || null,
          category: form.category || null,
        });
        
        setProducts((prev) => prev.map((p) => (p.id === editingId ? updated : p)));
        setEditingId(null);
        setForm({ ...emptyForm });
        router.replace('/admin');
        
        alert('✅ Đã lưu sản phẩm thành công!');
      } else {
        // Tạo product mới
        const created = await createProduct({
          title: form.title,
          slug: form.slug,
          author: form.author,
          translator: form.translator || null,
          interpreter: form.interpreter || null,
          speaker: form.speaker || null,
          narrator: form.narrator || null,
          lecture_date: form.lecture_date || null,
          duration: form.duration,
          duration_seconds: form.duration_seconds || null,
          description: form.description,
          cover_url: form.cover_url || null,
          pdf_url: form.pdf_url || null,
          category: form.category || null,
        });
        
        setProducts((prev) => [created, ...prev]);
        setForm({ ...emptyForm });
        
        alert('✅ Đã tạo sản phẩm thành công!');
      }
    } catch (error) {
      console.error('Lỗi lưu:', error);
      alert(`❌ Lỗi lưu: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  function startEdit(p: Product) {
    setEditingId(p.id);
    const productForm = {
      title: p.title,
      slug: p.slug,
      author: p.author,
      translator: p.translator || "",
      interpreter: p.interpreter || "",
      speaker: p.speaker || "",
      narrator: p.narrator || "",
      lecture_date: p.lecture_date || "",
      duration: p.duration,
      duration_seconds: p.duration_seconds || 0,
      description: p.description,
      cover_url: p.cover_url || "",
      pdf_url: p.pdf_url || "",
      category: p.category || "",
    };
    setForm(productForm);
  }

  async function remove(id: string) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    if (!confirm(`Bạn có chắc muốn xóa "${product.title}"?`)) {
      return;
    }

    try {
      // Xóa product từ Supabase (sẽ cascade delete chapters nếu có foreign key constraint)
      await SupabaseService.deleteProduct(id);
      
      // Cập nhật UI
      setProducts((prev) => prev.filter((p) => p.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setForm({ ...emptyForm });
      }

      alert(`✅ Đã xóa sản phẩm và tất cả chapters liên quan thành công!`);
    } catch (error) {
      console.error('Lỗi xóa sản phẩm:', error);
      alert(`❌ Lỗi xóa sản phẩm: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="bg-gradient-to-br from-amber-50 via-amber-100 to-amber-200 rounded-xl p-6 serene-card">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold wisdom-text">Admin Dashboard</h1>
          <div className="text-sm text-amber-700">
            👋 Xin chào, {email}
            {userRoles && (
              <div className="mt-1">
                <span className="text-xs text-amber-600">
                  Vai trò: {userRoles.join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'products'
                ? 'lotus-gradient text-white shadow-lg'
                : 'bg-amber-200/50 text-amber-800 hover:bg-amber-300/50'
            }`}
          >
            🎵 Quản lý sản phẩm
          </button>
          {permissions.analytics && (
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'analytics'
                  ? 'lotus-gradient text-white shadow-lg'
                  : 'bg-amber-200/50 text-amber-800 hover:bg-amber-300/50'
              }`}
            >
              📊 Thống kê Analytics
            </button>
          )}
          {permissions.feedback && (
            <button
              onClick={() => setActiveTab('feedback')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'feedback'
                  ? 'lotus-gradient text-white shadow-lg'
                  : 'bg-amber-200/50 text-amber-800 hover:bg-amber-300/50'
              }`}
            >
              💬 Quản lý Góp ý
            </button>
          )}
          {permissions.users && (
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'users'
                  ? 'lotus-gradient text-white shadow-lg'
                  : 'bg-amber-200/50 text-amber-800 hover:bg-amber-300/50'
              }`}
            >
              👥 Quản lý Người dùng
            </button>
          )}
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 gap-8">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-medium">Thêm/Sửa ấn phẩm</h2>
              {editingId && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                    📝 Đang chỉnh sửa
                  </span>
                </div>
              )}
            </div>
        
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề *</label>
                <input 
                  className="border rounded px-3 py-2 w-full" 
                  placeholder="Ví dụ: Kinh Pháp Hoa - Phẩm Phương Tiện" 
                  value={form.title} 
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    setForm({ 
                      ...form, 
                      title: newTitle,
                      slug: !form.slug || form.slug === vietnameseToSlug(form.title) 
                        ? vietnameseToSlug(newTitle) 
                        : form.slug
                    });
                  }} 
                />
                {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL) *</label>
                <div className="flex">
                  <input 
                    className="border rounded-l px-3 py-2 w-full" 
                    placeholder="kinh-phap-hoa-pham-phuong-tien" 
                    value={form.slug} 
                    onChange={(e) => setForm({ ...form, slug: e.target.value })} 
                  />
                  <button
                    type="button"
                    className="border border-l-0 rounded-r px-2 py-2 bg-gray-50 hover:bg-gray-100 text-sm"
                    onClick={() => setForm({ ...form, slug: vietnameseToSlug(form.title) })}
                    title="Tạo slug từ tiêu đề"
                  >
                    🔄
                  </button>
                </div>
                {errors.slug && <p className="text-xs text-red-600 mt-1">{errors.slug}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tác giả *</label>
                <input 
                  className="border rounded px-3 py-2 w-full" 
                  placeholder="Ví dụ: Thích Ca Mâu Ni Phật" 
                  value={form.author} 
                  onChange={(e) => setForm({ ...form, author: e.target.value })} 
                />
                {errors.author && <p className="text-xs text-red-600 mt-1">{errors.author}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dịch kinh</label>
                <input 
                  className="border rounded px-3 py-2 w-full" 
                  placeholder="Ví dụ: Huyền Trang Tam Tạng" 
                  value={form.translator} 
                  onChange={(e) => setForm({ ...form, translator: e.target.value })} 
                />
                <div className="text-xs text-gray-500 mt-1">Người dịch từ Sanskrit/Pali sang Hán văn</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chuyển ngữ</label>
                <input 
                  className="border rounded px-3 py-2 w-full" 
                  placeholder="Ví dụ: Vọng Tây cư sĩ" 
                  value={form.interpreter} 
                  onChange={(e) => setForm({ ...form, interpreter: e.target.value })} 
                />
                <div className="text-xs text-gray-500 mt-1">Người chuyển từ Hán văn sang Việt ngữ</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Người giảng</label>
                <input 
                  className="border rounded px-3 py-2 w-full" 
                  placeholder="Ví dụ: Pháp sư Tịnh Không" 
                  value={form.speaker} 
                  onChange={(e) => setForm({ ...form, speaker: e.target.value })} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Người đọc</label>
                <input 
                  className="border rounded px-3 py-2 w-full" 
                  placeholder="Ví dụ: Huy Hồ" 
                  value={form.narrator} 
                  onChange={(e) => setForm({ ...form, narrator: e.target.value })} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày giảng</label>
                <input 
                  type="date"
                  className="border rounded px-3 py-2 w-full" 
                  value={form.lecture_date || ""} 
                  onChange={(e) => setForm({ ...form, lecture_date: e.target.value })} 
                />
                <div className="text-xs text-gray-500 mt-1">Ngày giảng pháp thoại hoặc tụng kinh</div>
              </div>
              <div>
                <DurationInput
                  value={form.duration}
                  onChange={(duration, seconds) => setForm({ 
                    ...form, 
                    duration, 
                    duration_seconds: seconds 
                  })}
                  chapterAudioUrls={chapters.map(ch => ch.audio_url || '').filter(url => url)}
                  placeholder="Ví dụ: 2h 30m, 90m, 1:30:45"
                />
                {errors.duration && <p className="text-xs text-red-600 mt-1">{errors.duration}</p>}
              </div>
              <div>
                <select className="border rounded px-3 py-2 w-full" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option value="">-- Chọn danh mục --</option>
                  <option value="nhan-qua">Nhân Quả</option>
                  <option value="gioi-luat">Giới Luật</option>
                  <option value="niem-phat">Niệm Phật</option>
                </select>
                {errors.category && <p className="text-xs text-red-600 mt-1">{errors.category}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả (hỗ trợ markdown) *
                </label>
                <textarea 
                  className="border rounded px-3 py-2 w-full h-32 resize-y text-sm leading-relaxed whitespace-pre-wrap"
                  placeholder="📖 Mô tả chi tiết về sản phẩm..."
                  value={form.description} 
                  onChange={(e) => setForm({ ...form, description: e.target.value })} 
                  style={{ lineHeight: '1.6' }}
                />
                {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Image (Ảnh bìa)
                </label>
                <div className="space-y-2">
                  <input 
                    className="border rounded px-3 py-2 w-full" 
                    placeholder="Cover URL (hoặc upload ảnh)" 
                    value={form.cover_url} 
                    onChange={(e) => setForm({ ...form, cover_url: e.target.value })} 
                  />
                  <ImageUploader
                    label="Upload Cover"
                    currentUrl={form.cover_url}
                    category={form.category || 'general'}
                    slug={form.slug || vietnameseToSlug(form.title)}
                    onUploadComplete={(url) => setForm({ ...form, cover_url: url })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PDF Sách Điện Tử
                </label>
                <div className="space-y-2">
                  <input 
                    className="border rounded px-3 py-2 w-full" 
                    placeholder="PDF URL (hoặc upload file)" 
                    value={form.pdf_url} 
                    onChange={(e) => setForm({ ...form, pdf_url: e.target.value })} 
                  />
                  <PDFUploader
                    label="Upload PDF"
                    currentUrl={form.pdf_url}
                    slug={form.slug || vietnameseToSlug(form.title)}
                    onUploadComplete={(url) => setForm({ ...form, pdf_url: url })}
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="flex items-center gap-3">
            <button className="px-4 py-2 rounded bg-black text-white" onClick={handleSave}>
              {editingId ? "Lưu thay đổi" : "Thêm ấn phẩm"}
            </button>
            {editingId && (
              <button 
                className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50 text-sm"
                onClick={() => {
                  if (confirm("Bạn có chắc muốn tạo sản phẩm mới? Thay đổi hiện tại sẽ bị mất.")) {
                    setEditingId(null);
                    setForm({ ...emptyForm });
                    router.replace('/admin');
                  }
                }}
              >
                ➕ Thêm mới
              </button>
            )}
            {editingId && (
              <button 
                className="px-4 py-2 rounded border hover:bg-gray-50" 
                onClick={() => {
                  const hasChanges = form.title !== "" || form.author !== "" || form.description !== "";
                  if (hasChanges) {
                    if (confirm("Bạn có thay đổi chưa lưu. Bạn có chắc muốn hủy?")) {
                      setEditingId(null);
                      setForm({ ...emptyForm });
                      router.replace('/admin');
                    }
                  } else {
                    setEditingId(null);
                    setForm({ ...emptyForm });
                    router.replace('/admin');
                  }
                }}
              >
                Hủy
              </button>
            )}
          </div>

          <section className="space-y-4">
            <h2 className="text-xl font-medium">Danh sách ấn phẩm</h2>
            <div className="flex items-center gap-3">
              <input
                className="border rounded px-3 py-2 w-full md:w-80"
                placeholder="Tìm theo tiêu đề/slug/tác giả"
                value={search}
                onChange={(e) => {
                  const v = e.target.value;
                  setSearch(v);
                  void fetchList(1, v);
                }}
              />
            </div>
            <div className="text-sm text-gray-600">Tổng: {total} · Trang {page} / {Math.max(1, Math.ceil(total / pageSize))}</div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 rounded border" disabled={page <= 1 || loadingList} onClick={() => fetchList(page - 1, search)}>Trang trước</button>
              <button className="px-3 py-1.5 rounded border" disabled={page >= Math.ceil(total / pageSize) || loadingList} onClick={() => fetchList(page + 1, search)}>Trang sau</button>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {products.map((p) => (
                <div key={p.id} className="border rounded p-3 flex items-center justify-between">
                  <div className="text-sm">
                    <div className="font-medium">{p.title}</div>
                    <div className="text-gray-600">{p.slug} · {p.author}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 rounded border" onClick={() => startEdit(p)}>Sửa</button>
                    <button className="px-3 py-1.5 rounded border" onClick={() => remove(p.id)}>Xóa</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <AdminAnalytics />
      )}
      
      {activeTab === 'feedback' && (
        <FeedbackManager />
      )}

      {activeTab === 'users' && (
        <UserManagement />
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải trang quản trị...</p>
        </div>
      </div>
    }>
      <AdminPageContent />
    </Suspense>
  );
}