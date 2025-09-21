"use client";

import { useAudio } from '@/contexts/AudioContext';
import { secondsToHumanReadable } from '@/lib/durationUtils';

export default function PersistentPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    pause,
    resume,
    playNext,
    playPrevious,
    seek,
    setVolume,
  } = useAudio();

  if (!currentTrack) {
    return null;
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    seek(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-amber-100 via-amber-200 to-amber-300 border-t-2 border-amber-400 shadow-lg z-50 persistent-player">
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* Progress Bar */}
        <div 
          className="w-full h-1 bg-amber-300 rounded-full cursor-pointer mb-3"
          onClick={handleSeek}
        >
          <div 
            className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-200"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Player Controls */}
        <div className="flex items-center justify-between">
          {/* Track Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-white text-xl">🎵</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-amber-900 truncate">
                {currentTrack.title}
              </div>
              <div className="text-sm text-amber-700 truncate">
                {currentTrack.artist || currentTrack.album || 'Unknown Artist'}
              </div>
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex items-center gap-4 mx-4">
            {/* Previous Button */}
            <button
              onClick={playPrevious}
              className="p-2 rounded-full hover:bg-amber-300/50 transition-colors"
              title="Previous track"
            >
              <span className="text-amber-800 text-xl">⏮️</span>
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={isPlaying ? pause : resume}
              className="p-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              <span className="text-white text-xl">
                {isPlaying ? '⏸️' : '▶️'}
              </span>
            </button>

            {/* Next Button */}
            <button
              onClick={playNext}
              className="p-2 rounded-full hover:bg-amber-300/50 transition-colors"
              title="Next track"
            >
              <span className="text-amber-800 text-xl">⏭️</span>
            </button>
          </div>

          {/* Time & Volume */}
          <div className="flex items-center gap-4 min-w-0 flex-1 justify-end">
            {/* Time Display */}
            <div className="text-sm text-amber-700 font-mono whitespace-nowrap">
              {secondsToHumanReadable(currentTime)} / {secondsToHumanReadable(duration)}
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <span className="text-amber-700 text-sm">🔊</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-amber-300 rounded-lg appearance-none cursor-pointer"
                title={`Volume: ${Math.round(volume * 100)}%`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
