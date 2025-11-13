import { Album } from "../models/album.model.js";

export const getAllAlbums = async (req, res, next) => {
	try {
		const albums = await Album.find()
			.populate("teacher", "name")
			.populate({
				path: "songs",
				select: "duration", // Only select duration field for performance
				options: { sort: { order: 1 } }
			});
		res.status(200).json(albums);
	} catch (error) {
		next(error);
	}
};

export const getAlbumById = async (req, res, next) => {
	try {
		const { albumId } = req.params;

		const album = await Album.findById(albumId)
			.populate({
				path: "songs",
				options: { sort: { order: 1 } }, // Sort songs by order ascending
				populate: [
					{ path: "teacher", select: "name" },
					{ path: "category", select: "name" }
				]
			})
			.populate("teacher", "name");

		if (!album) {
			return res.status(404).json({ message: "Album not found" });
		}

		res.status(200).json(album);
	} catch (error) {
		next(error);
	}
};
