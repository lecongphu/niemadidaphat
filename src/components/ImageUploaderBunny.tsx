"use client";

import React from 'react';
import BunnyUploader from './BunnyUploader';

interface ImageUploaderBunnyProps {
  onUploadSuccess: (url: string, filePath: string) => void;
  onUploadError?: (error: string) => void;
  onUploadStart?: () => void;
  label?: string;
  folder?: string;
}

const ImageUploaderBunny: React.FC<ImageUploaderBunnyProps> = ({
  onUploadSuccess,
  onUploadError,
  onUploadStart,
  label = "Upload Image File",
  folder = "images",
}) => {
  return (
    <BunnyUploader
      onUploadSuccess={onUploadSuccess}
      onUploadError={onUploadError}
      onUploadStart={onUploadStart}
      label={label}
      accept="image/*"
      folder={folder}
    />
  );
};

export default ImageUploaderBunny;
