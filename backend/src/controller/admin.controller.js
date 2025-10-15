import { Song } from "../models/song.model.js";
import { Album } from "../models/album.model.js";
import cloudinary from "../lib/cloudinary.js";

// helper function to create slug from string
const createSlug = (text) => {
	return text
		.toString()
		.toLowerCase()
		.normalize("NFD") // Chuẩn hóa để xử lý dấu tiếng Việt
		.replace(/[\u0300-\u036f]/g, "") // Loại bỏ dấu
		.replace(/đ/g, "d") // Thay thế đ -> d
		.replace(/Đ/g, "D") // Thay thế Đ -> D
		.trim()
		.replace(/[^a-z0-9\s-]/g, "") // Loại bỏ ký tự đặc biệt
		.replace(/\s+/g, "-") // Thay khoảng trắng bằng -
		.replace(/-+/g, "-"); // Loại bỏ dấu - trùng lặp
};

// helper function for cloudinary uploads
const uploadToCloudinary = async (file, folder) => {
	try {
		console.log("📤 Uploading to Cloudinary:", {
			fileName: file.name,
			fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
			tempPath: file.tempFilePath,
			folder: folder
		});
		
		const result = await cloudinary.uploader.upload(file.tempFilePath, {
			resource_type: "auto",
			folder: folder, // Thư mục để lưu file
		});
		
		console.log("✅ Upload successful:", file.name);
		return result.secure_url;
	} catch (error) {
		console.error("❌ Cloudinary upload error:", {
			fileName: file?.name,
			tempPath: file?.tempFilePath,
			folder: folder,
			error: error.message,
			stack: error.stack
		});
		throw new Error(`Error uploading ${file?.name} to cloudinary: ${error.message}`);
	}
};

export const createSong = async (req, res, next) => {
	try {
		if (!req.files || !req.files.audioFile || !req.files.imageFile) {
			return res.status(400).json({ message: "Please upload all files" });
		}

		const { title, artist, albumId, duration } = req.body;
		const audioFile = req.files.audioFile;
		const imageFile = req.files.imageFile;

		// Tạo folder path dựa trên album nếu có
		let folderPath = "songs/singles"; // Mặc định cho bài hát không thuộc album
		if (albumId) {
			const album = await Album.findById(albumId);
			if (album) {
				const albumSlug = createSlug(album.title);
				folderPath = `songs/albums/${albumSlug}`;
			}
		}

		const audioUrl = await uploadToCloudinary(audioFile, `${folderPath}/audio`);
		const imageUrl = await uploadToCloudinary(imageFile, `${folderPath}/images`);

		const song = new Song({
			title,
			artist,
			audioUrl,
			imageUrl,
			duration,
			albumId: albumId || null,
		});

		await song.save();

		// if song belongs to an album, update the album's songs array
		if (albumId) {
			await Album.findByIdAndUpdate(albumId, {
				$push: { songs: song._id },
			});
		}
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
		const { title, artist, releaseYear } = req.body;
		const { imageFile } = req.files;

		// Tạo slug từ tên album
		const albumSlug = createSlug(title);
		const folderPath = `albums/${albumSlug}`;

		const imageUrl = await uploadToCloudinary(imageFile, folderPath);

		const album = new Album({
			title,
			artist,
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
