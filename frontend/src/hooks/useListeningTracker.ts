import { useEffect, useRef } from "react";
import { axiosInstance } from "@/lib/axios";
import { usePlayerStore } from "@/stores/usePlayerStore";

export const useListeningTracker = () => {
	const { currentSong } = usePlayerStore();
	const startTimeRef = useRef<number>(0);
	const hasTrackedRef = useRef<boolean>(false);
	const currentSongIdRef = useRef<string | null>(null);

	useEffect(() => {
		// Reset tracking when song changes
		if (currentSong?._id !== currentSongIdRef.current) {
			startTimeRef.current = 0;
			hasTrackedRef.current = false;
			currentSongIdRef.current = currentSong?._id || null;
		}
	}, [currentSong]);

	const trackListening = async (currentTime: number, duration: number, completed: boolean = false) => {
		if (!currentSong?._id || duration === 0) return;

		// Calculate progress percentage
		const progressPercentage = Math.round((currentTime / duration) * 100);

		// Only track if progress >= 90% or explicitly marked as completed
		if (progressPercentage >= 90 || completed) {
			// Prevent duplicate tracking for the same song
			if (hasTrackedRef.current) return;
			hasTrackedRef.current = true;

			try {
				await axiosInstance.post("/listening/track", {
					songId: currentSong._id,
					currentTime,
					duration,
					completed: true,
				});

				console.log("✓ Listening tracked:", {
					song: currentSong.title,
					progress: progressPercentage + "%",
				});
			} catch (error) {
				console.error("Error tracking listening:", error);
			}
		}
	};

	return { trackListening };
};
