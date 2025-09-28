'use client';

import { useState } from 'react';
import { SupabaseAuth } from '@/lib/supabaseAuth';
import { supabase } from '@/lib/supabase';

export default function FeedbackPage() {
  const [formData, setFormData] = useState({
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.message.trim()) {
      setSubmitStatus('error');
      setErrorMessage('Vui lòng nhập nội dung góp ý');
      return;
    }

    if (formData.message.length < 10) {
      setSubmitStatus('error');
      setErrorMessage('Nội dung góp ý phải có ít nhất 10 ký tự');
      return;
    }

    if (formData.message.length > 5000) {
      setSubmitStatus('error');
      setErrorMessage('Nội dung góp ý không được vượt quá 5000 ký tự');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      // Get current user
      const { user } = await SupabaseAuth.getCurrentUser();
      
      // Create feedback document in Supabase
      const { error } = await supabase
        .from('feedback')
        .insert({
          message: formData.message.trim(),
          id: user?.id || null,
          user_type: user ? 'registered' : 'anonymous',
          status: 'pending',
          priority: 'medium',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw new Error(`Failed to submit feedback: ${error.message}`);
      }

      setSubmitStatus('success');
      setFormData({ message: '' });
      
      // Auto redirect to personal feedback page after 2 seconds
      setTimeout(() => {
        window.location.href = '/tai-khoan/gop-y';
      }, 2000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmitStatus('error');
      setErrorMessage('Không thể gửi góp ý. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-100">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="w-16 h-16 sm:w-20 sm:h-20 lotus-gradient rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <span className="text-white text-2xl sm:text-3xl">💬</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold wisdom-text mb-4">Góp ý</h1>
          <p className="text-amber-700/80 text-lg max-w-2xl mx-auto">
            Chúng tôi luôn lắng nghe và trân trọng mọi góp ý từ quý bạn đọc
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <div className="serene-card p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-semibold wisdom-text mb-4">Về trang web này</h2>
              <div className="space-y-4 text-amber-700/80">
                <p>
                  Chúng ta là những học trò của Tam Thánh Đường, thì trước là tự độ sau đó là độ tha. Nên hãy lan tỏa ánh sáng trí tuệ 
                  Phật pháp đến với mọi người thông qua nền tảng kinh sách âm thanh. Những kinh sách này được chia sẻ miễn phí và có thể nghe trên nhiều thiết bị khác nhau.
                </p>
                <p>
                  <strong className="wisdom-text">&ldquo;Hoan nghênh ấn tống, chia sẻ lưu thông để giáo truyền đại đạo của đức Thích Ca Mâu Ni từ phụ!&rdquo;</strong>
                </p>
                <p>
                  Mọi góp ý, phản hồi của bạn đều rất quý giá và sẽ giúp chúng tôi hoàn thiện hơn.
                </p>
              </div>
            </div>

            {/* Success Message */}
            {submitStatus === 'success' && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <span className="text-lg">✅</span>
                  <div>
                    <div className="font-medium">Góp ý của bạn đã được gửi thành công. Cảm ơn bạn!</div>
                    <div className="text-sm mt-1">
                      Đang chuyển đến trang &ldquo;Góp ý của tôi&rdquo; trong 2 giây...
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {submitStatus === 'error' && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-700">
                  <span className="text-lg">❌</span>
                  <span className="font-medium">{errorMessage}</span>
                </div>
              </div>
            )}

            {/* Feedback Form */}
            <div className="serene-card p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-semibold wisdom-text mb-6">Gửi góp ý</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="message" className="block text-sm font-medium wisdom-text mb-2">
                    Nội dung góp ý <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={8}
                    className="w-full px-4 py-3 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                    placeholder="Chia sẻ góp ý, đề xuất hoặc báo cáo lỗi với chúng tôi..."
                  />
                  <p className="text-xs text-amber-600/70 mt-1">
                    Tối thiểu 10 ký tự, tối đa 5000 ký tự
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full lotus-button py-3 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span>
                      <span>Đang gửi...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span>💬</span>
                      <span>Gửi góp ý</span>
                    </span>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="serene-card p-6">
              <h3 className="text-lg font-semibold wisdom-text mb-4">Thông tin liên hệ</h3>
              <div className="space-y-3 text-amber-700/80">
                <div className="flex items-center gap-3">
                  <span className="text-amber-500">📧</span>
                  <span>Email liên hệ</span>
                </div>
                <p className="text-amber-700/80">
                  Email: <a href="mailto:kinhsachamthanh@gmail.com" className="text-amber-600 hover:text-amber-700 font-medium">kinhsachamthanh@gmail.com</a>
                </p>
              </div>
            </div>

            {/* Tips */}
            <div className="serene-card p-6">
              <h3 className="text-lg font-semibold wisdom-text mb-4">💡 Gợi ý</h3>
              <div className="space-y-2 text-sm text-amber-700/80">
                <p>• Mô tả chi tiết về vấn đề bạn gặp phải</p>
                <p>• Đề xuất cải tiến cho website</p>
                <p>• Chia sẻ trải nghiệm sử dụng</p>
                <p>• Báo cáo lỗi kỹ thuật</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}