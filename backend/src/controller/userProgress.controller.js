import { UserProgress } from "../models/userProgress.model.js";

// Save or update user's listening progress
export const saveProgress = async (req, res, next) => {
	try {
		const { songId, currentTime, duration, completed } = req.body;
		const userId = req.user._id;

		if (!songId || currentTime === undefined || duration === undefined) {
			return res.status(400).json({ message: "Missing required fields" });
		}

		// Upsert: update if exists, create if not
		const progress = await UserProgress.findOneAndUpdate(
			{ userId, songId },
			{
				currentTime,
				duration,
				completed: completed || currentTime >= duration * 0.95, // Auto-mark as completed if > 95%
				lastPlayedAt: Date.now(),
			},
			{ upsert: true, new: true }
		);

		res.json(progress);
	} catch (error) {
		console.error("Error in saveProgress:", error);
		next(error);
	}
};

// Get progress for a specific song
export const getProgress = async (req, res, next) => {
	try {
		const { songId } = req.params;
		const userId = req.user._id;

		const progress = await UserProgress.findOne({ userId, songId });

		if (!progress) {
			return res.json({ currentTime: 0, duration: 0, completed: false });
		}

		res.json(progress);
	} catch (error) {
		console.error("Error in getProgress:", error);
		next(error);
	}
};

// Get all progress for current user
export const getAllProgress = async (req, res, next) => {
	try {
		const userId = req.user._id;

		const progressList = await UserProgress.find({ userId })
			.populate("songId", "title imageUrl audioUrl")
			.sort({ lastPlayedAt: -1 })
			.limit(50); // Limit to last 50 played songs

		res.json(progressList);
	} catch (error) {
		console.error("Error in getAllProgress:", error);
		next(error);
	}
};

// Delete progress for a specific song
export const deleteProgress = async (req, res, next) => {
	try {
		const { songId } = req.params;
		const userId = req.user._id;

		await UserProgress.findOneAndDelete({ userId, songId });

		res.json({ message: "Progress deleted successfully" });
	} catch (error) {
		console.error("Error in deleteProgress:", error);
		next(error);
	}
};

// Clear all progress for current user
export const clearAllProgress = async (req, res, next) => {
	try {
		const userId = req.user._id;

		await UserProgress.deleteMany({ userId });

		res.json({ message: "All progress cleared successfully" });
	} catch (error) {
		console.error("Error in clearAllProgress:", error);
		next(error);
	}
};
