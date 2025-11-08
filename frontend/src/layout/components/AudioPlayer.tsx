import { usePlayerStore } from "@/stores/usePlayerStore";
import { useEffect, useRef, useCallback } from "react";

const AudioPlayer = () => {
	const audioRef = useRef<HTMLAudioElement>(null);
	const prevSongRef = useRef<string | null>(null);
	const isRestoredRef = useRef(false);
	const retryCountRef = useRef(0);
	const MAX_RETRIES = 3;

	const { currentSong, isPlaying, setCurrentTime, volume } = usePlayerStore();

	// Memoized error handler
	const handlePlayError = useCallback((error: Error) => {
		// Ignore AbortError - it's expected when quickly changing songs
		if (error.name === 'AbortError') return;

		console.error('Error playing audio:', error);

		// Retry logic for network errors
		if (retryCountRef.current < MAX_RETRIES && audioRef.current) {
			retryCountRef.current++;
			console.log(`Retrying audio playback (${retryCountRef.current}/${MAX_RETRIES})...`);

			setTimeout(() => {
				audioRef.current?.play().catch(handlePlayError);
			}, 1000 * retryCountRef.current); // Exponential backoff
		}
	}, []);

	// Handle play/pause logic
	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;

		if (isPlaying) {
			const playPromise = audio.play();
			if (playPromise !== undefined) {
				playPromise.catch(handlePlayError);
			}
		} else {
			audio.pause();
		}
	}, [isPlaying, handlePlayError]);

	// Sync volume from store
	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;

		audio.volume = volume / 100;
	}, [volume]);

	// Save current time periodically with optimized interval
	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;

		const saveCurrentTime = () => {
			if (!isNaN(audio.currentTime)) {
				setCurrentTime(audio.currentTime);
			}
		};

		// Save time every 1 second when playing, less frequent when paused
		const interval = setInterval(saveCurrentTime, isPlaying ? 1000 : 5000);

		// Also save on pause
		audio.addEventListener("pause", saveCurrentTime);

		return () => {
			clearInterval(interval);
			audio.removeEventListener("pause", saveCurrentTime);
		};
	}, [setCurrentTime, isPlaying]);

	// Handle song changes with preloading
	useEffect(() => {
		if (!audioRef.current || !currentSong) return;

		const audio = audioRef.current;

		// Check if this is actually a new song
		const isSongChange = prevSongRef.current !== currentSong?.audioUrl;
		if (isSongChange) {
			// Reset retry counter for new song
			retryCountRef.current = 0;

			audio.src = currentSong?.audioUrl;

			// Preload audio for better UX
			audio.preload = "auto";

			// Get current stored time for restoration
			const storedTime = usePlayerStore.getState().currentTime;

			// Restore saved position on first load or reset to 0 for new song
			if (!isRestoredRef.current && storedTime > 0) {
				// Wait for metadata to load before setting time
				const handleLoadedMetadata = () => {
					if (audio.duration >= storedTime) {
						audio.currentTime = storedTime;
						isRestoredRef.current = true;
					}
				};

				audio.addEventListener("loadedmetadata", handleLoadedMetadata, { once: true });
			} else {
				audio.currentTime = 0;
				setCurrentTime(0);
			}

			prevSongRef.current = currentSong?.audioUrl;

			if (isPlaying) {
				// Use load() to start buffering immediately
				audio.load();
				const playPromise = audio.play();
				if (playPromise !== undefined) {
					playPromise.catch(handlePlayError);
				}
			}
		}
	}, [currentSong, isPlaying, setCurrentTime, handlePlayError]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			const audio = audioRef.current;
			if (audio) {
				audio.pause();
				audio.src = "";
			}
		};
	}, []);

	return (
		<audio
			ref={audioRef}
			preload="auto"
		/>
	);
};

export default AudioPlayer;
