import { Server } from "socket.io";
import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";

let io;

export const initializeSocket = (server) => {
	io = new Server(server, {
		cors: {
			origin: process.env.NODE_ENV === "production"
				? process.env.FRONTEND_URL || "https://niemadidaphat.com"
				: "http://localhost:3000",
			credentials: true,
		},
	});

	const userSockets = new Map(); // { userId: socketId}
	const userActivities = new Map(); // {userId: activity}

	io.on("connection", (socket) => {
		socket.on("user_connected", async (userId) => {
			userSockets.set(userId, socket.id);
			userActivities.set(userId, "Idle");

			// Update user online status in database
			try {
				await User.findByIdAndUpdate(userId, {
					isOnline: true,
					lastActive: new Date(),
				});
			} catch (error) {
				console.error("Error updating user online status:", error);
			}

			// broadcast to all connected sockets that this user just logged in
			io.emit("user_connected", userId);

			socket.emit("users_online", Array.from(userSockets.keys()));

			io.emit("activities", Array.from(userActivities.entries()));
		});

		socket.on("update_activity", ({ userId, activity }) => {
			console.log("activity updated", userId, activity);
			userActivities.set(userId, activity);
			io.emit("activity_updated", { userId, activity });
		});

		socket.on("send_message", async (data) => {
			try {
				const { senderId, receiverId, content } = data;

				const message = await Message.create({
					senderId,
					receiverId,
					content,
				});

				// send to receiver in realtime, if they're online
				const receiverSocketId = userSockets.get(receiverId);
				if (receiverSocketId) {
					io.to(receiverSocketId).emit("receive_message", message);
				}

				socket.emit("message_sent", message);
			} catch (error) {
				console.error("Message error:", error);
				socket.emit("message_error", error.message);
			}
		});

		socket.on("disconnect", async () => {
			let disconnectedUserId;
			for (const [userId, socketId] of userSockets.entries()) {
				// find disconnected user
				if (socketId === socket.id) {
					disconnectedUserId = userId;
					userSockets.delete(userId);
					userActivities.delete(userId);
					break;
				}
			}
			if (disconnectedUserId) {
				// Update user offline status in database
				try {
					await User.findByIdAndUpdate(disconnectedUserId, {
						isOnline: false,
						lastActive: new Date(),
					});
				} catch (error) {
					console.error("Error updating user offline status:", error);
				}

				io.emit("user_disconnected", disconnectedUserId);
			}
		});
	});

	return io;
};

// Export function to get io instance
export const getIO = () => {
	if (!io) {
		throw new Error("Socket.io not initialized");
	}
	return io;
};
