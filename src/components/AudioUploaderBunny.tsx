"use client";

import React from 'react';
import BunnyUploader from './BunnyUploader';

interface AudioUploaderBunnyProps {
  onUploadSuccess: (url: string, filePath: string) => void;
  onUploadError?: (error: string) => void;
  onUploadStart?: () => void;
  label?: string;
  folder?: string;
}

const AudioUploaderBunny: React.FC<AudioUploaderBunnyProps> = ({
  onUploadSuccess,
  onUploadError,
  onUploadStart,
  label = "Upload Audio File",
  folder = "audio",
}) => {
  return (
    <BunnyUploader
      onUploadSuccess={onUploadSuccess}
      onUploadError={onUploadError}
      onUploadStart={onUploadStart}
      label={label}
      accept="audio/*"
      folder={folder}
    />
  );
};

export default AudioUploaderBunny;
