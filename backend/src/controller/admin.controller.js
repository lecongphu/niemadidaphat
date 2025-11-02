import { Song } from "../models/song.model.js";
import { Album } from "../models/album.model.js";
import { Teacher } from "../models/teacher.model.js";
import { Category } from "../models/category.model.js";
import cloudinary from "../lib/cloudinary.js";

// helper function for cloudinary uploads
const uploadToCloudinary = async (file, options = {}) => {
	try {

		const result = await cloudinary.uploader.upload(file.tempFilePath, {
			resource_type: "auto",
			...options,
		});

		console.log("Upload successful:", result.secure_url);
		return result.secure_url;
	} catch (error) {
		console.log("Error in uploadToCloudinary:", error);
		console.log("Error message:", error.message);
		console.log("Error details:", error.error);
		throw new Error(`Error uploading to cloudinary: ${error.message}`);
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

		console.log("Audio file size:", audioFile.size, "bytes");
		console.log("Image file size:", imageFile.size, "bytes");

		// Validate required fields
		if (!title) {
			return res.status(400).json({ message: "Title is required" });
		}

		if (!teacher) {
			return res.status(400).json({ message: "Teacher is required" });
		}

		if (!albumId) {
			return res.status(400).json({ message: "Album is required" });
		}

		if (!category) {
			return res.status(400).json({ message: "Category is required" });
		}

		if (!duration) {
			return res.status(400).json({ message: "Duration is required" });
		}

		// Validate teacher exists
		const teacherExists = await Teacher.findById(teacher);
		if (!teacherExists) {
			return res.status(404).json({ message: "Teacher not found" });
		}

		// Validate category exists
		const categoryExists = await Category.findById(category);
		if (!categoryExists) {
			return res.status(404).json({ message: "Category not found" });
		}

		// Get album info to create folder structure
		const album = await Album.findById(albumId);
		if (!album) {
			return res.status(404).json({ message: "Album not found" });
		}

		// Create folder path and sanitize filenames
		const sanitizeForCloudinary = (str) => {
			// Remove special characters and replace spaces with underscores
			return str
				.normalize("NFD")
				.replace(/[\u0300-\u036f]/g, "") // Remove diacritics
				.replace(/[^a-zA-Z0-9\s-]/g, "") // Keep only alphanumeric, spaces, and hyphens
				.replace(/\s+/g, "_") // Replace spaces with underscores
				.substring(0, 100); // Limit length
		};

		const folderPath = `niemadidaphat/${sanitizeForCloudinary(album.title)}`;
		const songFileName = sanitizeForCloudinary(title);

		console.log("Folder path:", folderPath);
		console.log("Song filename:", songFileName);
		console.log("Uploading files to Cloudinary...");

		let audioUrl, imageUrl;

		try {
			// Upload audio with custom folder and filename
			audioUrl = await uploadToCloudinary(audioFile, {
				folder: folderPath,
				public_id: `audio_${songFileName}`,
				resource_type: "video", // audio files use 'video' resource type in Cloudinary
			});
			console.log("Audio uploaded successfully");
		} catch (error) {
			console.error("Failed to upload audio:", error.message);
			return res.status(500).json({ message: `Failed to upload audio: ${error.message}` });
		}

		try {
			// Upload image with custom folder and filename
			imageUrl = await uploadToCloudinary(imageFile, {
				folder: folderPath,
				public_id: `image_${songFileName}`,
				resource_type: "image",
			});
			console.log("Image uploaded successfully");
		} catch (error) {
			console.error("Failed to upload image:", error.message);
			// If image upload fails, we should cleanup the audio file
			// But for now, just return the error
			return res.status(500).json({ message: `Failed to upload image: ${error.message}` });
		}

		console.log("Files uploaded successfully");
		console.log("Creating song document...");

		const song = new Song({
			title,
			teacher,
			audioUrl,
			imageUrl,
			duration: parseInt(duration),
			albumId,
			category,
		});

		await song.save();

		console.log("Song saved successfully");

		// Update the album's songs array
		await Album.findByIdAndUpdate(albumId, {
			$push: { songs: song._id },
		});

		res.status(201).json(song);
	} catch (error) {
		console.error("Error in createSong:", error);
		console.error("Error stack:", error.stack);
		res.status(500).json({ message: error.message || "Internal server error" });
	}
};

export const deleteSong = async (req, res, next) => {
	try {
		const { id } = req.params;

		const song = await Song.findById(id);

		if (!song) {
			return res.status(404).json({ message: "Song not found" });
		}

		// Extract public_id from Cloudinary URLs to delete the files
		// URL format: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/{version}/{public_id}.{format}
		const extractPublicId = (url) => {
			const parts = url.split('/');
			const uploadIndex = parts.indexOf('upload');
			if (uploadIndex !== -1 && uploadIndex + 2 < parts.length) {
				// Get everything after 'upload/{version}/' and before the file extension
				const pathAfterUpload = parts.slice(uploadIndex + 2).join('/');
				// Remove file extension
				return pathAfterUpload.substring(0, pathAfterUpload.lastIndexOf('.'));
			}
			return null;
		};

		// Delete audio file from Cloudinary
		if (song.audioUrl) {
			const audioPublicId = extractPublicId(song.audioUrl);
			if (audioPublicId) {
				try {
					await cloudinary.uploader.destroy(audioPublicId, { resource_type: 'video' });
					console.log('Audio file deleted from Cloudinary:', audioPublicId);
				} catch (err) {
					console.log('Error deleting audio from Cloudinary:', err);
				}
			}
		}

		// Delete image file from Cloudinary
		if (song.imageUrl) {
			const imagePublicId = extractPublicId(song.imageUrl);
			if (imagePublicId) {
				try {
					await cloudinary.uploader.destroy(imagePublicId, { resource_type: 'image' });
					console.log('Image file deleted from Cloudinary:', imagePublicId);
				} catch (err) {
					console.log('Error deleting image from Cloudinary:', err);
				}
			}
		}

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

export const getCategories = async (req, res, next) => {
	try {
		const categories = await Category.find();
		res.status(200).json(categories);
	} catch (error) {
		console.log("Error in getCategories", error);
		next(error);
	}
};
