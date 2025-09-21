"use client";

import { useState, useRef, useEffect } from 'react';

interface AudioPreviewProps {
  audioUrl: string;
  title?: string;
  className?: string;
}

export default function AudioPreview({ audioUrl, title, className = "" }: AudioPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle play/pause
  const togglePlay = async () => {
    if (!audioRef.current) return;

    try {
      setIsLoading(true);
      setError(null);

      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Audio playback error:', err);
      setError('Không thể phát audio');
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle time update
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  // Handle duration change
  const handleDurationChange = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  // Handle seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const newTime = parseFloat(e.target.value);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Handle audio end
  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // Handle audio error
  const handleError = () => {
    setError('Lỗi tải audio');
    setIsPlaying(false);
    setIsLoading(false);
  };

  // Handle audio load start
  const handleLoadStart = () => {
    setIsLoading(true);
    setError(null);
  };

  // Handle audio can play
  const handleCanPlay = () => {
    setIsLoading(false);
    setError(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  if (!audioUrl) {
    return (
      <div className={`text-gray-400 text-sm ${className}`}>
        Chưa có audio
      </div>
    );
  }

  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg p-3 ${className}`}>
      {/* Title */}
      {title && (
        <div className="text-sm font-medium text-gray-700 mb-2">
          {title}
        </div>
      )}

      {/* Audio Element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onDurationChange={handleDurationChange}
        onEnded={handleEnded}
        onError={handleError}
        onLoadStart={handleLoadStart}
        onCanPlay={handleCanPlay}
        preload="metadata"
      />

      {/* Error State */}
      {error && (
        <div className="text-red-500 text-sm mb-2 flex items-center gap-1">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Controls */}
      <div className="space-y-2">
        {/* Play/Pause Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlay}
            disabled={isLoading}
            className="flex items-center justify-center w-8 h-8 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-full transition-colors"
            title={isPlaying ? "Tạm dừng" : "Phát"}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <span className="text-sm">⏸️</span>
            ) : (
              <span className="text-sm">▶️</span>
            )}
          </button>
          
          <span className="text-xs text-gray-600">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / duration) * 100}%, #e5e7eb ${(currentTime / duration) * 100}%, #e5e7eb 100%)`
            }}
          />
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">🔊</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="w-16 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs text-gray-600">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>

      {/* Audio URL */}
      <div className="mt-2 text-xs text-gray-500 break-all">
        {audioUrl}
      </div>
    </div>
  );
}
