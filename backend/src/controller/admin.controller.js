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

		if (!req.files || !req.files.audioFile) {
			return res.status(400).json({ message: "Please upload audio file" });
		}

		const { title, teacher, albumId, duration, category } = req.body;
		const audioFile = req.files.audioFile;

		console.log("Audio file size:", audioFile.size, "bytes");

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

		const folderPath = `niemadidaphat/${album.title}`;
		const songFileName = title;

		let audioUrl;

		try {
			// Upload audio with custom folder and filename
			audioUrl = await uploadToCloudinary(audioFile, {
				folder: folderPath,
				public_id: `audios/${songFileName}`,
				resource_type: "video", // audio files use 'video' resource type in Cloudinary
			});
			console.log("Audio uploaded successfully");
		} catch (error) {
			console.error("Failed to upload audio:", error.message);
			return res.status(500).json({ message: `Failed to upload audio: ${error.message}` });
		}

		console.log("Audio uploaded successfully");
		console.log("Creating song document...");

		// Get the current number of songs in the album to set order
		const songsCount = await Song.countDocuments({ albumId });

		// Use album's image for the song
		const imageUrl = album.imageUrl;

		const song = new Song({
			title,
			teacher,
			audioUrl,
			imageUrl,
			duration: duration ? parseInt(duration) : 0,
			albumId,
			category,
			order: songsCount, // Set order to be at the end
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

export const createSongFromUrl = async (req, res, next) => {
	try {
		const { title, teacher, albumId, duration, category, audioUrl } = req.body;

		console.log("Creating song from URL...");

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

		if (!audioUrl) {
			return res.status(400).json({ message: "Audio URL is required" });
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

		// Validate album exists
		const album = await Album.findById(albumId);
		if (!album) {
			return res.status(404).json({ message: "Album not found" });
		}

		console.log("Creating song document with URL...");

		// Get the current number of songs in the album to set order
		const songsCount = await Song.countDocuments({ albumId });

		// Use album's image for the song
		const imageUrl = album.imageUrl;

		const song = new Song({
			title,
			teacher,
			audioUrl,
			imageUrl,
			duration: duration ? parseInt(duration) : 0,
			albumId,
			category,
			order: songsCount, // Set order to be at the end
		});

		await song.save();

		console.log("Song saved successfully");

		// Update the album's songs array
		await Album.findByIdAndUpdate(albumId, {
			$push: { songs: song._id },
		});

		res.status(201).json(song);
	} catch (error) {
		console.error("Error in createSongFromUrl:", error);
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

		// Check if URL is from Cloudinary
		const isCloudinaryUrl = (url) => {
			return url && url.includes('res.cloudinary.com');
		};

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

		// Delete audio file from Cloudinary (only if it's hosted on Cloudinary)
		if (song.audioUrl && isCloudinaryUrl(song.audioUrl)) {
			console.log('Attempting to delete audio from Cloudinary...');
			console.log('Audio URL:', song.audioUrl);
			const audioPublicId = extractPublicId(song.audioUrl);
			console.log('Extracted audio public_id:', audioPublicId);
			if (audioPublicId) {
				try {
					const result = await cloudinary.uploader.destroy(audioPublicId, { resource_type: 'video' });
					console.log('Audio file deletion result:', result);
					if (result.result === 'ok') {
						console.log('✓ Audio file deleted from Cloudinary:', audioPublicId);
					} else if (result.result === 'not found') {
						console.log('✗ Audio file not found on Cloudinary:', audioPublicId);
					} else {
						console.log('✗ Audio file deletion failed:', result);
					}
				} catch (err) {
					console.log('✗ Error deleting audio from Cloudinary:', err.message);
				}
			} else {
				console.log('✗ Could not extract public_id from audio URL');
			}
		} else if (song.audioUrl) {
			console.log('Audio URL is not from Cloudinary, skipping deletion:', song.audioUrl);
		}

		// Delete image file from Cloudinary (only if it's hosted on Cloudinary)
		if (song.imageUrl && isCloudinaryUrl(song.imageUrl)) {
			console.log('Attempting to delete image from Cloudinary...');
			console.log('Image URL:', song.imageUrl);
			const imagePublicId = extractPublicId(song.imageUrl);
			console.log('Extracted image public_id:', imagePublicId);
			if (imagePublicId) {
				try {
					const result = await cloudinary.uploader.destroy(imagePublicId, { resource_type: 'image' });
					console.log('Image file deletion result:', result);
					if (result.result === 'ok') {
						console.log('✓ Image file deleted from Cloudinary:', imagePublicId);
					} else if (result.result === 'not found') {
						console.log('✗ Image file not found on Cloudinary:', imagePublicId);
					} else {
						console.log('✗ Image file deletion failed:', result);
					}
				} catch (err) {
					console.log('✗ Error deleting image from Cloudinary:', err.message);
				}
			} else {
				console.log('✗ Could not extract public_id from image URL');
			}
		} else if (song.imageUrl) {
			console.log('Image URL is not from Cloudinary, skipping deletion:', song.imageUrl);
		}

		// if song belongs to an album, update the album's songs array
		if (song.albumId) {
			await Album.findByIdAndUpdate(song.albumId, {
				$pull: { songs: song._id },
			});

			// Reorder remaining songs in the album
			const remainingSongs = await Song.find({
				albumId: song.albumId,
				order: { $gt: song.order }
			});

			// Decrease order of all songs that came after the deleted song
			const updatePromises = remainingSongs.map((s) => {
				return Song.findByIdAndUpdate(s._id, { order: s.order - 1 });
			});

			await Promise.all(updatePromises);
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
		const folderPath = `niemadidaphat/audios/${title}`;
		const albumFileName = title;

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

export const updateSongsOrder = async (req, res, next) => {
	try {
		const { songs } = req.body; // Array of { songId, order }

		if (!songs || !Array.isArray(songs)) {
			return res.status(400).json({ message: "Songs array is required" });
		}

		console.log("Updating order for", songs.length, "songs");

		// Update each song's order
		const updatePromises = songs.map(({ songId, order }) => {
			return Song.findByIdAndUpdate(songId, { order }, { new: true });
		});

		await Promise.all(updatePromises);

		console.log("Songs order updated successfully");
		res.status(200).json({ message: "Songs order updated successfully" });
	} catch (error) {
		console.log("Error in updateSongsOrder", error);
		next(error);
	}
};
