'use client';

import { useState } from 'react';

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

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      // TODO: Implement feedback submission with JWT auth
      // const response = await fetch('/api/feedback', { ... });
      
      setSubmitStatus('success');
      setFormData({ message: '' });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmitStatus('error');
      setErrorMessage('Không thể gửi góp ý. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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

        {/* Success Message */}
        {submitStatus === 'success' && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-700">
              <span className="text-lg">✅</span>
              <span className="font-medium">Góp ý của bạn đã được gửi thành công. Cảm ơn bạn!</span>
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

          {/* Contact Info */}
          <div className="mt-8 pt-8 border-t border-amber-200">
            <h3 className="text-lg font-semibold wisdom-text mb-4">Thông tin liên hệ</h3>
            <div className="text-amber-700/80">
              <p>
                Email: <a href="mailto:kinhsachamthanh@gmail.com" className="text-amber-600 hover:text-amber-700 font-medium">kinhsachamthanh@gmail.com</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
