import { Album } from "../models/album.model.js";

export const getAllAlbums = async (req, res, next) => {
	try {
		const albums = await Album.find().populate("teacher", "name");
		res.status(200).json(albums);
	} catch (error) {
		next(error);
	}
};

export const getAlbumById = async (req, res, next) => {
	try {
		const { albumId } = req.params;

		const album = await Album.findById(albumId).populate({
			path: "songs",
			options: { sort: { order: 1 } } // Sort songs by order ascending
		});

		if (!album) {
			return res.status(404).json({ message: "Album not found" });
		}

		res.status(200).json(album);
	} catch (error) {
		next(error);
	}
};
