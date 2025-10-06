import { Album } from "../models/album.model.js";
import { Song } from "../models/song.model.js";
import { User } from "../models/user.model.js";

export const getStats = async (req, res, next) => {
	try {
		const [totalSongs, totalAlbums, totalUsers, songs, albums] = await Promise.all([
			Song.countDocuments(),
			Album.countDocuments(),
			User.countDocuments(),
			Song.find().select('artist'),
			Album.find().select('artist'),
		]);

		// Đếm unique artists từ cả songs và albums (Firestore không hỗ trợ $unionWith và $group)
		const artistsSet = new Set();
		songs.forEach(song => {
			if (song.artist) artistsSet.add(song.artist);
		});
		albums.forEach(album => {
			if (album.artist) artistsSet.add(album.artist);
		});

		res.status(200).json({
			totalAlbums,
			totalSongs,
			totalUsers,
			totalArtists: artistsSet.size,
		});
	} catch (error) {
		next(error);
	}
};
