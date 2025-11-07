import { usePlayerStore } from "@/stores/usePlayerStore";
import { useEffect, useRef } from "react";

const AudioPlayer = () => {
	const audioRef = useRef<HTMLAudioElement>(null);
	const prevSongRef = useRef<string | null>(null);
	const isRestoredRef = useRef(false);

	const { currentSong, isPlaying, setCurrentTime } = usePlayerStore();

	// handle play/pause logic
	useEffect(() => {
		if (isPlaying) {
			audioRef.current?.play().catch((error) => {
				// Ignore AbortError - it's expected when quickly changing songs
				if (error.name !== 'AbortError') {
					console.error('Error playing audio:', error);
				}
			});
		} else {
			audioRef.current?.pause();
		}
	}, [isPlaying]);

	// handle song ends - Note: This is handled by PlaybackControls to respect repeat mode
	// Removed duplicate ended listener to prevent conflicts

	// Save current time periodically
	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;

		const saveCurrentTime = () => {
			if (!isNaN(audio.currentTime)) {
				setCurrentTime(audio.currentTime);
			}
		};

		// Save time every 2 seconds
		const interval = setInterval(saveCurrentTime, 1000);

		// Also save on pause
		audio.addEventListener("pause", saveCurrentTime);

		return () => {
			clearInterval(interval);
			audio.removeEventListener("pause", saveCurrentTime);
		};
	}, [setCurrentTime]);

	// handle song changes
	useEffect(() => {
		if (!audioRef.current || !currentSong) return;

		const audio = audioRef.current;

		// check if this is actually a new song
		const isSongChange = prevSongRef.current !== currentSong?.audioUrl;
		if (isSongChange) {
			audio.src = currentSong?.audioUrl;

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
				audio.play().catch((error) => {
					// Ignore AbortError - it's expected when quickly changing songs
					if (error.name !== 'AbortError') {
						console.error('Error playing audio:', error);
					}
				});
			}
		}
	}, [currentSong, isPlaying, setCurrentTime]);

	return <audio ref={audioRef} />;
};
export default AudioPlayer;
