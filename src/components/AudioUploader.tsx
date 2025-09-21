"use client";

import { useState } from 'react';
import { validateAudioFile, AudioFormatInfo } from '@/lib/audioFormatUtils';
import { getAudioDuration } from '@/lib/durationUtils';
import { supabase } from '@/lib/supabase';

interface AudioUploaderProps {
  onUploadComplete: (url: string, durationSeconds?: number) => void;
  onUploadStart?: () => void;
  onUploadSuccess?: (url: string, durationSeconds?: number) => void;
  onValidationInfo?: (info: {
    warnings: string[];
    recommendations: string[];
    formatInfo: AudioFormatInfo;
  } | null) => void;
  currentUrl?: string | null;
  label?: string;
  slug?: string;
  chapterNumber?: number;
  multiple?: boolean;
  onMultipleUploadComplete?: (results: Array<{url: string, durationSeconds?: number, fileName: string}>) => void;
}

export default function AudioUploader({ 
  onUploadComplete, 
  onUploadStart,
  onUploadSuccess,
  onValidationInfo,
  currentUrl,
  label = "Upload Audio",
  slug,
  chapterNumber,
  multiple = false,
  onMultipleUploadComplete
}: AudioUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<Array<{
    fileName: string;
    progress: number;
    status: 'uploading' | 'completed' | 'error';
    error?: string;
  }>>([]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (multiple && files.length > 1) {
      await handleMultipleFileUpload(files);
    } else {
      const file = files[0];
      await handleSingleFileUpload(file, event);
    }
  };

  const handleMultipleFileUpload = async (files: FileList) => {
    const fileArray = Array.from(files);
    
    // Initialize upload tracking
    const initialFiles = fileArray.map(file => ({
      fileName: file.name,
      progress: 0,
      status: 'uploading' as const
    }));
    setUploadingFiles(initialFiles);
    setIsUploading(true);
    setError(null);
    onUploadStart?.();


    // Upload files in parallel
    const uploadPromises = fileArray.map(async (file, index) => {
      try {
        // Validate file size (max 500MB for audio)
        const maxSize = 500 * 1024 * 1024; // 500MB
        if (file.size > maxSize) {
          const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
          throw new Error(`File ${file.name} quá lớn (${fileSizeMB}MB). Giới hạn tối đa: 500MB.`);
        }

        // Validate audio file
        const validation = validateAudioFile(file);
        if (!validation.isValid) {
          const criticalErrors = validation.warnings.filter(warning => 
            warning.includes('không được hỗ trợ') || 
            warning.includes('không được hỗ trợ đầy đủ')
          );
          
          if (criticalErrors.length > 0) {
            throw new Error(`File ${file.name}: ${criticalErrors.join('. ')}`);
          }
        }

        // Upload file to Supabase Storage
        const fileName = `${slug || 'audio'}/${chapterNumber !== undefined ? `chapter-${chapterNumber + index}` : 'audio'}-${Date.now()}-${file.name}`;
        
        // Simulate progress updates for Supabase (since it doesn't have built-in progress tracking)
        const progressInterval = setInterval(() => {
          setUploadingFiles(prev => prev.map((f, i) => 
            i === index && f.status === 'uploading' ? { 
              ...f, 
              progress: Math.min(f.progress + Math.random() * 30, 90) 
            } : f
          ));
        }, 500);
        
        // Upload to Supabase Storage
        const { error } = await supabase.storage
          .from('audio')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        // Clear progress interval
        clearInterval(progressInterval);

        if (error) {
          throw new Error(`File ${file.name}: ${error.message}`);
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('audio')
          .getPublicUrl(fileName);

        const downloadURL = urlData.publicUrl;
        
        const result = { url: downloadURL };
        
        // Try to get audio duration with cache busting
        let durationSeconds: number | undefined;
        try {
          durationSeconds = await getAudioDuration(result.url, {
            useCacheBusting: true,
            timeout: 10000,
            retries: 2
          });
          
          if (durationSeconds === 0) {
            console.warn(`Could not detect duration for ${file.name} - may be due to CDN caching or format issues`);
          }
        } catch (durationError) {
          console.warn(`Duration detection failed for ${file.name}:`, durationError);
          // Don't fail the upload if duration detection fails
        }

        // Update progress to completed
        setUploadingFiles(prev => prev.map((f, i) => 
          i === index ? { ...f, progress: 100, status: 'completed' } : f
        ));

        return {
          url: result.url,
          durationSeconds,
          fileName: file.name
        };

      } catch (error) {
        // Update progress to error
        setUploadingFiles(prev => prev.map((f, i) => 
          i === index ? { 
            ...f, 
            progress: 0, 
            status: 'error', 
            error: error instanceof Error ? error.message : 'Upload failed' 
          } : f
        ));
        
        console.error(`Upload failed for ${file.name}:`, error);
        return null;
      }
    });

    // Wait for all uploads to complete
    const uploadResults = await Promise.all(uploadPromises);
    const successfulResults = uploadResults.filter(result => result !== null) as Array<{url: string, durationSeconds?: number, fileName: string}>;

    setIsUploading(false);
    
    if (successfulResults.length > 0) {
      onMultipleUploadComplete?.(successfulResults);
    }

    if (successfulResults.length < fileArray.length) {
      setError(`${successfulResults.length}/${fileArray.length} files uploaded successfully`);
    }
  };

  const handleSingleFileUpload = async (file: File, event?: React.ChangeEvent<HTMLInputElement>) => {
    // Validate file size (max 500MB for audio)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setError(`File quá lớn (${fileSizeMB}MB). Giới hạn tối đa: 500MB. Vui lòng nén file hoặc chia nhỏ hơn.`);
      return;
    }

    // Validate audio file with detailed format checking
    const validation = validateAudioFile(file);
    if (validation.formatInfo) {
      const info = {
        warnings: validation.warnings,
        recommendations: validation.recommendations,
        formatInfo: validation.formatInfo,
      };
      onValidationInfo?.(info);
    } else {
      onValidationInfo?.(null);
    }
    
    if (!validation.isValid) {
      // Only block for critical errors, show warnings as info
      const criticalErrors = validation.warnings.filter(warning => 
        warning.includes('không được hỗ trợ') || 
        warning.includes('không được hỗ trợ đầy đủ')
      );
      
      if (criticalErrors.length > 0) {
        setError(criticalErrors.join('. '));
        return;
      }
      
      // For non-critical warnings, just show them as info and continue
      console.log('⚠️ Non-critical warnings:', validation.warnings);
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);
    onUploadStart?.();

    try {
      // Upload file to Supabase Storage
      const fileName = `${slug || 'audio'}/${chapterNumber !== undefined ? `chapter-${chapterNumber}` : 'audio'}-${Date.now()}-${file.name}`;
      
      // Simulate progress updates for Supabase (since it doesn't have built-in progress tracking)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + Math.random() * 20, 90));
      }, 500);
      
      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from('audio')
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
        .from('audio')
        .getPublicUrl(fileName);

      const downloadURL = urlData.publicUrl;
      
      // Set progress to 100% after upload completes
      setUploadProgress(100);
      
      const result = { url: downloadURL };
      
      // Try to get audio duration with cache busting
      let durationSeconds: number | undefined;
      try {
        durationSeconds = await getAudioDuration(result.url, {
          useCacheBusting: true,
          timeout: 10000,
          retries: 2
        });
        
        if (durationSeconds > 0) {
          console.log(`Audio duration detected: ${durationSeconds}s`);
        } else {
          console.warn('Could not detect audio duration - may be due to CDN caching or format issues');
        }
      } catch (durationError) {
        console.warn('Duration detection failed:', durationError);
        // Don't fail the upload if duration detection fails
      }
      
      onUploadComplete(result.url, durationSeconds);
      
      // Call success callback for auto-save
      onUploadSuccess?.(result.url, durationSeconds);
      
      // Reset form
      if (event && event.target) {
        const target = event.target as HTMLInputElement;
        target.value = '';
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-2">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded cursor-pointer hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            <input
              type="file"
              accept="audio/*,.mp3,.wav,.ogg,.webm,.m4a,.mp4"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
              multiple={multiple}
            />
            <span className="text-sm">
              {isUploading ? 'Đang tải...' : label}
            </span>
            {isUploading ? (
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            ) : (
              <span>📁</span>
            )}
          </label>
        </div>
        
        <div className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded px-2 py-1">
          <div className="font-medium text-gray-700 mb-1">📋 Thông tin upload:</div>
          <div className="space-y-1">
            <div>• <strong>Giới hạn:</strong> Tối đa 500MB</div>
            <div>• <strong>Định dạng:</strong> MP3, WAV, OGG, WebM, M4A</div>
            <div>• <strong>Thời gian:</strong> Có thể mất vài phút với file lớn</div>
          </div>
        </div>
        
        {currentUrl && (
          <div className="text-xs text-green-600 flex items-center gap-1">
            <span>✓</span>
            <span>Đã có file</span>
          </div>
        )}
      </div>

      {isUploading && (
        <div className="space-y-2">
          {multiple && uploadingFiles.length > 0 ? (
            // Multiple files progress
            <div className="space-y-2">
              <div className="text-xs text-gray-600 font-medium">
                Đang upload {uploadingFiles.length} file...
              </div>
              {uploadingFiles.map((file, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span className="truncate max-w-48" title={file.fileName}>
                      {file.fileName}
                    </span>
                    <span className="flex items-center gap-1">
                      {file.status === 'completed' && <span className="text-green-600">✓</span>}
                      {file.status === 'error' && <span className="text-red-600">✗</span>}
                      {file.status === 'uploading' && <span>{file.progress}%</span>}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        file.status === 'completed' ? 'bg-green-600' :
                        file.status === 'error' ? 'bg-red-600' : 'bg-blue-600'
                      }`}
                      style={{ width: `${file.progress}%` }}
                    ></div>
                  </div>
                  {file.error && (
                    <div className="text-xs text-red-600 bg-red-50 p-1 rounded">
                      {file.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            // Single file progress
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Đang upload...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 text-center">
                File lớn có thể mất vài phút để upload hoàn tất
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      {currentUrl && (
        <div className="text-xs text-gray-500 bg-green-50 border border-green-200 rounded p-2">
          <div className="font-medium text-green-800 mb-1">✅ Upload thành công:</div>
          <div className="space-y-1">
            <div>• <strong>File:</strong> {currentUrl.split('/').pop()}</div>
            <div>• <strong>URL:</strong> <span className="break-all text-blue-600">{currentUrl}</span></div>
          </div>
        </div>
      )}

    </div>
  );
}
