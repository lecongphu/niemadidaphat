import { useEffect, useRef } from "react";
import { getSocket } from "@/lib/socket";
import type { Socket } from "socket.io-client";

interface UseSocketOptions {
	onListeningStatsUpdated?: () => void;
}

export const useSocket = (options: UseSocketOptions = {}) => {
	const socketRef = useRef<Socket | null>(null);

	useEffect(() => {
		// Initialize socket connection
		socketRef.current = getSocket();

		// Listen for listening stats updates
		if (options.onListeningStatsUpdated) {
			socketRef.current.on("listening_stats_updated", options.onListeningStatsUpdated);
		}

		// Cleanup
		return () => {
			if (socketRef.current && options.onListeningStatsUpdated) {
				socketRef.current.off("listening_stats_updated", options.onListeningStatsUpdated);
			}
		};
	}, [options.onListeningStatsUpdated]);

	return socketRef.current;
};
