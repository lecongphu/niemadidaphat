// Duration conversion utilities

/**
 * Convert seconds to human readable format
 * @param totalSeconds - Total seconds
 * @returns Formatted string like "2h 30m 45s"
 */
export function secondsToHumanReadable(totalSeconds: number): string {
  if (!totalSeconds || totalSeconds <= 0) return "0s";

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const parts: string[] = [];
  
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

  return parts.join(' ');
}

/**
 * Convert human readable format to seconds
 * @param duration - Format like "2h 30m 45s", "90m", "3600s", "1:30:45", "90:30"
 * @returns Total seconds
 */
export function humanReadableToSeconds(duration: string): number {
  if (!duration || typeof duration !== 'string') return 0;

  const input = duration.trim().toLowerCase();
  
  // Handle HH:MM:SS or MM:SS format
  if (input.includes(':')) {
    const parts = input.split(':').map(p => parseInt(p.trim()) || 0);
    
    if (parts.length === 3) {
      // HH:MM:SS
      const [hours, minutes, seconds] = parts;
      return hours * 3600 + minutes * 60 + seconds;
    } else if (parts.length === 2) {
      // MM:SS
      const [minutes, seconds] = parts;
      return minutes * 60 + seconds;
    }
  }

  // Handle "2h 30m 45s" format
  let totalSeconds = 0;
  
  // Extract hours
  const hoursMatch = input.match(/(\d+)h/);
  if (hoursMatch) {
    totalSeconds += parseInt(hoursMatch[1]) * 3600;
  }
  
  // Extract minutes
  const minutesMatch = input.match(/(\d+)m/);
  if (minutesMatch) {
    totalSeconds += parseInt(minutesMatch[1]) * 60;
  }
  
  // Extract seconds
  const secondsMatch = input.match(/(\d+)s/);
  if (secondsMatch) {
    totalSeconds += parseInt(secondsMatch[1]);
  }

  // If no units found, assume it's minutes (common case)
  if (totalSeconds === 0 && /^\d+$/.test(input)) {
    totalSeconds = parseInt(input) * 60;
  }

  return totalSeconds;
}

/**
 * Get audio file duration using HTML5 Audio API
 * Supports: MP3, WAV, OGG, WebM, M4A formats
 * @param audioUrl - URL to audio file
 * @param options - Options for duration detection
 * @returns Promise<number> - Duration in seconds
 */
export function getAudioDuration(audioUrl: string, options: {
  useCacheBusting?: boolean;
  timeout?: number;
  retries?: number;
} = {}): Promise<number> {
  const {
    useCacheBusting = true,
    timeout = 10000,
    retries = 2
  } = options;

  return new Promise((resolve, reject) => {
    if (!audioUrl) {
      resolve(0);
      return;
    }

    // Add cache busting if enabled and URL looks like CDN
    let processedUrl = audioUrl;
    if (useCacheBusting && (audioUrl.includes('cdn.niemadidaphat.com') || audioUrl.includes('b-cdn.net'))) {
      const separator = audioUrl.includes('?') ? '&' : '?';
      processedUrl = `${audioUrl}${separator}v=${Date.now()}`;
    }

    const audio = new Audio();
    let timeoutId: NodeJS.Timeout | null = null;
    let hasResolved = false;
    
    const cleanup = () => {
      if (hasResolved) return;
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('loadeddata', onLoadedData);
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      audio.src = '';
    };

    const resolveDuration = (duration: number) => {
      if (hasResolved) return;
      hasResolved = true;
      cleanup();
      
      if (isNaN(duration) || !isFinite(duration) || duration <= 0) {
        console.warn(`Invalid duration detected: ${duration} for URL: ${audioUrl}`);
        resolve(0);
      } else {
        console.log(`Duration detected: ${duration}s for URL: ${audioUrl}`);
        resolve(Math.round(duration));
      }
    };

    const onLoadedMetadata = () => {
      resolveDuration(audio.duration);
    };

    const onCanPlay = () => {
      // Fallback for some formats that don't fire loadedmetadata
      if (audio.duration && isFinite(audio.duration) && audio.duration > 0) {
        resolveDuration(audio.duration);
      }
    };

    const onLoadedData = () => {
      // Another fallback for duration detection
      if (audio.duration && isFinite(audio.duration) && audio.duration > 0) {
        resolveDuration(audio.duration);
      }
    };

    const onError = (event: Event) => {
      if (hasResolved) return;
      cleanup();
      
      // Get more specific error information
      const errorMsg = audio.error ? 
        `Audio error code ${audio.error.code}: ${getAudioErrorMessage(audio.error.code)}` :
        'Failed to load audio file';
      
      console.error(`Audio duration detection failed for ${audioUrl}:`, errorMsg);
      
      // Instead of rejecting, resolve with 0 to prevent breaking the UI
      resolve(0);
    };

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('loadeddata', onLoadedData);
    audio.addEventListener('error', onError);
    
    // Set timeout to avoid hanging
    timeoutId = setTimeout(() => {
      if (hasResolved) return;
      cleanup();
      console.warn(`Audio duration detection timeout for ${audioUrl}`);
      resolve(0); // Resolve with 0 instead of rejecting
    }, timeout);

    try {
      // Set CORS mode for cross-origin requests
      audio.crossOrigin = 'anonymous';
      audio.src = processedUrl;
      audio.preload = 'metadata';
      
      // Force load for some browsers
      audio.load();
    } catch (error) {
      cleanup();
      console.error(`Failed to initialize audio for ${audioUrl}:`, error);
      resolve(0); // Resolve with 0 instead of rejecting
    }
  });
}

