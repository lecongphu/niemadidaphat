import { Song } from "../models/song.model.js";
import { Album } from "../models/album.model.js";
import cloudinary from "../lib/cloudinary.js";
import fs from "fs";
import mongoose from "mongoose";

// ==================== CONSTANTS ====================
const MAX_FILE_SIZE = {
	audio: 500 * 1024 * 1024, // 500MB
	image: 10 * 1024 * 1024,  // 10MB
};

const ALLOWED_MIME_TYPES = {
	audio: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/x-m4a'],
	image: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
};

const CLOUDINARY_OPTIONS = {
	audio: {
		resource_type: "video", // Audio files use 'video' resource type in Cloudinary
		chunk_size: 6000000, // 6MB chunks for large files
		timeout: 120000, // 2 minutes timeout
	},
	image: {
		resource_type: "image",
		transformation: [
			{ quality: "auto:good" }, // Auto quality optimization
			{ fetch_format: "auto" }, // Auto format (WebP when supported)
		],
		timeout: 60000, // 1 minute timeout
	},
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Tạo slug từ chuỗi text (hỗ trợ tiếng Việt)
 */
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

/**
 * Validate file trước khi upload
 */
const validateFile = (file, type) => {
	if (!file) {
		throw new Error(`${type} file is required`);
	}

	// Check file size
	if (file.size > MAX_FILE_SIZE[type]) {
		const maxSizeMB = MAX_FILE_SIZE[type] / (1024 * 1024);
		throw new Error(`${type} file quá lớn. Giới hạn: ${maxSizeMB}MB`);
	}

	// Check MIME type
	if (!ALLOWED_MIME_TYPES[type].includes(file.mimetype)) {
		throw new Error(`${type} file không hợp lệ. Chỉ chấp nhận: ${ALLOWED_MIME_TYPES[type].join(', ')}`);
	}

	// Check if temp file exists
	if (!fs.existsSync(file.tempFilePath)) {
		throw new Error(`Temp file không tồn tại: ${file.tempFilePath}`);
	}

	return true;
};

/**
 * Upload file lên Cloudinary với retry logic
 */
const uploadToCloudinary = async (file, folder, type = 'image', retries = 3) => {
	let lastError;
	
	for (let attempt = 1; attempt <= retries; attempt++) {
		try {
			console.log(`📤 [Attempt ${attempt}/${retries}] Uploading to Cloudinary:`, {
				fileName: file.name,
				fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
				mimeType: file.mimetype,
				tempPath: file.tempFilePath,
				folder: folder,
				type: type
			});
			
			// Validate file trước khi upload
			validateFile(file, type);
			
			const options = {
				...CLOUDINARY_OPTIONS[type],
				folder: folder,
				public_id: `${createSlug(file.name.split('.')[0])}-${Date.now()}`,
			};
			
			const result = await cloudinary.uploader.upload(file.tempFilePath, options);
			
			console.log("✅ Upload successful:", {
				fileName: file.name,
				publicId: result.public_id,
				url: result.secure_url,
				format: result.format,
				size: `${(result.bytes / 1024 / 1024).toFixed(2)} MB`
			});
			
			// Cleanup temp file after successful upload
			cleanupTempFile(file.tempFilePath);
			
			return {
				url: result.secure_url,
				publicId: result.public_id,
				format: result.format,
				duration: result.duration, // For audio files
			};
			
		} catch (error) {
			lastError = error;
			console.error(`❌ [Attempt ${attempt}/${retries}] Upload failed:`, {
				fileName: file?.name,
				error: error.message,
			});
			
			// Nếu không phải lần thử cuối, đợi trước khi retry
			if (attempt < retries) {
				const waitTime = attempt * 1000; // Exponential backoff
				console.log(`⏳ Retrying in ${waitTime}ms...`);
				await new Promise(resolve => setTimeout(resolve, waitTime));
			}
		}
	}
	
	// Cleanup temp file nếu upload thất bại
	cleanupTempFile(file.tempFilePath);
	
	throw new Error(`Failed to upload ${file?.name} after ${retries} attempts: ${lastError.message}`);
};

/**
 * Xóa file tạm
 */
const cleanupTempFile = (filePath) => {
	try {
		if (filePath && fs.existsSync(filePath)) {
			fs.unlinkSync(filePath);
			console.log("🧹 Cleaned up temp file:", filePath);
		}
	} catch (error) {
		console.error("⚠️ Failed to cleanup temp file:", filePath, error.message);
	}
};

/**
 * Xóa file trên Cloudinary
 */
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
	try {
		if (!publicId) return;
		
		const result = await cloudinary.uploader.destroy(publicId, {
			resource_type: resourceType,
		});
		
		console.log("🗑️ Deleted from Cloudinary:", {
			publicId,
			result: result.result
		});
		
		return result;
	} catch (error) {
		console.error("⚠️ Failed to delete from Cloudinary:", {
			publicId,
			error: error.message
		});
	}
};

/**
 * Extract publicId từ Cloudinary URL
 */
