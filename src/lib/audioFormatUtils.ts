// Audio format detection and handling utilities

export interface AudioFormatInfo {
  extension: string;
  mimeType: string;
  displayName: string;
  quality: 'low' | 'medium' | 'high' | 'lossless';
  compression: 'lossy' | 'lossless';
  browserSupport: 'excellent' | 'good' | 'limited';
  recommendedFor: string[];
}

export const audioFormats: Record<string, AudioFormatInfo> = {
  mp3: {
    extension: 'mp3',
    mimeType: 'audio/mpeg',
    displayName: 'MP3',
    quality: 'high',
    compression: 'lossy',
    browserSupport: 'excellent',
    recommendedFor: ['speech', 'music', 'general use']
  },
  wav: {
    extension: 'wav',
    mimeType: 'audio/wav',
    displayName: 'WAV',
    quality: 'lossless',
    compression: 'lossless',
    browserSupport: 'excellent',
    recommendedFor: ['high quality', 'editing', 'archival']
  },
  ogg: {
    extension: 'ogg',
    mimeType: 'audio/ogg',
    displayName: 'OGG Vorbis',
    quality: 'high',
    compression: 'lossy',
    browserSupport: 'good',
    recommendedFor: ['open source', 'web streaming']
  },
  webm: {
    extension: 'webm',
    mimeType: 'audio/webm',
    displayName: 'WebM Audio',
    quality: 'high',
    compression: 'lossy',
    browserSupport: 'good',
    recommendedFor: ['web streaming', 'modern browsers']
  },
  m4a: {
    extension: 'm4a',
    mimeType: 'audio/mp4',
    displayName: 'M4A (AAC)',
    quality: 'high',
    compression: 'lossy',
    browserSupport: 'good',
    recommendedFor: ['Apple devices', 'high quality', 'streaming']
  }
};

/**
 * Get audio format info from file extension or MIME type
 */
export function getAudioFormatInfo(fileNameOrMimeType: string): AudioFormatInfo | null {
  const input = fileNameOrMimeType.toLowerCase();
  
  // Try by extension first
  for (const [key, format] of Object.entries(audioFormats)) {
    if (input.endsWith(`.${format.extension}`) || input === format.extension) {
      return format;
    }
  }
  
  // Try by MIME type
  for (const format of Object.values(audioFormats)) {
    if (input === format.mimeType || input.includes(format.mimeType)) {
      return format;
    }
  }
  
  return null;
}

/**
 * Check if browser supports audio format
 */
export function checkAudioSupport(mimeType: string): boolean {
  if (typeof Audio === 'undefined') return false;
  
  const audio = new Audio();
  const support = audio.canPlayType(mimeType);
  
  // canPlayType returns: "", "maybe", or "probably"
  return support === "probably" || support === "maybe";
}

/**
 * Get all supported audio formats for current browser
 */
export function getSupportedFormats(): AudioFormatInfo[] {
  return Object.values(audioFormats).filter(format => 
    checkAudioSupport(format.mimeType)
  );
}

/**
 * Get recommended format for different use cases
 */
export function getRecommendedFormat(useCase: 'speech' | 'music' | 'streaming' | 'archival'): AudioFormatInfo {
  switch (useCase) {
    case 'speech':
      return audioFormats.mp3; // Good compression for speech
    case 'music':
      return audioFormats.m4a; // Better quality than MP3
    case 'streaming':
      return audioFormats.webm; // Modern, efficient for web
    case 'archival':
      return audioFormats.wav; // Lossless preservation
    default:
      return audioFormats.mp3; // Default fallback
  }
}

/**
 * Estimate file size based on duration and format
 */
export function estimateFileSize(
  durationSeconds: number, 
  format: AudioFormatInfo, 
  bitrate?: number
): { sizeBytes: number; sizeMB: number; sizeFormatted: string } {
  let estimatedBitrate: number;
  
  if (bitrate) {
    estimatedBitrate = bitrate;
  } else {
    // Default bitrates by format
    switch (format.extension) {
      case 'mp3':
        estimatedBitrate = 128; // 128 kbps
        break;
      case 'wav':
        estimatedBitrate = 1411; // 16-bit 44.1kHz stereo
        break;
      case 'ogg':
        estimatedBitrate = 112; // ~112 kbps average
        break;
      case 'webm':
        estimatedBitrate = 96; // ~96 kbps average
        break;
      case 'm4a':
        estimatedBitrate = 128; // 128 kbps AAC
        break;
      default:
        estimatedBitrate = 128;
    }
  }
  
  const sizeBytes = Math.round((estimatedBitrate * 1000 * durationSeconds) / 8);
  const sizeMB = sizeBytes / (1024 * 1024);
  
  let sizeFormatted: string;
  if (sizeMB < 1) {
    sizeFormatted = `${Math.round(sizeBytes / 1024)} KB`;
  } else if (sizeMB < 1000) {
    sizeFormatted = `${sizeMB.toFixed(1)} MB`;
  } else {
    sizeFormatted = `${(sizeMB / 1024).toFixed(1)} GB`;
  }
  
  return { sizeBytes, sizeMB, sizeFormatted };
}

