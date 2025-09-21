"use client";

import React, { useState, ChangeEvent } from 'react';

interface BunnyUploaderProps {
  onUploadSuccess: (url: string, filePath: string) => void;
  onUploadError?: (error: string) => void;
  onUploadStart?: () => void;
  label?: string;
  accept?: string; // e.g., "audio/*", "application/pdf", "image/*"
  folder?: string; // Optional folder path in Bunny CDN
}

const BunnyUploader: React.FC<BunnyUploaderProps> = ({
  onUploadSuccess,
  onUploadError,
  onUploadStart,
  label = "Upload File to Bunny CDN",
  accept,
  folder,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
      setError(null);
    } else {
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);
    onUploadStart?.();

    const formData = new FormData();
    formData.append('file', file);
    if (folder) {
      formData.append('folder', folder);
    }

    try {
      const response = await fetch('/api/upload/bunny', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload file');
      }

      const data = await response.json();
      onUploadSuccess(data.url, data.filePath);
      setFile(null); // Clear file input after successful upload
    } catch (err: unknown) {
      console.error('Upload error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during upload.';
      setError(errorMessage);
      onUploadError?.(errorMessage);
    } finally {
      setUploading(false);
      setProgress(100); // Mark as complete
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-md file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100"
      />
      {file && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">{file.name}</span>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? `Uploading (${progress}%)` : 'Upload'}
          </button>
        </div>
      )}
      {uploading && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
      )}
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default BunnyUploader;
