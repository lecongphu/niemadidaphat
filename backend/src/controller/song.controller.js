import { Song } from "../models/song.model.js";

export const getAllSongs = async (req, res, next) => {
	try {
		// -1 = Descending => newest -> oldest
		// 1 = Ascending => oldest -> newest
		const songs = await Song.find().sort({ createdAt: -1 });
		res.json(songs);
	} catch (error) {
		next(error);
	}
};

export const getFeaturedSongs = async (req, res, next) => {
	try {
		// fetch 6 random songs (Firestore không hỗ trợ $sample, nên random ở phía app)
		const allSongs = await Song.find().select('_id title artist imageUrl audioUrl');
		
		// Shuffle array và lấy 6 bài đầu
		const shuffled = allSongs.sort(() => 0.5 - Math.random());
		const songs = shuffled.slice(0, 6);

		res.json(songs);
	} catch (error) {
		next(error);
	}
};

export const getMadeForYouSongs = async (req, res, next) => {
	try {
		// fetch 4 random songs (Firestore không hỗ trợ $sample, nên random ở phía app)
		const allSongs = await Song.find().select('_id title artist imageUrl audioUrl');
		
		// Shuffle array và lấy 4 bài đầu
		const shuffled = allSongs.sort(() => 0.5 - Math.random());
		const songs = shuffled.slice(0, 4);

		res.json(songs);
	} catch (error) {
		next(error);
	}
};

export const getTrendingSongs = async (req, res, next) => {
	try {
		// fetch 4 random songs (Firestore không hỗ trợ $sample, nên random ở phía app)
		const allSongs = await Song.find().select('_id title artist imageUrl audioUrl');
		
		// Shuffle array và lấy 4 bài đầu
		const shuffled = allSongs.sort(() => 0.5 - Math.random());
		const songs = shuffled.slice(0, 4);

		res.json(songs);
	} catch (error) {
		next(error);
	}
};
