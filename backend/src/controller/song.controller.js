import { Song } from "../models/song.model.js";

export const getAllSongs = async (req, res, next) => {
	try {
		// -1 = Descending => newest -> oldest
		// 1 = Ascending => oldest -> newest
		const songs = await Song.find()
			.sort({ createdAt: -1 })
			.populate("category", "name")
			.populate("teacher", "name");
		res.json(songs);
	} catch (error) {
		next(error);
	}
};

export const getFeaturedSongs = async (req, res, next) => {
	try {
		// fetch 6 random songs using mongodb's aggregation pipeline
		const songs = await Song.aggregate([
			{
				$sample: { size: 6 },
			},
			{
				$lookup: {
					from: "teachers",
					localField: "teacher",
					foreignField: "_id",
					as: "teacher"
				}
			},
			{
				$unwind: "$teacher"
			},
			{
				$project: {
					_id: 1,
					title: 1,
					teacher: "$teacher.name",
					imageUrl: 1,
					audioUrl: 1,
				},
			},
		]);

		res.json(songs);
	} catch (error) {
		next(error);
	}
};

export const getMadeForYouSongs = async (req, res, next) => {
	try {
		const songs = await Song.aggregate([
			{
				$sample: { size: 4 },
			},
			{
				$lookup: {
					from: "teachers",
					localField: "teacher",
					foreignField: "_id",
					as: "teacher"
				}
			},
			{
				$unwind: "$teacher"
			},
			{
				$project: {
					_id: 1,
					title: 1,
					teacher: "$teacher.name",
					imageUrl: 1,
					audioUrl: 1,
				},
			},
		]);

		res.json(songs);
	} catch (error) {
		next(error);
	}
};

export const getTrendingSongs = async (req, res, next) => {
	try {
		const songs = await Song.aggregate([
			{
				$sample: { size: 4 },
			},
			{
				$lookup: {
					from: "teachers",
					localField: "teacher",
					foreignField: "_id",
					as: "teacher"
				}
			},
			{
				$unwind: "$teacher"
			},
			{
				$project: {
					_id: 1,
					title: 1,
					teacher: "$teacher.name",
					imageUrl: 1,
					audioUrl: 1,
				},
			},
		]);

		res.json(songs);
	} catch (error) {
		next(error);
	}
};
