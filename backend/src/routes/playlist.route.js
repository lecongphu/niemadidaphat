import { Router } from "express";
import {
	getUserPlaylists,
	getPlaylistById,
	createPlaylist,
	updatePlaylist,
	deletePlaylist,
	addSongToPlaylist,
	removeSongFromPlaylist,
} from "../controller/playlist.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

// All playlist routes require authentication
router.use(protectRoute);

// Get all playlists for current user
router.get("/", getUserPlaylists);

// Get specific playlist by ID
router.get("/:playlistId", getPlaylistById);

// Create new playlist
router.post("/", upload.single("imageFile"), createPlaylist);

// Update playlist
router.put("/:playlistId", updatePlaylist);

// Delete playlist
router.delete("/:playlistId", deletePlaylist);

// Add song to playlist
router.post("/:playlistId/songs", addSongToPlaylist);

// Remove song from playlist
router.delete("/:playlistId/songs/:songId", removeSongFromPlaylist);

export default router;
