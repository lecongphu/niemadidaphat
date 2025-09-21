"use client";

import { useEffect, useMemo } from "react";
import { useAudio } from "@/contexts/AudioContext";

type GlobalPlayerProps = {
  title?: string;
  src: string;
  persistKey?: string;
  artist?: string;
  album?: string;
  thumbnail?: string;
};

export default function GlobalPlayer({ 
  title = "Trình phát", 
  src, 
  persistKey,
  artist,
  album,
  thumbnail 
}: GlobalPlayerProps) {
  const { play, currentTrack, isPlaying } = useAudio();
  const storageKey = useMemo(() => (persistKey ? `player:lastpos:${persistKey}` : null), [persistKey]);

  // Load saved position when component mounts
  useEffect(() => {
    if (!storageKey) return;
    
    const savedPosition = localStorage.getItem(storageKey);
    if (savedPosition) {
      const position = parseFloat(savedPosition);
      if (position > 0) {
        // Small delay to ensure audio is loaded
        setTimeout(() => {
          const audioElement = document.querySelector(`audio[data-persist-key="${persistKey}"]`) as HTMLAudioElement;
          if (audioElement && !isNaN(position)) {
            audioElement.currentTime = position;
          }
        }, 500);
      }
    }
  }, [storageKey, persistKey]);

  const handlePlay = () => {
    // Debug: Log src to check if it's correct
    console.log('DEBUG - GlobalPlayer src:', src);
    console.log('DEBUG - GlobalPlayer persistKey:', persistKey);
    
    const track = {
      id: persistKey || src,
      title,
      src,
      artist,
      album,
      thumbnail,
    };
    
    // Prevent multiple simultaneous play calls
    if (isPlaying && currentTrack?.id === track.id) {
      return; // Already playing this track
    }
    
    play(track);
  };

  const handleListen = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    const target = e.target as HTMLAudioElement;
    if (storageKey && target.currentTime > 0) {
      localStorage.setItem(storageKey, target.currentTime.toString());
    }
  };

  const isCurrentTrack = currentTrack?.id === (persistKey || src);

  return (
    <div className="w-full relative">
      {/* Simplified player for non-current tracks */}
      {!isCurrentTrack ? (
        <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg p-4 flex items-center justify-center">
          <button
            onClick={handlePlay}
            className="p-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg"
            title={`Play: ${title}`}
          >
            <span className="text-white text-xl">▶️</span>
          </button>
          <div className="ml-4 flex-1">
            <div className="font-medium text-amber-900">{title}</div>
            <div className="text-sm text-amber-700">{artist || album}</div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-amber-100 to-amber-200 rounded-lg p-4 flex items-center justify-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">🎵</span>
            </div>
            <div className="flex-1">
              <div className="font-medium text-amber-900">{title}</div>
              <div className="text-sm text-amber-700">{artist || album}</div>
            </div>
            <div className="text-sm text-amber-600 font-medium">
              Now Playing
            </div>
          </div>
        </div>
      )}
      
      {/* Hidden audio element for position tracking */}
      <audio
        src={src}
        onTimeUpdate={handleListen}
        data-persist-key={persistKey}
        style={{ display: 'none' }}
      />
    </div>
  );
}
