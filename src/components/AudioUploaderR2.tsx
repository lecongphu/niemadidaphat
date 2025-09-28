"use client";

import React from 'react';
import R2Uploader from './R2Uploader';

interface AudioUploaderR2Props {
  onUploadSuccess: (url: string, filePath: string) => void;
  onUploadError?: (error: string) => void;
  onUploadStart?: () => void;
  label?: string;
  slug?: string; // Product slug for organizing files
}

const AudioUploaderR2: React.FC<AudioUploaderR2Props> = ({
  onUploadSuccess,
  onUploadError,
  onUploadStart,
  label = "Upload Audio File",
  slug,
}) => {
  return (
    <R2Uploader
      onUploadSuccess={onUploadSuccess}
      onUploadError={onUploadError}
      onUploadStart={onUploadStart}
      label={label}
      accept="audio/*"
      folder="audio"
      slug={slug}
    />
  );
};

export default AudioUploaderR2;
