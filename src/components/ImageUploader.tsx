"use client";

import { useState } from 'react';
import { optimizeImageForUpload, validateImageForCover } from '@/lib/imageOptimization';
import { supabase } from '@/lib/supabase';

interface ImageUploaderProps {
  onUploadComplete: (url: string) => void;
  onUploadStart?: () => void;
  currentUrl?: string;
  label?: string;
  category?: string;
  slug?: string;
  fileType?: string;
}

export default function ImageUploader({ 
  onUploadComplete, 
  onUploadStart,
  currentUrl,
  label = "Upload Image",
  category = "general",
  slug,
  fileType = "cover"
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [validationInfo, setValidationInfo] = useState<{
    warnings: string[];
    recommendations: string[];
  } | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('File quá lớn. Tối đa 10MB.');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Định dạng file không hỗ trợ. Chỉ chấp nhận JPG, PNG, WebP.');
      return;
    }

    // Validate image
    try {
      const validation = await validateImageForCover(file);
      setValidationInfo({
        warnings: validation.warnings,
        recommendations: validation.recommendations,
      });
    } catch (err) {
      console.warn('Validation failed:', err);
    }

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);
    onUploadStart?.();

    try {
      // Optimize image before upload
      setUploadProgress(20);
      const optimizedFile = await optimizeImageForUpload(file);
      
      setUploadProgress(40);
      
      // Upload file to Supabase Storage
      const fileName = `${category}/${slug || 'image'}/${fileType}-${Date.now()}-${optimizedFile.name}`;
      
      // Simulate progress updates for Supabase (since it doesn't have built-in progress tracking)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + Math.random() * 20, 90));
      }, 300);
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('images')
        .upload(fileName, optimizedFile, {
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
        .from('images')
        .getPublicUrl(fileName);

      const downloadURL = urlData.publicUrl;
      
      // Set progress to 100% after upload completes
      setUploadProgress(100);
      
      onUploadComplete(downloadURL);
      
      // Clean up preview URL
      URL.revokeObjectURL(previewUrl);
      
      // Reset form
      event.target.value = '';
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      // Revert preview on error
      setPreview(currentUrl || null);
      URL.revokeObjectURL(previewUrl);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onUploadComplete('');
  };

  return (
    <div className="space-y-3">
      {/* Upload Button */}
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded cursor-pointer hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
          <input
            type="file"
            accept="image/*,.jpg,.jpeg,.png,.webp"
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
            <span>🖼️</span>
          )}
        </label>
        
        {preview && (
          <button
            type="button"
            onClick={handleRemoveImage}
            className="px-2 py-2 text-red-600 hover:text-red-800 text-sm"
            title="Xóa ảnh"
          >
            🗑️
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {isUploading && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      {/* Image Preview */}
      {preview && (
        <div className="space-y-2">
          <div className="relative inline-block">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-32 h-40 object-cover rounded border shadow-sm"
              style={{ aspectRatio: '2/3' }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all rounded flex items-center justify-center">
              <span className="text-white opacity-0 hover:opacity-100 text-xs">Preview</span>
            </div>
          </div>
          
          <div className="text-xs text-gray-500">
            <div className="font-medium">Current cover:</div>
            <div className="break-all">{preview.split('/').pop()}</div>
          </div>
        </div>
      )}

      {/* Validation Info */}
      {validationInfo && (
        <div className="space-y-2">
          {validationInfo.warnings.length > 0 && (
            <div className="text-xs bg-yellow-50 border border-yellow-200 rounded p-2">
              <div className="font-medium text-yellow-800 mb-1">⚠️ Cảnh báo:</div>
              {validationInfo.warnings.map((warning, i) => (
                <div key={i} className="text-yellow-700">• {warning}</div>
              ))}
            </div>
          )}
          
          {validationInfo.recommendations.length > 0 && (
            <div className="text-xs bg-blue-50 border border-blue-200 rounded p-2">
              <div className="font-medium text-blue-800 mb-1">💡 Gợi ý:</div>
              {validationInfo.recommendations.map((rec, i) => (
                <div key={i} className="text-blue-700">• {rec}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upload Tips */}
      <div className="text-xs text-gray-500 space-y-1">
        <div>📋 <strong>Thông tin:</strong></div>
        <div>• Kích thước khuyến nghị: 400x600px (tỷ lệ 2:3)</div>
        <div>• Định dạng: JPG, PNG, WebP</div>
        <div>• Dung lượng tối đa: 10MB</div>
        <div>• Tự động tối ưu hóa trước khi upload</div>
        <div>• Lưu vào Supabase Storage: images/{category}/{slug}/{fileType}-timestamp.jpg</div>
      </div>
    </div>
  );
}
