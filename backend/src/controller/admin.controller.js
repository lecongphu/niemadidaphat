import { Song } from "../models/song.model.js";
import { Album } from "../models/album.model.js";
import { Teacher } from "../models/teacher.model.js";
import cloudinary from "../lib/cloudinary.js";

// helper function for cloudinary uploads
const uploadToCloudinary = async (file, options = {}) => {
	try {
		const result = await cloudinary.uploader.upload(file.tempFilePath, {
			resource_type: "auto",
			...options,
		});
		return result.secure_url;
	} catch (error) {
		console.log("Error in uploadToCloudinary", error);
		throw new Error("Error uploading to cloudinary");
	}
};

export const createSong = async (req, res, next) => {
	try {
		if (!req.files || !req.files.audioFile || !req.files.imageFile) {
			return res.status(400).json({ message: "Please upload all files" });
		}

		const { title, teacher, albumId, duration, category } = req.body;
		const audioFile = req.files.audioFile;
		const imageFile = req.files.imageFile;

		// Validate albumId is required
		if (!albumId) {
			return res.status(400).json({ message: "Album is required" });
		}

		// Validate category is required
		if (!category) {
			return res.status(400).json({ message: "Category is required" });
		}

		// Get album info to create folder structure
		const album = await Album.findById(albumId);
		if (!album) {
			return res.status(404).json({ message: "Album not found" });
		}

		// Create folder path: niemadidaphat/{Album Title}/{Song Title}
		const folderPath = `niemadidaphat/${album.title}`;
		const songFileName = title.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_");

		// Upload audio with custom folder and filename
		const audioUrl = await uploadToCloudinary(audioFile, {
			folder: folderPath,
			public_id: songFileName,
			resource_type: "video", // audio files use 'video' resource type in Cloudinary
		});

		// Upload image with custom folder and filename
		const imageUrl = await uploadToCloudinary(imageFile, {
			folder: folderPath,
			public_id: songFileName,
			resource_type: "image",
		});

		const song = new Song({
			title,
			teacher,
			audioUrl,
			imageUrl,
			duration,
			albumId,
			category,
		});

		await song.save();

		// Update the album's songs array
		await Album.findByIdAndUpdate(albumId, {
			$push: { songs: song._id },
		});

		res.status(201).json(song);
	} catch (error) {
		console.log("Error in createSong", error);
		next(error);
	}
};

export const deleteSong = async (req, res, next) => {
	try {
		const { id } = req.params;

		const song = await Song.findById(id);

		// if song belongs to an album, update the album's songs array
		if (song.albumId) {
			await Album.findByIdAndUpdate(song.albumId, {
				$pull: { songs: song._id },
			});
		}

		await Song.findByIdAndDelete(id);

		res.status(200).json({ message: "Song deleted successfully" });
	} catch (error) {
		console.log("Error in deleteSong", error);
		next(error);
	}
};

export const createAlbum = async (req, res, next) => {
	try {
		const { title, teacher, releaseYear } = req.body;
		const { imageFile } = req.files;

		// Create folder path: niemadidaphat/{Album Title}/{Album Title}
		const folderPath = `niemadidaphat/${title}`;
		const albumFileName = title.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_");

		// Upload image with custom folder and filename
		const imageUrl = await uploadToCloudinary(imageFile, {
			folder: folderPath,
			public_id: albumFileName,
			resource_type: "image",
		});

		const album = new Album({
			title,
			teacher,
			imageUrl,
			releaseYear,
		});

		await album.save();

		res.status(201).json(album);
	} catch (error) {
		console.log("Error in createAlbum", error);
		next(error);
	}
};

export const deleteAlbum = async (req, res, next) => {
	try {
		const { id } = req.params;
		await Song.deleteMany({ albumId: id });
		await Album.findByIdAndDelete(id);
		res.status(200).json({ message: "Album deleted successfully" });
	} catch (error) {
		console.log("Error in deleteAlbum", error);
		next(error);
	}
};

export const checkAdmin = async (req, res, next) => {
	res.status(200).json({ admin: true });
};

export const createTeacher = async (req, res, next) => {
	try {
		const { name, bio, specialization, yearsOfExperience } = req.body;
		const { imageFile } = req.files;

		const imageUrl = await uploadToCloudinary(imageFile);

		const teacher = new Teacher({
			name,
			bio,
			imageUrl,
			specialization,
			yearsOfExperience: parseInt(yearsOfExperience) || 0,
		});

		await teacher.save();

		res.status(201).json(teacher);
	} catch (error) {
		console.log("Error in createTeacher", error);
		next(error);
	}
};

export const deleteTeacher = async (req, res, next) => {
	try {
		const { id } = req.params;
		await Teacher.findByIdAndDelete(id);
		res.status(200).json({ message: "Teacher deleted successfully" });
	} catch (error) {
		console.log("Error in deleteTeacher", error);
		next(error);
	}
};

export const updateTeacher = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { name, bio, specialization, yearsOfExperience } = req.body;

		const updateData = {
			name,
			bio,
			specialization,
			yearsOfExperience: parseInt(yearsOfExperience) || 0,
		};

		// If new image is uploaded, update imageUrl
		if (req.files && req.files.imageFile) {
			const imageUrl = await uploadToCloudinary(req.files.imageFile);
			updateData.imageUrl = imageUrl;
		}

		const teacher = await Teacher.findByIdAndUpdate(id, updateData, {
			new: true,
		});

		if (!teacher) {
			return res.status(404).json({ message: "Teacher not found" });
		}

		res.status(200).json(teacher);
	} catch (error) {
		console.log("Error in updateTeacher", error);
		next(error);
	}
};
