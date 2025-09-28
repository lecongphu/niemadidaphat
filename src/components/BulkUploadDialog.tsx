"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import prettyBytes from 'pretty-bytes';

interface BulkUploadDialogProps {
  files: File[];
  currentChapterCount: number;
  slug: string;
  productId: string;
  onAllComplete: () => void;
  onCancel: () => void;
}

interface R2AudioFile {
  key: string;
  url: string;
  size: number;
  lastModified: Date;
}

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export default function BulkUploadDialog({ files, currentChapterCount, slug, productId, onAllComplete, onCancel }: BulkUploadDialogProps) {
  const [activeTab, setActiveTab] = useState<'local' | 'r2'>(files.length > 0 ? 'local' : 'r2');
  const [fileMappings, setFileMappings] = useState<Array<{file: File, chapterNumber: number, fileName: string}>>(
    files.map((file, index) => ({
      file,
      chapterNumber: currentChapterCount + index + 1,
      fileName: `Tập ${currentChapterCount + index + 1}`
    }))
  );
  const [r2Files, setR2Files] = useState<R2AudioFile[]>([]);
  const [r2Mappings, setR2Mappings] = useState<Array<{file: R2AudioFile, chapterNumber: number, fileName: string}>>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

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

  // R2 handlers
  const handleR2ChapterNumberChange = (index: number, newNumber: number) => {
    setR2Mappings(prev => prev.map((mapping, i) => 
      i === index ? { ...mapping, chapterNumber: newNumber, fileName: mapping.fileName === `Tập ${mapping.chapterNumber}` ? `Tập ${newNumber}` : mapping.fileName } : mapping
    ));
  };

  const handleR2FileNameChange = (index: number, newFileName: string) => {
    setR2Mappings(prev => prev.map((mapping, i) => 
      i === index ? { ...mapping, fileName: newFileName || `Tập ${mapping.chapterNumber}` } : mapping
    ));
  };

  const scanR2Files = async () => {
    setIsScanning(true);
    try {
      const response = await fetch('/api/upload/r2/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prefix: `${slug}` })
      });

      if (!response.ok) {
        throw new Error('Failed to scan R2 files');
      }

      const data = await response.json();
      const audioFiles = data.files.filter((file: R2AudioFile) => 
        file.key.endsWith('.mp3') || 
        file.key.endsWith('.wav') || 
        file.key.endsWith('.m4a') ||
        file.key.endsWith('.aac')
      );

      setR2Files(audioFiles);
      setR2Mappings(audioFiles.map((file: R2AudioFile, index: number) => ({
        file,
        chapterNumber: currentChapterCount + index + 1,
        fileName: `Tập ${currentChapterCount + index + 1}`
      })));
      
      console.log(`Found ${audioFiles.length} audio files on R2`);
    } catch (error) {
      console.error('Error scanning R2 files:', error);
      alert('❌ Lỗi khi quét R2 files: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsScanning(false);
    }
  };

  const autoNumberR2 = () => {
    const sortedMappings = [...r2Mappings].sort((a, b) => {
      const aFileName = a.file.key.split('/').pop() || a.file.key;
      const bFileName = b.file.key.split('/').pop() || b.file.key;
      return aFileName.localeCompare(bFileName);
    });
    setR2Mappings(sortedMappings.map((mapping, index) => ({
      ...mapping,
      chapterNumber: currentChapterCount + index + 1,
      fileName: `Tập ${currentChapterCount + index + 1}`
    })));
  };

  const handleUpload = async () => {
    setIsUploading(true);
    
    // Determine which mappings to use based on active tab
    const currentMappings = activeTab === 'local' ? fileMappings : r2Mappings;
    
    // Initialize progress tracking
    const initialProgress: UploadProgress[] = currentMappings.map(mapping => ({
      fileName: mapping.fileName,
      progress: 0,
      status: 'pending'
    }));
    setUploadProgress(initialProgress);

    // Upload files with progress tracking
    const uploadPromises = currentMappings.map(async (mapping, index) => {
      try {
        // Update status to uploading
        setUploadProgress(prev => prev.map((p, i) => 
          i === index ? { ...p, status: 'uploading', progress: 0 } : p
        ));

        let audioUrl: string;
        
        if (activeTab === 'local') {
          // Handle local file upload
          const formData = new FormData();
          formData.append('file', mapping.file as File);
          formData.append('slug', slug);
          
          // Simulate progress updates
          const progressInterval = setInterval(() => {
            setUploadProgress(prev => prev.map((p, i) => 
              i === index && p.status === 'uploading' ? { 
                ...p, 
                progress: Math.min(p.progress + Math.random() * 20, 80) 
              } : p
            ));
          }, 300);
          
          try {
            // Upload to R2 via API
            const uploadResponse = await fetch('/api/upload/r2', {
              method: 'POST',
              body: formData
            });

            // Clear progress interval
            clearInterval(progressInterval);

            if (!uploadResponse.ok) {
              throw new Error(`Upload failed: ${uploadResponse.statusText}`);
            }

            const uploadResult = await uploadResponse.json();
            audioUrl = uploadResult.url;
          } catch (uploadError) {
            clearInterval(progressInterval);
            throw uploadError;
          }
        } else {
          // Handle R2 file (already uploaded)
          audioUrl = (mapping.file as R2AudioFile).url;
          
          // Simulate progress for consistency
          setUploadProgress(prev => prev.map((p, i) => 
            i === index ? { ...p, progress: 50 } : p
          ));
        }

        console.log(`✅ Audio URL ready for ${mapping.fileName}:`, audioUrl);

        // Update progress to 90% (file ready, now saving to DB)
        setUploadProgress(prev => prev.map((p, i) => 
          i === index ? { ...p, progress: 90 } : p
        ));

        // Save chapter to database
        const chapterData = {
          product_id: productId,
          chapter_id: `${productId}-${Date.now()}-${mapping.chapterNumber}`,
          title: mapping.fileName,
          audio_url: audioUrl,
          duration_seconds: 0, // Default to 0 since API doesn't provide duration
          sort_order: mapping.chapterNumber
        };

          console.log(`📝 Lưu chapter vào database:`, chapterData);

          const { error: dbError } = await supabase
            .from('chapters')
            .insert(chapterData);

          if (dbError) {
            console.error(`❌ Database error for ${mapping.fileName}:`, dbError);
            throw new Error(`Database error: ${dbError.message}`);
          }

          console.log(`✅ Chapter đã lưu thành công: ${mapping.fileName}`);
          
          // Update status to completed
          setUploadProgress(prev => prev.map((p, i) => 
            i === index ? { ...p, status: 'completed', progress: 100 } : p
          ));

        return {
          mapping,
          audioUrl,
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
        
        console.error(`Upload failed for ${mapping.fileName}:`, error);
        return {
          mapping,
          error: error instanceof Error ? error.message : 'Upload failed',
          success: false
        };
      }
    });

    // Wait for all uploads to complete
    const results = await Promise.all(uploadPromises);
    
    console.log('📊 Tất cả uploads đã hoàn thành:', results);
    
    setIsUploading(false);
    
    // Call parent callback when all are done
    onAllComplete();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">📁 Upload Nhiều Tập</h2>
        
        {/* Tab Navigation */}
        <div className="flex border-b mb-4">
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === 'local' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('local')}
          >
            📂 Files Cục Bộ ({files.length})
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === 'r2' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('r2')}
          >
            ☁️ Files từ R2 ({r2Files.length})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'local' ? (
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
        ) : (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              Hiện tại có <strong>{currentChapterCount}</strong> tập. Import từ R2 storage.
            </p>
            
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
                onClick={scanR2Files}
                disabled={isScanning || isUploading}
              >
                {isScanning ? (
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    Đang quét...
                  </span>
                ) : (
                  '🔍 Quét R2 Files'
                )}
              </button>
              {r2Files.length > 0 && (
                <button
                  type="button"
                  className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                  onClick={autoNumberR2}
                >
                  ⚡ Tự động đánh số
                </button>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3 mb-6">
          {activeTab === 'local' ? (
            files.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📂</div>
                <div className="text-sm">Chưa có files cục bộ nào được chọn</div>
                <div className="text-xs mt-1">Sử dụng button &ldquo;📂 Chọn Files Cục Bộ&rdquo; để chọn files từ máy tính</div>
              </div>
            ) : (
            fileMappings.map((mapping, index) => {
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
                    {prettyBytes(mapping.file.size)}
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
          })
          )
          ) : (
            r2Files.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">☁️</div>
                <div className="text-sm">Chưa quét R2 files</div>
                <div className="text-xs mt-1">Click &ldquo;🔍 Quét R2 Files&rdquo; để tìm audio files trên R2 storage</div>
              </div>
            ) : (
            r2Mappings.map((mapping, index) => {
              const progress = uploadProgress[index];
              const fileName = mapping.file.key.split('/').pop() || mapping.file.key;
              return (
              <div key={index} className="flex items-center gap-3 p-3 border rounded bg-gray-50">
                <div className="flex-shrink-0 w-8 text-center text-sm font-medium text-gray-500">
                  {index + 1}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate" title={fileName}>
                    {fileName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {prettyBytes(mapping.file.size)} • {
                      (() => {
                        try {
                          return new Date(mapping.file.lastModified).toLocaleDateString();
                        } catch {
                          return 'Unknown date';
                        }
                      })()
                    }
                  </div>
                  
                  {/* Progress Bar */}
                  {progress && (
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>
                          {progress.status === 'pending' && '⏳ Chờ import'}
                          {progress.status === 'uploading' && `📥 Đang import... ${progress.progress}%`}
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
                    onChange={(e) => handleR2ChapterNumberChange(index, parseInt(e.target.value) || 1)}
                    className="w-16 px-2 py-1 text-sm border rounded text-center"
                    disabled={isUploading}
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Tên:</label>
                  <input
                    type="text"
                    value={mapping.fileName}
                    onChange={(e) => handleR2FileNameChange(index, e.target.value)}
                    className="w-32 px-2 py-1 text-sm border rounded"
                    placeholder={`Tập ${mapping.chapterNumber}`}
                    disabled={isUploading}
                  />
                </div>
              </div>
            );
          })
          )
          )}
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
            disabled={isUploading || (activeTab === 'local' ? files.length === 0 : r2Files.length === 0)}
          >
            {isUploading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {activeTab === 'local' 
                  ? `Đang upload ${files.length} tập...`
                  : `Đang import ${r2Files.length} tập...`
                }
              </span>
            ) : (
              activeTab === 'local' 
                ? `📁 Upload ${files.length} tập`
                : `📥 Import ${r2Files.length} tập`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
