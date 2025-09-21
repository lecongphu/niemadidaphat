"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface PDFUploaderProps {
  onUploadComplete: (url: string) => void;
  onUploadStart?: () => void;
  currentUrl?: string;
  label?: string;
  slug?: string;
}

export default function PDFUploader({ 
  onUploadComplete, 
  onUploadStart,
  currentUrl,
  label = "Upload PDF",
  slug
}: PDFUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 100MB for PDFs)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      setError('File quá lớn. Tối đa 100MB.');
      return;
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      setError('Chỉ chấp nhận file PDF.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);
    onUploadStart?.();

    try {
      // Upload file to Supabase Storage
      const fileName = `${slug || 'pdf'}/${Date.now()}-${file.name}`;
      
      // Simulate progress updates for Supabase (since it doesn't have built-in progress tracking)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + Math.random() * 20, 90));
      }, 500);
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('pdfs')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      // Clear progress interval
      clearInterval(progressInterval);

      if (error) {
        throw new Error(error.message);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('pdfs')
        .getPublicUrl(fileName);

      const downloadURL = urlData.publicUrl;
      
      // Set progress to 100% after upload completes
      setUploadProgress(100);
      
      onUploadComplete(downloadURL);
      
      // Reset form
      event.target.value = '';
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded cursor-pointer hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
          />
          <span className="text-sm">
            {isUploading ? 'Đang tải...' : label}
          </span>
          {isUploading ? (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          ) : (
            <span>📄</span>
          )}
        </label>
        
        {currentUrl && (
          <div className="text-xs text-green-600 flex items-center gap-1">
            <span>✓</span>
            <span>Đã có file</span>
          </div>
        )}
      </div>

      {isUploading && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}

      {error && (
        <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      {currentUrl && (
        <div className="text-xs text-gray-500">
          <span className="font-medium">Current:</span>{' '}
          <span className="break-all">{currentUrl.split('/').pop()}</span>
        </div>
      )}

      {/* Upload Tips */}
      <div className="text-xs text-gray-500 space-y-1">
        <div>📋 <strong>Thông tin:</strong></div>
        <div>• Định dạng: PDF</div>
        <div>• Dung lượng tối đa: 100MB</div>
        <div>• Lưu vào Supabase Storage: pdfs/{slug}/timestamp_filename.pdf</div>
      </div>
    </div>
  );
}