const extractPublicId = (url) => {
	try {
		if (!url) return null;
		// URL format: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/{transformations}/{public_id}.{format}
		const parts = url.split('/upload/');
		if (parts.length < 2) return null;
		
		const pathWithFormat = parts[1].split('/').slice(1).join('/'); // Remove transformations
		const publicId = pathWithFormat.substring(0, pathWithFormat.lastIndexOf('.'));
		
		return publicId;
	} catch (error) {
		console.error("⚠️ Failed to extract publicId from URL:", url, error.message);
		return null;
	}
};

// ==================== CONTROLLERS ====================

/**
 * Tạo bài hát mới
 */
export const createSong = async (req, res, next) => {
	let uploadedAudio = null;
	let uploadedImage = null;
	
	try {
		// Validate files
		if (!req.files || !req.files.audioFile || !req.files.imageFile) {
			return res.status(400).json({ 
				message: "Vui lòng upload đầy đủ file audio và ảnh" 
			});
		}

		const { title, artist, albumId, duration } = req.body;
		
		// Validate required fields
		if (!title?.trim() || !artist?.trim()) {
			return res.status(400).json({ 
				message: "Thiếu thông tin bắt buộc: title, artist" 
			});
		}

		if (!duration || isNaN(duration) || duration <= 0) {
			return res.status(400).json({ 
				message: "Duration không hợp lệ" 
			});
		}
		
		const audioFile = req.files.audioFile;
		const imageFile = req.files.imageFile;

		// Tạo folder path dựa trên album nếu có
		let folderPath = "songs/singles";
		let album = null;
		
		if (albumId && mongoose.Types.ObjectId.isValid(albumId)) {
			album = await Album.findById(albumId);
			if (!album) {
				return res.status(404).json({ message: "Album không tồn tại" });
			}
			const albumSlug = createSlug(album.title);
			folderPath = `songs/albums/${albumSlug}`;
		}

		console.log("🎵 Creating song:", {
			title,
			artist,
			album: album?.title || "Single",
			audioSize: `${(audioFile.size / 1024 / 1024).toFixed(2)} MB`,
			imageSize: `${(imageFile.size / 1024 / 1024).toFixed(2)} MB`
		});

		// Upload files to Cloudinary
		uploadedAudio = await uploadToCloudinary(audioFile, `${folderPath}/audio`, 'audio');
		uploadedImage = await uploadToCloudinary(imageFile, `${folderPath}/images`, 'image');

		// Create song document
		const song = new Song({
			title: title.trim(),
			artist: artist.trim(),
			audioUrl: uploadedAudio.url,
			imageUrl: uploadedImage.url,
			duration: parseInt(duration),
			albumId: albumId || null,
		});

		await song.save();

		// Update album if song belongs to one
		if (albumId && album) {
			await Album.findByIdAndUpdate(
				albumId, 
				{ $push: { songs: song._id } }
			);
		}
		
		console.log("✅ Song created successfully:", song._id);
		
		res.status(201).json({
			message: "Tạo bài hát thành công",
			song: song
		});
		
	} catch (error) {
		// Cleanup uploaded files on error
		if (uploadedAudio?.publicId) {
			await deleteFromCloudinary(uploadedAudio.publicId, 'video');
		}
		if (uploadedImage?.publicId) {
			await deleteFromCloudinary(uploadedImage.publicId, 'image');
		}
		
		// Cleanup temp files if they still exist
		if (req.files?.audioFile?.tempFilePath) {
			cleanupTempFile(req.files.audioFile.tempFilePath);
		}
		if (req.files?.imageFile?.tempFilePath) {
			cleanupTempFile(req.files.imageFile.tempFilePath);
		}
		
		console.error("❌ Error creating song:", error.message);
		next(error);
	}
};

/**
 * Xóa bài hát với cleanup Cloudinary resources
 */
export const deleteSong = async (req, res, next) => {
	try {
		const { id } = req.params;

		// Validate ID
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: "ID không hợp lệ" });
		}

		const song = await Song.findById(id);
		
		if (!song) {
			return res.status(404).json({ message: "Không tìm thấy bài hát" });
		}

		console.log("🗑️ Deleting song:", {
			id: song._id,
			title: song.title,
			artist: song.artist
		});

		// Remove song from album if it belongs to one
		if (song.albumId) {
			await Album.findByIdAndUpdate(
				song.albumId, 
				{ $pull: { songs: song._id } }
			);
		}

		// Delete song from database
		await Song.findByIdAndDelete(id);

		// Delete files from Cloudinary
		// Extract publicIds from URLs
		const audioPublicId = extractPublicId(song.audioUrl);
		const imagePublicId = extractPublicId(song.imageUrl);

		// Delete in background (don't wait for completion)
		if (audioPublicId) {
			deleteFromCloudinary(audioPublicId, 'video').catch(err => 
				console.error("Failed to delete audio from Cloudinary:", err.message)
			);
		}
		if (imagePublicId) {
			deleteFromCloudinary(imagePublicId, 'image').catch(err => 
				console.error("Failed to delete image from Cloudinary:", err.message)
			);
		}

		console.log("✅ Song deleted successfully:", id);
		
		res.status(200).json({ 
			message: "Xóa bài hát thành công",
			deletedSong: {
				id: song._id,
				title: song.title
			}
		});
		
	} catch (error) {
		console.error("❌ Error deleting song:", error.message);
		next(error);
	}
};

