import { Song } from "../models/song.model.js";
import { Album } from "../models/album.model.js";
import { Teacher } from "../models/teacher.model.js";

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

export const getSongById = async (req, res, next) => {
	try {
		const { id } = req.params;

		// Get the song with full details
		const song = await Song.findById(id)
			.populate("category", "name")
			.populate("teacher", "name imageUrl");

		if (!song) {
			return res.status(404).json({ message: "Song not found" });
		}

		// Find similar songs based on:
		// 1. Same category (highest priority)
		// 2. Same teacher (second priority)
		// 3. Same album (third priority)
		// Exclude the current song
		const similarSongs = await Song.find({
			_id: { $ne: id }, // Exclude current song
			$or: [
				{ category: song.category },
				{ teacher: song.teacher },
				{ albumId: song.albumId },
			],
		})
			.populate("category", "name")
			.populate("teacher", "name")
			.limit(10)
			.sort({ createdAt: -1 });

		// Sort similar songs by relevance
		const sortedSimilarSongs = similarSongs.sort((a, b) => {
			let scoreA = 0;
			let scoreB = 0;

			// Same category: +3 points
			if (a.category && song.category && a.category._id.toString() === song.category._id.toString()) {
				scoreA += 3;
			}
			if (b.category && song.category && b.category._id.toString() === song.category._id.toString()) {
				scoreB += 3;
			}

			// Same teacher: +2 points
			if (a.teacher && song.teacher && a.teacher._id.toString() === song.teacher._id.toString()) {
				scoreA += 2;
			}
			if (b.teacher && song.teacher && b.teacher._id.toString() === song.teacher._id.toString()) {
				scoreB += 2;
			}

			// Same album: +1 point
			if (a.albumId && song.albumId && a.albumId.toString() === song.albumId.toString()) {
				scoreA += 1;
			}
			if (b.albumId && song.albumId && b.albumId.toString() === song.albumId.toString()) {
				scoreB += 1;
			}

			return scoreB - scoreA; // Higher score first
		});

		res.json({
			song,
			similarSongs: sortedSimilarSongs,
		});
	} catch (error) {
		console.log("Error in getSongById", error);
		next(error);
	}
};

export const checkDuplicateSong = async (req, res, next) => {
	try {
		const { title, albumId, excludeSongId } = req.query;

		if (!title || !albumId) {
			return res.status(400).json({ message: "Title and albumId are required" });
		}

		// Build query to find duplicates
		const query = {
			title: { $regex: new RegExp(`^${title.trim()}$`, "i") }, // Case-insensitive exact match
			albumId: albumId
		};

		// If excludeSongId is provided (for editing), exclude that song from results
		if (excludeSongId) {
			query._id = { $ne: excludeSongId };
		}

		const duplicates = await Song.find(query).select("_id title");

		res.json({
			hasDuplicates: duplicates.length > 0,
			count: duplicates.length,
			duplicates: duplicates
		});
	} catch (error) {
		console.log("Error in checkDuplicateSong", error);
		next(error);
	}
};

export const searchAll = async (req, res, next) => {
	try {
		const { q } = req.query;

		if (!q || q.trim().length === 0) {
			return res.json({
				songs: [],
				albums: [],
				teachers: [],
			});
		}

		const searchQuery = q.trim();
		const searchRegex = new RegExp(searchQuery, "i"); // Case-insensitive search

		// Search songs by title
		const songs = await Song.find({
			title: searchRegex,
		})
			.populate("category", "name")
			.populate("teacher", "name imageUrl")
			.limit(5)
			.sort({ createdAt: -1 });

		// Search albums by title
		const albums = await Album.find({
			title: searchRegex,
		})
			.populate("teacher", "name imageUrl")
			.limit(5)
			.sort({ releaseYear: -1 });

		// Search teachers by name
		const teachers = await Teacher.find({
			name: searchRegex,
		})
			.limit(5)
			.sort({ name: 1 });

		res.json({
			songs,
			albums,
			teachers,
		});
	} catch (error) {
		console.log("Error in searchAll", error);
		next(error);
	}
};
