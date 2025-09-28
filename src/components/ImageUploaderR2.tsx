"use client";

import React from 'react';
import R2Uploader from './R2Uploader';

interface ImageUploaderR2Props {
  onUploadSuccess: (url: string, filePath: string) => void;
  onUploadError?: (error: string) => void;
  onUploadStart?: () => void;
  label?: string;
  slug?: string; // Product slug for organizing files
}

const ImageUploaderR2: React.FC<ImageUploaderR2Props> = ({
  onUploadSuccess,
  onUploadError,
  onUploadStart,
  label = "Upload Image File",
  slug,
}) => {
  return (
    <R2Uploader
      onUploadSuccess={onUploadSuccess}
      onUploadError={onUploadError}
      onUploadStart={onUploadStart}
      label={label}
      accept="image/*"
      folder="images"
      slug={slug}
    />
  );
};

export default ImageUploaderR2;
