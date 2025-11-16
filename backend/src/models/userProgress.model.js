import mongoose from "mongoose";

const userProgressSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		songId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Song",
			required: true,
		},
		currentTime: {
			type: Number,
			required: true,
			default: 0,
		},
		duration: {
			type: Number,
			required: true,
			default: 0,
		},
		completed: {
			type: Boolean,
			default: false,
		},
		lastPlayedAt: {
			type: Date,
			default: Date.now,
		},
	},
	{ timestamps: true }
);

// Create compound index for faster queries
userProgressSchema.index({ userId: 1, songId: 1 }, { unique: true });

export const UserProgress = mongoose.model("UserProgress", userProgressSchema);
