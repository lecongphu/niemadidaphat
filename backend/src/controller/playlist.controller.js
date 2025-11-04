import { Playlist } from "../models/playlist.model.js";

// Get all playlists for current user
export const getUserPlaylists = async (req, res, next) => {
	try {
		const userId = req.auth.userId; // From Clerk middleware
		const playlists = await Playlist.find({ userId }).sort({ updatedAt: -1 });
		res.status(200).json(playlists);
	} catch (error) {
		next(error);
	}
};

// Get playlist by ID with populated songs
export const getPlaylistById = async (req, res, next) => {
	try {
		const { playlistId } = req.params;
		const userId = req.auth.userId;

		const playlist = await Playlist.findById(playlistId).populate({
			path: "songs",
			populate: [
				{ path: "teacher", select: "name" },
				{ path: "category", select: "name" },
			],
		});

		if (!playlist) {
			return res.status(404).json({ message: "Playlist not found" });
		}

		// Check if user owns this playlist or if it's public
		if (playlist.userId !== userId && !playlist.isPublic) {
			return res.status(403).json({ message: "You don't have access to this playlist" });
		}

		res.status(200).json(playlist);
	} catch (error) {
		next(error);
	}
};

// Create new playlist
export const createPlaylist = async (req, res, next) => {
	try {
		const userId = req.auth.userId;
		const { name, description, imageUrl } = req.body;

		if (!name) {
			return res.status(400).json({ message: "Playlist name is required" });
		}

		const playlist = new Playlist({
			name,
			description: description || "",
			imageUrl: imageUrl || undefined, // Will use default from schema
			userId,
			songs: [],
		});

		await playlist.save();
		res.status(201).json(playlist);
	} catch (error) {
		next(error);
	}
};

// Update playlist
export const updatePlaylist = async (req, res, next) => {
	try {
		const { playlistId } = req.params;
		const userId = req.auth.userId;
		const { name, description, imageUrl, isPublic } = req.body;

		const playlist = await Playlist.findById(playlistId);

		if (!playlist) {
			return res.status(404).json({ message: "Playlist not found" });
		}

		if (playlist.userId !== userId) {
			return res.status(403).json({ message: "You don't have permission to edit this playlist" });
		}

		// Update only provided fields
		if (name !== undefined) playlist.name = name;
		if (description !== undefined) playlist.description = description;
		if (imageUrl !== undefined) playlist.imageUrl = imageUrl;
		if (isPublic !== undefined) playlist.isPublic = isPublic;

		await playlist.save();
		res.status(200).json(playlist);
	} catch (error) {
		next(error);
	}
};

// Delete playlist
export const deletePlaylist = async (req, res, next) => {
	try {
		const { playlistId } = req.params;
		const userId = req.auth.userId;

		const playlist = await Playlist.findById(playlistId);

		if (!playlist) {
			return res.status(404).json({ message: "Playlist not found" });
		}

		if (playlist.userId !== userId) {
			return res.status(403).json({ message: "You don't have permission to delete this playlist" });
		}

		await Playlist.findByIdAndDelete(playlistId);
		res.status(200).json({ message: "Playlist deleted successfully" });
	} catch (error) {
		next(error);
	}
};

// Add song to playlist
export const addSongToPlaylist = async (req, res, next) => {
	try {
		const { playlistId } = req.params;
		const { songId } = req.body;
		const userId = req.auth.userId;

		if (!songId) {
			return res.status(400).json({ message: "Song ID is required" });
		}

		const playlist = await Playlist.findById(playlistId);

		if (!playlist) {
			return res.status(404).json({ message: "Playlist not found" });
		}

		if (playlist.userId !== userId) {
			return res.status(403).json({ message: "You don't have permission to modify this playlist" });
		}

		// Check if song already exists in playlist
		if (playlist.songs.includes(songId)) {
			return res.status(400).json({ message: "Song already in playlist" });
		}

		playlist.songs.push(songId);
		await playlist.save();

		// Populate the playlist to return full data
		const populatedPlaylist = await Playlist.findById(playlistId).populate({
			path: "songs",
			populate: [
				{ path: "teacher", select: "name" },
				{ path: "category", select: "name" },
			],
		});

		res.status(200).json(populatedPlaylist);
	} catch (error) {
		next(error);
	}
};

// Remove song from playlist
export const removeSongFromPlaylist = async (req, res, next) => {
	try {
		const { playlistId, songId } = req.params;
		const userId = req.auth.userId;

		const playlist = await Playlist.findById(playlistId);

		if (!playlist) {
			return res.status(404).json({ message: "Playlist not found" });
		}

		if (playlist.userId !== userId) {
			return res.status(403).json({ message: "You don't have permission to modify this playlist" });
		}

		playlist.songs = playlist.songs.filter((id) => id.toString() !== songId);
		await playlist.save();

		// Populate the playlist to return full data
		const populatedPlaylist = await Playlist.findById(playlistId).populate({
			path: "songs",
			populate: [
				{ path: "teacher", select: "name" },
				{ path: "category", select: "name" },
			],
		});

		res.status(200).json(populatedPlaylist);
	} catch (error) {
		next(error);
	}
};
