import { usePlayerStore } from "@/stores/usePlayerStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { axiosInstance } from "@/lib/axios";
import { useEffect, useRef, useCallback } from "react";

const AudioPlayer = () => {
	const audioRef = useRef<HTMLAudioElement>(null);
	const prevSongRef = useRef<string | null>(null);
	const isRestoredRef = useRef(false);
	const retryCountRef = useRef(0);
	const MAX_RETRIES = 3;

	const { currentSong, isPlaying, setCurrentTime, volume } = usePlayerStore();
	const { user } = useAuthStore();

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

	// Save current time to store and database
	useEffect(() => {
		const audio = audioRef.current;
		if (!audio || !currentSong) return;

		const saveCurrentTime = () => {
			if (!isNaN(audio.currentTime)) {
				setCurrentTime(audio.currentTime);
			}
		};

		// Save to database (only for authenticated users)
		const saveToDatabase = async () => {
			if (!user || !currentSong || isNaN(audio.currentTime) || isNaN(audio.duration)) return;

			try {
				await axiosInstance.post("/progress", {
					songId: currentSong._id,
					currentTime: audio.currentTime,
					duration: audio.duration,
				});
			} catch (error) {
				console.error("Failed to save progress to database:", error);
			}
		};

		// Save to localStorage every 1 second when playing
		const localInterval = setInterval(saveCurrentTime, isPlaying ? 1000 : 5000);

		// Save to database every 5 seconds when playing (less frequent to reduce API calls)
		const dbInterval = user ? setInterval(saveToDatabase, isPlaying ? 5000 : 0) : null;

		// Also save on pause
		const handlePause = () => {
			saveCurrentTime();
			if (user) {
				saveToDatabase();
			}
		};

		audio.addEventListener("pause", handlePause);

		return () => {
			clearInterval(localInterval);
			if (dbInterval) clearInterval(dbInterval);
			audio.removeEventListener("pause", handlePause);
		};
	}, [setCurrentTime, isPlaying, currentSong, user]);

	// Handle song changes with preloading and progress restoration
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

			// Load progress from database if user is authenticated
			const loadProgressFromDB = async () => {
				if (!user || !currentSong) return null;

				try {
					const response = await axiosInstance.get(`/progress/${currentSong._id}`);
					return response.data.currentTime || 0;
				} catch (error) {
					console.error("Failed to load progress from database:", error);
					return null;
				}
			};

			// Restore saved position
			const restorePosition = async () => {
				// Try to load from database first (for authenticated users)
				let timeToRestore = 0;

				if (user) {
					const dbTime = await loadProgressFromDB();
					if (dbTime !== null) {
						timeToRestore = dbTime;
					}
				}

				// Fallback to localStorage if no database progress
				if (timeToRestore === 0) {
					const storedTime = usePlayerStore.getState().currentTime;
					if (!isRestoredRef.current && storedTime > 0) {
						timeToRestore = storedTime;
					}
				}

				// Wait for metadata to load before setting time
				const handleLoadedMetadata = () => {
					if (timeToRestore > 0 && audio.duration >= timeToRestore) {
						audio.currentTime = timeToRestore;
						setCurrentTime(timeToRestore);
						isRestoredRef.current = true;
					} else {
						audio.currentTime = 0;
						setCurrentTime(0);
					}
				};

				audio.addEventListener("loadedmetadata", handleLoadedMetadata, { once: true });
			};

			restorePosition();

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
	}, [currentSong, isPlaying, setCurrentTime, handlePlayError, user]);

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
