"use client";

import { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';

export interface AudioTrack {
  id: string;
  title: string;
  src: string;
  artist?: string;
  album?: string;
  duration?: number;
  thumbnail?: string;
}

interface AudioContextType {
  // Current track
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  
  // Controls
  play: (track: AudioTrack) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  
  // Playlist
  playlist: AudioTrack[];
  currentIndex: number;
  addToPlaylist: (track: AudioTrack) => void;
  removeFromPlaylist: (trackId: string) => void;
  playNext: () => void;
  playPrevious: () => void;
  clearPlaylist: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}

interface AudioProviderProps {
  children: ReactNode;
}

export function AudioProvider({ children }: AudioProviderProps) {
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [playlist, setPlaylist] = useState<AudioTrack[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const playTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio element
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio();
      audioRef.current.preload = 'metadata';
      
      // Event listeners
      audioRef.current.addEventListener('loadedmetadata', () => {
        if (audioRef.current) {
          setDuration(audioRef.current.duration);
        }
      });
      
      audioRef.current.addEventListener('timeupdate', () => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
      });
      
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(0);
        // Auto-play next track if available
        if (currentIndex < playlist.length - 1) {
          playNext();
        }
      });
      
      audioRef.current.addEventListener('play', () => setIsPlaying(true));
      audioRef.current.addEventListener('pause', () => setIsPlaying(false));
      audioRef.current.addEventListener('error', (ev) => {
        setIsPlaying(false);
        const target = ev.currentTarget as HTMLAudioElement | null;
        const mediaErr = target?.error;
        
        if (mediaErr) {
          const code = mediaErr.code;
          const codeText =
            code === 1 ? 'MEDIA_ERR_ABORTED' :
            code === 2 ? 'MEDIA_ERR_NETWORK' :
            code === 3 ? 'MEDIA_ERR_DECODE' :
            code === 4 ? 'MEDIA_ERR_SRC_NOT_SUPPORTED' : 'UNKNOWN_ERROR';
          
          console.warn('Audio playback error:', {
            code,
            codeText,
            src: target?.currentSrc || target?.src,
            message: mediaErr.message || 'No error message'
          });

          // Fallback: thử phát lại một lần với URL gốc (không encode)
          if (code === 4 && currentTrack && target?.src.includes('%')) {
            console.warn('Retrying with original URL...');
            setTimeout(() => {
              if (audioRef.current && currentTrack) {
                audioRef.current.src = currentTrack.src; // URL gốc
                audioRef.current.load();
                audioRef.current.play().catch(err => {
                  console.warn('Fallback also failed:', err);
                });
              }
            }, 500);
          }
        } else {
          console.warn('Audio error event fired but no MediaError available');
        }
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (playTimeoutRef.current) {
        clearTimeout(playTimeoutRef.current);
      }
    };
  }, [currentIndex, playlist.length]);

  // Update audio source when track changes
  useEffect(() => {
    if (audioRef.current && currentTrack) {
      const safeSrc = encodeURI(currentTrack.src);
      audioRef.current.src = safeSrc;
      audioRef.current.load();
    }
  }, [currentTrack]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const play = (track: AudioTrack) => {
    // Debug: Log track being played
    console.log('DEBUG - AudioContext.play() called with track:', {
      id: track.id,
      title: track.title,
      src: track.src,
      artist: track.artist,
      album: track.album
    });
    
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    setCurrentTrack(track);
    
    // Add to playlist if not already there
    setPlaylist(prev => {
      const exists = prev.find(t => t.id === track.id);
      if (!exists) {
        const newPlaylist = [...prev, track];
        setCurrentIndex(newPlaylist.length - 1);
        return newPlaylist;
      } else {
        setCurrentIndex(prev.findIndex(t => t.id === track.id));
        return prev;
      }
    });
    
    // Clear any existing timeout
    if (playTimeoutRef.current) {
      clearTimeout(playTimeoutRef.current);
    }
    
    // Small delay to ensure audio element is ready
    playTimeoutRef.current = setTimeout(() => {
      setIsPlaying(true);
      if (audioRef.current) {
        const safeSrc = encodeURI(track.src);
        audioRef.current.src = safeSrc;
        audioRef.current.load();
        audioRef.current.play().catch(error => {
          console.warn('Audio play failed:', error);
          setIsPlaying(false);
        });
      }
    }, 100);
  };

  const pause = () => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const resume = () => {
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.play().catch(console.error);
    }
  };

  const stop = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume);
  };

  const addToPlaylist = (track: AudioTrack) => {
    setPlaylist(prev => {
      const exists = prev.find(t => t.id === track.id);
      return exists ? prev : [...prev, track];
    });
  };

  const removeFromPlaylist = (trackId: string) => {
    setPlaylist(prev => {
      const newPlaylist = prev.filter(t => t.id !== trackId);
      const removedIndex = prev.findIndex(t => t.id === trackId);
      
      if (removedIndex !== -1 && removedIndex <= currentIndex) {
        setCurrentIndex(Math.max(0, currentIndex - 1));
      }
      
      return newPlaylist;
    });
  };

  const playNext = () => {
    if (currentIndex < playlist.length - 1) {
      const nextTrack = playlist[currentIndex + 1];
      
      // Stop current audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      
      setCurrentTrack(nextTrack);
      setCurrentIndex(currentIndex + 1);
      
      // Small delay to ensure audio element is ready
      setTimeout(() => {
        setIsPlaying(true);
        if (audioRef.current) {
          const safeSrc = encodeURI(nextTrack.src);
          audioRef.current.src = safeSrc;
          audioRef.current.load();
          audioRef.current.play().catch(error => {
            console.warn('Audio play failed:', error);
            setIsPlaying(false);
          });
        }
      }, 100);
    }
  };

  const playPrevious = () => {
    if (currentIndex > 0) {
      const prevTrack = playlist[currentIndex - 1];
      
      // Stop current audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      
      setCurrentTrack(prevTrack);
      setCurrentIndex(currentIndex - 1);
      
      // Small delay to ensure audio element is ready
      setTimeout(() => {
        setIsPlaying(true);
        if (audioRef.current) {
          const safeSrc = encodeURI(prevTrack.src);
          audioRef.current.src = safeSrc;
          audioRef.current.load();
          audioRef.current.play().catch(error => {
            console.warn('Audio play failed:', error);
            setIsPlaying(false);
          });
        }
      }, 100);
    }
  };

  const clearPlaylist = () => {
    setPlaylist([]);
    setCurrentIndex(-1);
    setCurrentTrack(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  };

  const value: AudioContextType = {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    play,
    pause,
    resume,
    stop,
    seek,
    setVolume,
    playlist,
    currentIndex,
    addToPlaylist,
    removeFromPlaylist,
    playNext,
    playPrevious,
    clearPlaylist,
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
}