/**
 * Validate audio file for Buddhist content
 */
export function validateAudioFile(file: File): {
  isValid: boolean;
  warnings: string[];
  recommendations: string[];
  formatInfo: AudioFormatInfo | null;
} {
  const warnings: string[] = [];
  const recommendations: string[] = [];
  
  const formatInfo = getAudioFormatInfo(file.type) || getAudioFormatInfo(file.name);
  
  if (!formatInfo) {
    return {
      isValid: false,
      warnings: ['Định dạng file không được hỗ trợ'],
      recommendations: ['Sử dụng MP3, WAV, OGG, WebM hoặc M4A'],
      formatInfo: null
    };
  }
  
  // Check browser support
  if (!checkAudioSupport(formatInfo.mimeType)) {
    warnings.push(`Định dạng ${formatInfo.displayName} có thể không được hỗ trợ đầy đủ trên tất cả trình duyệt`);
  }
  
  // File size warnings
  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > 300) {
    warnings.push(`File size rất lớn (${fileSizeMB.toFixed(1)}MB) - có thể tải rất chậm`);
  } else if (fileSizeMB > 200) {
    warnings.push(`File size lớn (${fileSizeMB.toFixed(1)}MB) - có thể tải chậm`);
  } else if (fileSizeMB > 100) {
    recommendations.push('File size khá lớn - cân nhắc nén để tối ưu tốc độ tải');
  } else if (fileSizeMB > 50) {
    recommendations.push('Cân nhắc nén file để tối ưu tốc độ tải');
  }
  
  // Format-specific recommendations
  switch (formatInfo.extension) {
    case 'wav':
      if (fileSizeMB > 20) {
        recommendations.push('WAV không nén - cân nhắc chuyển sang MP3 hoặc M4A để tiết kiệm băng thông');
      }
      break;
    case 'webm':
      recommendations.push('WebM tối ưu cho web nhưng có thể không tương thích với một số thiết bị cũ');
      break;
    case 'm4a':
      recommendations.push('M4A chất lượng cao, tốt cho nội dung Phật pháp');
      break;
    case 'mp3':
      recommendations.push('MP3 tương thích tốt nhất với mọi thiết bị');
      break;
  }
  
  // Only block upload for critical errors, not warnings
  const criticalErrors = warnings.filter(warning => 
    warning.includes('không được hỗ trợ') || 
    warning.includes('không được hỗ trợ đầy đủ')
  );
  
  return {
    isValid: criticalErrors.length === 0,
    warnings,
    recommendations,
    formatInfo
  };
}

/**
 * Get optimal settings for different Buddhist content types
 */
export const buddhistContentSettings = {
  dharma_talk: {
    format: 'mp3',
    bitrate: 64, // Good for speech
    description: 'Pháp thoại - ưu tiên dung lượng nhỏ'
  },
  sutra_chanting: {
    format: 'm4a',
    bitrate: 128, // Better quality for chanting
    description: 'Tụng kinh - chất lượng cao'
  },
  meditation_music: {
    format: 'm4a',
    bitrate: 192, // High quality for music
    description: 'Nhạc thiền - chất lượng cao nhất'
  },
  general: {
    format: 'mp3',
    bitrate: 128, // Balanced
    description: 'Nội dung chung - cân bằng chất lượng và dung lượng'
  }
};

/**
 * Browser compatibility matrix
 */
export const browserSupport = {
  mp3: ['Chrome', 'Firefox', 'Safari', 'Edge', 'IE9+'],
  wav: ['Chrome', 'Firefox', 'Safari', 'Edge'],
  ogg: ['Chrome', 'Firefox', 'Opera'],
  webm: ['Chrome', 'Firefox', 'Opera', 'Edge'],
  m4a: ['Chrome', 'Safari', 'Edge', 'iOS', 'Android']
};
