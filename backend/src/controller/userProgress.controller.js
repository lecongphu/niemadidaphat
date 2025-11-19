import { UserProgress } from "../models/userProgress.model.js";

// Save or update user's listening progress
export const saveProgress = async (req, res, next) => {
	try {
		const { songId, currentTime, duration, completed } = req.body;

		// Check if user is authenticated
		if (!req.user || !req.user._id) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		const userId = req.user._id;

		// Validate required fields
		if (!songId || currentTime === undefined || duration === undefined) {
			console.log("Missing fields:", { songId, currentTime, duration });
			return res.status(400).json({ message: "Missing required fields" });
		}

		// Validate that values are numbers
		if (isNaN(currentTime) || isNaN(duration)) {
			console.log("Invalid numbers:", { currentTime, duration });
			return res.status(400).json({ message: "Invalid time values" });
		}

		console.log("Saving progress:", { userId, songId, currentTime, duration });

		// Upsert: update if exists, create if not
		const progress = await UserProgress.findOneAndUpdate(
			{ userId, songId },
			{
				currentTime: Math.max(0, currentTime), // Ensure non-negative
				duration: Math.max(0, duration),
				completed: completed || currentTime >= duration * 0.95, // Auto-mark as completed if > 95%
				lastPlayedAt: Date.now(),
			},
			{ upsert: true, new: true }
		);

		console.log("Progress saved successfully:", progress._id);
		res.json(progress);
	} catch (error) {
		console.error("Error in saveProgress:", error);
		console.error("Error details:", error.message);
		next(error);
	}
};

// Get progress for a specific song
export const getProgress = async (req, res, next) => {
	try {
		const { songId } = req.params;

		// Check if user is authenticated
		if (!req.user || !req.user._id) {
			return res.status(401).json({ message: "Unauthorized" });
		}

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
		// Check if user is authenticated
		if (!req.user || !req.user._id) {
			return res.status(401).json({ message: "Unauthorized" });
		}

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

		// Check if user is authenticated
		if (!req.user || !req.user._id) {
			return res.status(401).json({ message: "Unauthorized" });
		}

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
		// Check if user is authenticated
		if (!req.user || !req.user._id) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		const userId = req.user._id;

		await UserProgress.deleteMany({ userId });

		res.json({ message: "All progress cleared successfully" });
	} catch (error) {
		console.error("Error in clearAllProgress:", error);
		next(error);
	}
};
