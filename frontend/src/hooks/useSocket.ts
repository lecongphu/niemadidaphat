import { useEffect, useRef } from "react";
import { getSocket } from "@/lib/socket";
import type { Socket } from "socket.io-client";

interface UseSocketOptions {
	onListeningStatsUpdated?: () => void;
	onAlbumCreated?: () => void;
	onAlbumDeleted?: () => void;
	onTeacherCreated?: () => void;
	onTeacherUpdated?: () => void;
	onTeacherDeleted?: () => void;
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

		// Listen for album events
		if (options.onAlbumCreated) {
			socketRef.current.on("album_created", options.onAlbumCreated);
		}
		if (options.onAlbumDeleted) {
			socketRef.current.on("album_deleted", options.onAlbumDeleted);
		}

		// Listen for teacher events
		if (options.onTeacherCreated) {
			socketRef.current.on("teacher_created", options.onTeacherCreated);
		}
		if (options.onTeacherUpdated) {
			socketRef.current.on("teacher_updated", options.onTeacherUpdated);
		}
		if (options.onTeacherDeleted) {
			socketRef.current.on("teacher_deleted", options.onTeacherDeleted);
		}

		// Cleanup
		return () => {
			if (socketRef.current) {
				if (options.onListeningStatsUpdated) {
					socketRef.current.off("listening_stats_updated", options.onListeningStatsUpdated);
				}
				if (options.onAlbumCreated) {
					socketRef.current.off("album_created", options.onAlbumCreated);
				}
				if (options.onAlbumDeleted) {
					socketRef.current.off("album_deleted", options.onAlbumDeleted);
				}
				if (options.onTeacherCreated) {
					socketRef.current.off("teacher_created", options.onTeacherCreated);
				}
				if (options.onTeacherUpdated) {
					socketRef.current.off("teacher_updated", options.onTeacherUpdated);
				}
				if (options.onTeacherDeleted) {
					socketRef.current.off("teacher_deleted", options.onTeacherDeleted);
				}
			}
		};
	}, [
		options.onListeningStatsUpdated,
		options.onAlbumCreated,
		options.onAlbumDeleted,
		options.onTeacherCreated,
		options.onTeacherUpdated,
		options.onTeacherDeleted,
	]);

	return socketRef.current;
};
