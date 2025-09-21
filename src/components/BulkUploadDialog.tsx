"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface BulkUploadDialogProps {
  files: File[];
  currentChapterCount: number;
  slug: string;
  onFileUploadComplete: (mapping: {file: File, chapterNumber: number, fileName: string}, result: {url: string, durationSeconds?: number}) => void;
  onFileUploadError: (mapping: {file: File, chapterNumber: number, fileName: string}, error: string) => void;
  onAllComplete: () => void;
  onCancel: () => void;
}

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export default function BulkUploadDialog({ files, currentChapterCount, slug, onFileUploadComplete, onFileUploadError, onAllComplete, onCancel }: BulkUploadDialogProps) {
  const [fileMappings, setFileMappings] = useState<Array<{file: File, chapterNumber: number, fileName: string}>>(
    files.map((file, index) => ({
      file,
      chapterNumber: currentChapterCount + index + 1,
      fileName: `Tập ${currentChapterCount + index + 1}`
    }))
  );
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleChapterNumberChange = (index: number, newNumber: number) => {
    setFileMappings(prev => prev.map((mapping, i) => 
      i === index ? { ...mapping, chapterNumber: newNumber, fileName: mapping.fileName === `Tập ${mapping.chapterNumber}` ? `Tập ${newNumber}` : mapping.fileName } : mapping
    ));
  };

  const handleFileNameChange = (index: number, newFileName: string) => {
    setFileMappings(prev => prev.map((mapping, i) => 
      i === index ? { ...mapping, fileName: newFileName || `Tập ${mapping.chapterNumber}` } : mapping
    ));
  };


  const autoNumber = () => {
    const sortedMappings = [...fileMappings].sort((a, b) => a.fileName.localeCompare(b.fileName));
    setFileMappings(sortedMappings.map((mapping, index) => ({
      ...mapping,
      chapterNumber: currentChapterCount + index + 1,
      fileName: `Tập ${currentChapterCount + index + 1}`
    })));
  };

  const handleUpload = async () => {
    setIsUploading(true);
    
    // Initialize progress tracking
    const initialProgress: UploadProgress[] = fileMappings.map(mapping => ({
      fileName: mapping.fileName,
      progress: 0,
      status: 'pending'
    }));
    setUploadProgress(initialProgress);

    // Upload files with progress tracking
    const uploadPromises = fileMappings.map(async (mapping, index) => {
      try {
        // Update status to uploading
        setUploadProgress(prev => prev.map((p, i) => 
          i === index ? { ...p, status: 'uploading', progress: 0 } : p
        ));

        // Upload file to Supabase Storage
        const fileName = `${slug}/chapter-${mapping.chapterNumber}-${Date.now()}-${mapping.file.name}`;
        const filePath = `audio/${fileName}`;
        
        // Simulate progress updates for Supabase (since it doesn't have built-in progress tracking)
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => prev.map((p, i) => 
            i === index && p.status === 'uploading' ? { 
              ...p, 
              progress: Math.min(p.progress + Math.random() * 30, 90) 
            } : p
          ));
        }, 500);
        
        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('audio')
          .upload(fileName, mapping.file, {
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
        
        const result = { url: downloadURL };
        
        // Update status to completed
        setUploadProgress(prev => prev.map((p, i) => 
          i === index ? { ...p, status: 'completed', progress: 100 } : p
        ));

        // Call parent callback immediately for this file
        onFileUploadComplete(mapping, result);

        return {
          mapping,
          result,
          success: true
        };

      } catch (error) {
        // Update status to error
        setUploadProgress(prev => prev.map((p, i) => 
          i === index ? { 
            ...p, 
            status: 'error', 
            progress: 0,
            error: error instanceof Error ? error.message : 'Upload failed'
          } : p
        ));
        
        // Call parent callback for error
        onFileUploadError(mapping, error instanceof Error ? error.message : 'Upload failed');
        
        console.error(`Upload failed for ${mapping.fileName}:`, error);
        return {
          mapping,
          error: error instanceof Error ? error.message : 'Upload failed',
          success: false
        };
      }
    });

  // Wait for all uploads to complete
  await Promise.all(uploadPromises);
  
  setIsUploading(false);
  
  // Call parent callback when all are done
  onAllComplete();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">📁 Upload Nhiều Tập</h2>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Hiện tại có <strong>{currentChapterCount}</strong> tập. Sẽ tạo thêm <strong>{files.length}</strong> tập mới.
          </p>
          
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
              onClick={autoNumber}
            >
              ⚡ Tự động đánh số
            </button>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {fileMappings.map((mapping, index) => {
            const progress = uploadProgress[index];
            return (
              <div key={index} className="flex items-center gap-3 p-3 border rounded bg-gray-50">
                <div className="flex-shrink-0 w-8 text-center text-sm font-medium text-gray-500">
                  {index + 1}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate" title={mapping.file.name}>
                    {mapping.file.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {(mapping.file.size / (1024 * 1024)).toFixed(1)} MB
                  </div>
                  
                  {/* Progress Bar */}
                  {progress && (
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>
                          {progress.status === 'pending' && '⏳ Chờ upload'}
                          {progress.status === 'uploading' && `📤 Đang upload... ${progress.progress}%`}
                          {progress.status === 'completed' && '✅ Hoàn thành'}
                          {progress.status === 'error' && '❌ Lỗi'}
                        </span>
                        {progress.status === 'uploading' && (
                          <span>{progress.progress}%</span>
                        )}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            progress.status === 'completed' ? 'bg-green-600' :
                            progress.status === 'error' ? 'bg-red-600' : 'bg-blue-600'
                          }`}
                          style={{ width: `${progress.progress}%` }}
                        ></div>
                      </div>
                      {progress.error && (
                        <div className="text-xs text-red-600 bg-red-50 p-1 rounded">
                          {progress.error}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Tập:</label>
                  <input
                    type="number"
                    min="1"
                    max="999"
                    value={mapping.chapterNumber}
                    onChange={(e) => handleChapterNumberChange(index, parseInt(e.target.value) || 1)}
                    className="w-16 px-2 py-1 text-sm border rounded text-center"
                    disabled={isUploading}
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Tên:</label>
                  <input
                    type="text"
                    value={mapping.fileName}
                    onChange={(e) => handleFileNameChange(index, e.target.value)}
                    className="w-32 px-2 py-1 text-sm border rounded"
                    placeholder={`Tập ${mapping.chapterNumber}`}
                    disabled={isUploading}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
            onClick={onCancel}
            disabled={isUploading}
          >
            {isUploading ? 'Đang upload...' : 'Hủy'}
          </button>
          <button
            type="button"
            className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleUpload}
            disabled={isUploading}
          >
            {isUploading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Đang upload {files.length} tập...
              </span>
            ) : (
              `📁 Upload ${files.length} tập`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
