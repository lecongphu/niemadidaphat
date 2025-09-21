"use client";

import { useEffect, useMemo, useRef } from "react";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";

type PlayerProps = {
  title?: string;
  src: string;
  persistKey?: string; // unique key to store last position (e.g., productId/slug)
};

export default function Player({ title = "Trình phát", src, persistKey }: PlayerProps) {
  const audioRef = useRef<AudioPlayer>(null);
  const storageKey = useMemo(() => (persistKey ? `player:lastpos:${persistKey}` : null), [persistKey]);

  // Load saved position when component mounts
  useEffect(() => {
    if (!storageKey) return;
    
    const loadSavedPosition = () => {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved && audioRef.current?.audio.current) {
          const t = Number(saved);
          if (!Number.isNaN(t)) {
            audioRef.current.audio.current.currentTime = t;
          }
        }
      } catch {}
    };

    // Load position after audio is ready
    const timer = setTimeout(loadSavedPosition, 500);
    return () => clearTimeout(timer);
  }, [storageKey, src]);

  // Save position periodically
  const handleTimeUpdate = () => {
    if (!storageKey || !audioRef.current?.audio.current) return;
    try {
      const currentTime = audioRef.current.audio.current.currentTime;
      localStorage.setItem(storageKey, String(currentTime));
    } catch {}
  };

  return (
    <div className="serene-card p-4 sm:p-6 flex flex-col gap-3 sm:gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-6 h-6 sm:w-8 sm:h-8 lotus-gradient rounded-full flex items-center justify-center">
            <span className="text-white text-xs sm:text-sm">🎵</span>
          </div>
          <h4 className="font-semibold text-base sm:text-lg wisdom-text truncate">{title}</h4>
        </div>
        <div className="text-xs text-amber-600/70 bg-amber-50 px-2 py-1 rounded-full whitespace-nowrap">
          Âm thanh thanh tịnh
        </div>
      </div>
      
      <div className="rounded-xl overflow-hidden peaceful-shadow">
        <AudioPlayer
          ref={audioRef}
          src={src}
          onPlay={() => {}}
          onPause={() => {}}
          onListen={handleTimeUpdate}
          showSkipControls={true}
          showJumpControls={true}
          showDownloadProgress={true}
          showFilledProgress={true}
          customAdditionalControls={[
            <div key="playback-rate" className="flex items-center gap-1 sm:gap-2 text-xs">
              <span className="text-amber-700 font-medium hidden sm:inline">Tốc độ:</span>
              <span className="text-amber-700 font-medium sm:hidden">⚡</span>
              <select
                className="bg-amber-50 border border-amber-200 rounded px-1 sm:px-2 py-1 text-xs text-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-300"
                onChange={(e) => {
                  if (audioRef.current?.audio.current) {
                    audioRef.current.audio.current.playbackRate = Number(e.target.value);
                  }
                }}
                defaultValue="1"
              >
                <option value="0.5">0.5x</option>
                <option value="0.75">0.75x</option>
                <option value="1">1x</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
                <option value="2">2x</option>
              </select>
            </div>
          ]}
          style={{
            backgroundColor: "rgba(254, 243, 199, 0.5)",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(245, 158, 11, 0.1)",
            border: "1px solid rgba(251, 191, 36, 0.2)",
          }}
        />
      </div>
      <div className="text-center">
        <p className="text-xs sm:text-sm text-amber-600/70 italic">
          &ldquo;Lắng nghe để thấu hiểu, thấu hiểu để giác ngộ&rdquo; 🪷
        </p>
      </div>
    </div>
  );
}


