import mongoose from "mongoose";

const listeningHistorySchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		song: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Song",
			required: true,
			index: true,
		},
		// Track whether the song was completed (listened >= 90%)
		completed: {
			type: Boolean,
			default: false,
		},
		// Percentage of song listened (0-100)
		progressPercentage: {
			type: Number,
			default: 0,
			min: 0,
			max: 100,
		},
		// Duration listened in seconds
		listenedDuration: {
			type: Number,
			default: 0,
		},
		// Total song duration in seconds
		totalDuration: {
			type: Number,
			required: true,
		},
		// Start time of listening session
		startedAt: {
			type: Date,
			default: Date.now,
		},
		// End time of listening session (when completed or stopped)
		completedAt: {
			type: Date,
		},
	},
	{ timestamps: true }
);

// Compound index for efficient querying
listeningHistorySchema.index({ user: 1, song: 1, createdAt: -1 });
listeningHistorySchema.index({ completed: 1, createdAt: -1 });

// Virtual for listening time in minutes
listeningHistorySchema.virtual("listenedMinutes").get(function () {
	return Math.round(this.listenedDuration / 60);
});

export const ListeningHistory = mongoose.model("ListeningHistory", listeningHistorySchema);