/**
 * Get human readable error message for audio error codes
 */
function getAudioErrorMessage(errorCode: number): string {
  switch (errorCode) {
    case 1: return 'MEDIA_ERR_ABORTED - Audio loading was aborted';
    case 2: return 'MEDIA_ERR_NETWORK - Network error occurred';
    case 3: return 'MEDIA_ERR_DECODE - Audio decoding error (format may be unsupported)';
    case 4: return 'MEDIA_ERR_SRC_NOT_SUPPORTED - Audio format not supported';
    default: return `Unknown error code: ${errorCode}`;
  }
}

/**
 * Get total duration from multiple audio files (for chapters)
 * @param audioUrls - Array of audio URLs
 * @param options - Options for duration detection
 * @returns Promise<number> - Total duration in seconds
 */
export async function getTotalDurationFromChapters(audioUrls: string[], options: {
  useCacheBusting?: boolean;
  timeout?: number;
  retries?: number;
} = {}): Promise<number> {
  if (!audioUrls || audioUrls.length === 0) return 0;

  const validUrls = audioUrls.filter(url => url && url.trim());
  if (validUrls.length === 0) return 0;

  try {
    const durations = await Promise.allSettled(
      validUrls.map(url => getAudioDuration(url, options))
    );

    let totalSeconds = 0;
    let successfulCount = 0;
    
    durations.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value > 0) {
        totalSeconds += result.value;
        successfulCount++;
      } else {
        console.warn(`Failed to get duration for ${validUrls[index]}:`, 
          result.status === 'rejected' ? result.reason : 'Duration is 0');
      }
    });

    console.log(`Duration detection completed: ${successfulCount}/${validUrls.length} files successful`);
    return totalSeconds;
  } catch (error) {
    console.warn('Error getting total duration:', error);
    return 0;
  }
}

/**
 * Format duration for display in different contexts
 */
export const formatDuration = {
  /**
   * Short format for lists: "2h 30m"
   */
  short: (seconds: number): string => {
    if (!seconds || seconds <= 0) return "0m";
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.ceil((seconds % 3600) / 60);
    
    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    return `${minutes}m`;
  },

  /**
   * Long format for details: "2 giờ 30 phút 45 giây"
   */
  long: (seconds: number): string => {
    if (!seconds || seconds <= 0) return "0 giây";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts: string[] = [];
    
    if (hours > 0) parts.push(`${hours} giờ`);
    if (minutes > 0) parts.push(`${minutes} phút`);
    if (secs > 0) parts.push(`${secs} giây`);

    return parts.join(' ') || "0 giây";
  },

  /**
   * Time format for players: "02:30:45"
   */
  time: (seconds: number): string => {
    if (!seconds || seconds <= 0) return "00:00";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  },
};

/**
 * Validate duration input
 */
export function validateDurationInput(input: string): {
  isValid: boolean;
  seconds: number;
  formatted: string;
  error?: string;
} {
  try {
    const seconds = humanReadableToSeconds(input);
    
    if (seconds <= 0) {
      return {
        isValid: false,
        seconds: 0,
        formatted: '',
        error: 'Duration must be greater than 0'
      };
    }


    return {
      isValid: true,
      seconds,
      formatted: secondsToHumanReadable(seconds),
    };
  } catch {
    return {
      isValid: false,
      seconds: 0,
      formatted: '',
      error: 'Invalid duration format'
    };
  }
}

/**
 * Examples and test cases
 */
export const durationExamples = {
  inputs: [
    '2h 30m 45s',
    '90m',
    '3600s',
    '1:30:45',
    '90:30',
    '150', // 150 minutes
  ],
  outputs: [
    '2h 30m 45s', // 9045 seconds
    '1h 30m',     // 5400 seconds
    '1h',         // 3600 seconds
    '1h 30m 45s', // 5445 seconds
    '1h 30m 30s', // 5430 seconds
    '2h 30m',     // 9000 seconds
  ],
};