/**
 * Tạo album mới
 */
export const createAlbum = async (req, res, next) => {
	let uploadedImage = null;
	
	try {
		// Validate files
		if (!req.files || !req.files.imageFile) {
			return res.status(400).json({ message: "Vui lòng upload ảnh album" });
		}
		
		const { title, artist, releaseYear } = req.body;
		
		// Validate required fields
		if (!title?.trim() || !artist?.trim()) {
			return res.status(400).json({ 
				message: "Thiếu thông tin bắt buộc: title, artist" 
			});
		}

		if (!releaseYear || isNaN(releaseYear)) {
			return res.status(400).json({ 
				message: "Release year không hợp lệ" 
			});
		}

		const currentYear = new Date().getFullYear();
		if (releaseYear < 1900 || releaseYear > currentYear + 1) {
			return res.status(400).json({ 
				message: `Release year phải từ 1900 đến ${currentYear + 1}` 
			});
		}
		
		const { imageFile } = req.files;

		// Check if album already exists
		const existingAlbum = await Album.findOne({ 
			title: title.trim(), 
			artist: artist.trim() 
		});
		
		if (existingAlbum) {
			return res.status(409).json({ 
				message: "Album này đã tồn tại" 
			});
		}

		console.log("💿 Creating album:", {
			title,
			artist,
			releaseYear,
			imageSize: `${(imageFile.size / 1024 / 1024).toFixed(2)} MB`
		});

		// Tạo slug từ tên album
		const albumSlug = createSlug(title);
		const folderPath = `albums/${albumSlug}`;

		uploadedImage = await uploadToCloudinary(imageFile, folderPath, 'image');

		const album = new Album({
			title: title.trim(),
			artist: artist.trim(),
			imageUrl: uploadedImage.url,
			releaseYear: parseInt(releaseYear),
		});

		await album.save();

		console.log("✅ Album created successfully:", album._id);

		res.status(201).json({
			message: "Tạo album thành công",
			album: album
		});
		
	} catch (error) {
		// Cleanup uploaded image on error
		if (uploadedImage?.publicId) {
			await deleteFromCloudinary(uploadedImage.publicId, 'image');
		}
		
		// Cleanup temp file if it still exists
		if (req.files?.imageFile?.tempFilePath) {
			cleanupTempFile(req.files.imageFile.tempFilePath);
		}
		
		console.error("❌ Error creating album:", error.message);
		next(error);
	}
};

/**
 * Xóa album và tất cả bài hát trong album
 */
export const deleteAlbum = async (req, res, next) => {
	try {
		const { id } = req.params;

		// Validate ID
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: "ID không hợp lệ" });
		}

		const album = await Album.findById(id);
		
		if (!album) {
			return res.status(404).json({ message: "Không tìm thấy album" });
		}

		console.log("🗑️ Deleting album:", {
			id: album._id,
			title: album.title,
			artist: album.artist
		});

		// Get all songs in the album before deleting
		const songs = await Song.find({ albumId: id });
		
		console.log(`📋 Found ${songs.length} songs in album to delete`);

		// Delete all songs in the album
		await Song.deleteMany({ albumId: id });

		// Delete the album
		await Album.findByIdAndDelete(id);

		// Delete album image from Cloudinary
		const albumImagePublicId = extractPublicId(album.imageUrl);
		if (albumImagePublicId) {
			deleteFromCloudinary(albumImagePublicId, 'image').catch(err => 
				console.error("Failed to delete album image from Cloudinary:", err.message)
			);
		}

		// Delete all song files from Cloudinary in background
		songs.forEach(song => {
			const audioPublicId = extractPublicId(song.audioUrl);
			const imagePublicId = extractPublicId(song.imageUrl);
			
			if (audioPublicId) {
				deleteFromCloudinary(audioPublicId, 'video').catch(err => 
					console.error(`Failed to delete song audio ${song._id}:`, err.message)
				);
			}
			if (imagePublicId) {
				deleteFromCloudinary(imagePublicId, 'image').catch(err => 
					console.error(`Failed to delete song image ${song._id}:`, err.message)
				);
			}
		});

		console.log("✅ Album and songs deleted successfully:", id);

		res.status(200).json({ 
			message: "Xóa album thành công",
			deletedAlbum: {
				id: album._id,
				title: album.title
			},
			deletedSongsCount: songs.length
		});
		
	} catch (error) {
		console.error("❌ Error deleting album:", error.message);
		next(error);
	}
};

/**
 * Check admin status
 */
export const checkAdmin = async (req, res, next) => {
	res.status(200).json({ 
		admin: true,
		message: "Admin verified"
	});
};
