import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
	if (!socket) {
		const socketURL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
		socket = io(socketURL, {
			autoConnect: true,
			reconnection: true,
			reconnectionDelay: 1000,
			reconnectionAttempts: 5,
		});

		socket.on("connect", () => {
			console.log("Connected to Socket.IO server");
		});

		socket.on("disconnect", () => {
			console.log("Disconnected from Socket.IO server");
		});

		socket.on("connect_error", (error) => {
			console.error("Socket connection error:", error);
		});
	}

	return socket;
};

export const disconnectSocket = () => {
	if (socket) {
		socket.disconnect();
		socket = null;
	}
};
