"use client";

import React from 'react';
import BunnyUploader from './BunnyUploader';

interface PDFUploaderBunnyProps {
  onUploadSuccess: (url: string, filePath: string) => void;
  onUploadError?: (error: string) => void;
  onUploadStart?: () => void;
  label?: string;
  folder?: string;
}

const PDFUploaderBunny: React.FC<PDFUploaderBunnyProps> = ({
  onUploadSuccess,
  onUploadError,
  onUploadStart,
  label = "Upload PDF File",
  folder = "pdfs",
}) => {
  return (
    <BunnyUploader
      onUploadSuccess={onUploadSuccess}
      onUploadError={onUploadError}
      onUploadStart={onUploadStart}
      label={label}
      accept="application/pdf"
      folder={folder}
    />
  );
};

export default PDFUploaderBunny;
