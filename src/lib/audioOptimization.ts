// Audio optimization utilities for Bunny CDN

// Network connection interface
interface NetworkInformation extends EventTarget {
  effectiveType?: '2g' | '3g' | '4g' | 'slow-2g';
  downlink?: number;
  saveData?: boolean;
  addEventListener(type: 'change', listener: () => void): void;
  removeEventListener(type: 'change', listener: () => void): void;
}

// Extend Navigator interface
interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
}

export interface AudioOptimizationOptions {
  quality?: 'low' | 'medium' | 'high';
  format?: 'mp3' | 'ogg' | 'auto';
  preload?: 'none' | 'metadata' | 'auto';
}

export class AudioOptimizer {
  private cdnUrl: string;

  constructor() {
    this.cdnUrl = process.env.NEXT_PUBLIC_BUNNY_CDN_URL || '';
  }

  /**
   * Get optimized audio URL with quality settings
   */
  getOptimizedUrl(audioPath: string, options: AudioOptimizationOptions = {}): string {
    if (!audioPath) return '';
    
    // If already a full URL, return as-is
    if (audioPath.startsWith('http')) {
      return audioPath;
    }

    if (!this.cdnUrl) {
      return audioPath; // Fallback
    }

    let url = `${this.cdnUrl}/${audioPath.replace(/^\//, '')}`;
    const params = new URLSearchParams();

    // Quality optimization
    if (options.quality) {
      switch (options.quality) {
        case 'low':
          params.set('quality', '60'); // Lower bitrate for mobile
          break;
        case 'medium':
          params.set('quality', '80'); // Balanced quality
          break;
        case 'high':
          params.set('quality', '95'); // High quality for desktop
          break;
      }
    }

    // Format optimization (if Bunny supports it)
    if (options.format && options.format !== 'auto') {
      params.set('format', options.format);
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    return url;
  }

  /**
   * Get appropriate quality based on connection
   */
  getAdaptiveQuality(): 'low' | 'medium' | 'high' {
    // Check connection type if available
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const connection = (navigator as NavigatorWithConnection).connection;
      
      if (connection) {
        const effectiveType = connection.effectiveType;
        
        switch (effectiveType) {
          case 'slow-2g':
          case '2g':
            return 'low';
          case '3g':
            return 'medium';
          case '4g':
          default:
            return 'high';
        }
      }
    }

    // Default to medium quality
    return 'medium';
  }

  /**
   * Preload audio for better UX
   */
  preloadAudio(audioUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      
      audio.addEventListener('canplaythrough', () => resolve(), { once: true });
      audio.addEventListener('error', reject, { once: true });
      
      // Only preload metadata to save bandwidth
      audio.preload = 'metadata';
      audio.src = audioUrl;
    });
  }

  /**
   * Batch preload multiple audio files
   */
  async batchPreload(audioUrls: string[], maxConcurrent = 3): Promise<void> {
    const chunks = [];
    for (let i = 0; i < audioUrls.length; i += maxConcurrent) {
      chunks.push(audioUrls.slice(i, i + maxConcurrent));
    }

    for (const chunk of chunks) {
      await Promise.allSettled(
        chunk.map(url => this.preloadAudio(url))
      );
    }
  }

  /**
   * Get file size estimate for bandwidth calculation
   */
  estimateFileSize(durationMinutes: number, quality: 'low' | 'medium' | 'high' = 'medium'): number {
    // Rough estimates in MB based on typical MP3 bitrates
    const bitrateKbps = {
      low: 64,    // 64 kbps
      medium: 128, // 128 kbps
      high: 192,   // 192 kbps
    };

    const bitrate = bitrateKbps[quality];
    const sizeBytes = (bitrate * 1000 * durationMinutes * 60) / 8;
    return Math.round(sizeBytes / (1024 * 1024) * 100) / 100; // MB with 2 decimal places
  }
}

// Export singleton instance
export const audioOptimizer = new AudioOptimizer();

// Helper function for components
export function getOptimizedAudioUrl(audioPath: string, options?: AudioOptimizationOptions): string {
  return audioOptimizer.getOptimizedUrl(audioPath, options);
}

// React hook for adaptive quality
import { useState, useEffect } from 'react';

export function useAdaptiveAudioQuality() {
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('medium');

  useEffect(() => {
    setQuality(audioOptimizer.getAdaptiveQuality());

    // Listen for connection changes
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const connection = (navigator as NavigatorWithConnection).connection;
      if (connection && typeof connection.addEventListener === 'function') {
        const handleChange = () => {
          setQuality(audioOptimizer.getAdaptiveQuality());
        };
        
        try {
          connection.addEventListener('change', handleChange);
          return () => {
            try {
              connection.removeEventListener('change', handleChange);
            } catch (error) {
              console.warn('Failed to remove connection listener:', error);
            }
          };
        } catch (error) {
          console.warn('Failed to add connection listener:', error);
        }
      }
    }
  }, []);

  return quality;
}
