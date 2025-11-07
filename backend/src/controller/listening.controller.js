import { ListeningHistory } from "../models/listeningHistory.model.js";
import { Song } from "../models/song.model.js";

// Track listening progress
export const trackListening = async (req, res, next) => {
	try {
		const { songId, currentTime, duration, completed } = req.body;
		const userId = req.auth.userId;

		if (!songId || currentTime === undefined || !duration) {
			return res.status(400).json({ message: "Missing required fields" });
		}

		// Calculate progress percentage
		const progressPercentage = Math.min(Math.round((currentTime / duration) * 100), 100);

		// Consider completed if listened >= 90% of the song
		const isCompleted = completed || progressPercentage >= 90;

		// Create listening history record
		const listeningRecord = await ListeningHistory.create({
			user: userId,
			song: songId,
			completed: isCompleted,
			progressPercentage,
			listenedDuration: currentTime,
			totalDuration: duration,
			startedAt: new Date(),
			completedAt: isCompleted ? new Date() : null,
		});

		res.json({
			message: "Listening tracked successfully",
			completed: isCompleted,
			progressPercentage,
		});
	} catch (error) {
		console.log("Error tracking listening:", error);
		next(error);
	}
};

// Get user's listening statistics
export const getUserListeningStats = async (req, res, next) => {
	try {
		const userId = req.auth.userId;

		// Total listening time (in seconds)
		const totalListeningTime = await ListeningHistory.aggregate([
			{ $match: { user: userId } },
			{ $group: { _id: null, total: { $sum: "$listenedDuration" } } },
		]);

		// Total completed songs count
		const completedCount = await ListeningHistory.countDocuments({
			user: userId,
			completed: true,
		});

		// Total listening sessions
		const totalSessions = await ListeningHistory.countDocuments({ user: userId });

		// Most listened songs (top 10)
		const topSongs = await ListeningHistory.aggregate([
			{ $match: { user: userId, completed: true } },
			{ $group: { _id: "$song", count: { $sum: 1 } } },
			{ $sort: { count: -1 } },
			{ $limit: 10 },
			{
				$lookup: {
					from: "songs",
					localField: "_id",
					foreignField: "_id",
					as: "songDetails",
				},
			},
			{ $unwind: "$songDetails" },
			{
				$lookup: {
					from: "teachers",
					localField: "songDetails.teacher",
					foreignField: "_id",
					as: "teacherDetails",
				},
			},
			{ $unwind: "$teacherDetails" },
			{
				$project: {
					_id: 1,
					count: 1,
					title: "$songDetails.title",
					imageUrl: "$songDetails.imageUrl",
					teacher: {
						_id: "$teacherDetails._id",
						name: "$teacherDetails.name",
					},
				},
			},
		]);

		// Recent listening history (last 20)
		const recentHistory = await ListeningHistory.find({ user: userId })
			.sort({ createdAt: -1 })
			.limit(20)
			.populate({
				path: "song",
				select: "title imageUrl audioUrl",
				populate: {
					path: "teacher",
					select: "name",
				},
			});

		// Listening stats by date (last 30 days)
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

		const dailyStats = await ListeningHistory.aggregate([
			{
				$match: {
					user: userId,
					createdAt: { $gte: thirtyDaysAgo },
				},
			},
			{
				$group: {
					_id: {
						$dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
					},
					totalTime: { $sum: "$listenedDuration" },
					completedSongs: {
						$sum: { $cond: ["$completed", 1, 0] },
					},
				},
			},
			{ $sort: { _id: 1 } },
		]);

		res.json({
			totalListeningTime: totalListeningTime[0]?.total || 0,
			totalListeningMinutes: Math.round((totalListeningTime[0]?.total || 0) / 60),
			totalListeningHours: Math.round((totalListeningTime[0]?.total || 0) / 3600),
			completedSongsCount: completedCount,
			totalSessions,
			topSongs,
			recentHistory,
			dailyStats,
		});
	} catch (error) {
		console.log("Error getting listening stats:", error);
		next(error);
	}
};

// Get global listening statistics (for admin)
export const getGlobalListeningStats = async (req, res, next) => {
	try {
		// Total listening time across all users
		const globalListeningTime = await ListeningHistory.aggregate([
			{ $group: { _id: null, total: { $sum: "$listenedDuration" } } },
		]);

		// Total unique listeners
		const uniqueListeners = await ListeningHistory.distinct("user");

		// Most popular songs
		const popularSongs = await ListeningHistory.aggregate([
			{ $match: { completed: true } },
			{ $group: { _id: "$song", listens: { $sum: 1 } } },
			{ $sort: { listens: -1 } },
			{ $limit: 20 },
			{
				$lookup: {
					from: "songs",
					localField: "_id",
					foreignField: "_id",
					as: "songDetails",
				},
			},
			{ $unwind: "$songDetails" },
			{
				$lookup: {
					from: "teachers",
					localField: "songDetails.teacher",
					foreignField: "_id",
					as: "teacherDetails",
				},
			},
			{ $unwind: "$teacherDetails" },
			{
				$project: {
					_id: 1,
					listens: 1,
					title: "$songDetails.title",
					imageUrl: "$songDetails.imageUrl",
					teacher: {
						name: "$teacherDetails.name",
					},
				},
			},
		]);

		// Listening stats by date (last 30 days)
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

		const dailyGlobalStats = await ListeningHistory.aggregate([
			{
				$match: {
					createdAt: { $gte: thirtyDaysAgo },
				},
			},
			{
				$group: {
					_id: {
						$dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
					},
					totalTime: { $sum: "$listenedDuration" },
					completedSongs: {
						$sum: { $cond: ["$completed", 1, 0] },
					},
					uniqueUsers: { $addToSet: "$user" },
				},
			},
			{
				$project: {
					_id: 1,
					totalTime: 1,
					completedSongs: 1,
					uniqueUsersCount: { $size: "$uniqueUsers" },
				},
			},
			{ $sort: { _id: 1 } },
		]);

		res.json({
			totalListeningTime: globalListeningTime[0]?.total || 0,
			totalListeningHours: Math.round((globalListeningTime[0]?.total || 0) / 3600),
			uniqueListenersCount: uniqueListeners.length,
			popularSongs,
			dailyStats: dailyGlobalStats,
		});
	} catch (error) {
		console.log("Error getting global listening stats:", error);
		next(error);
	}
};

// Get listening stats for a specific song
export const getSongListeningStats = async (req, res, next) => {
	try {
		const { songId } = req.params;

		// Total listens (completed only)
		const totalListens = await ListeningHistory.countDocuments({
			song: songId,
			completed: true,
		});

		// Total listening time
		const totalTime = await ListeningHistory.aggregate([
			{ $match: { song: songId } },
			{ $group: { _id: null, total: { $sum: "$listenedDuration" } } },
		]);

		// Unique listeners
		const uniqueListeners = await ListeningHistory.distinct("user", { song: songId });

		// Average completion rate
		const allAttempts = await ListeningHistory.countDocuments({ song: songId });
		const completionRate = allAttempts > 0 ? Math.round((totalListens / allAttempts) * 100) : 0;

		res.json({
			songId,
			totalListens,
			totalListeningTime: totalTime[0]?.total || 0,
			totalListeningHours: Math.round((totalTime[0]?.total || 0) / 3600),
			uniqueListenersCount: uniqueListeners.length,
			completionRate,
		});
	} catch (error) {
		console.log("Error getting song listening stats:", error);
		next(error);
	}
};
