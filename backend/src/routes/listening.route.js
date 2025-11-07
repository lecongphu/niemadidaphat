import { Router } from "express";
import {
	trackListening,
	getUserListeningStats,
	getGlobalListeningStats,
	getSongListeningStats,
} from "../controller/listening.controller.js";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();

// Track listening progress (user)
router.post("/track", protectRoute, trackListening);

// Get user's listening statistics
router.get("/stats/me", protectRoute, getUserListeningStats);

// Get global listening statistics (admin only)
router.get("/stats/global", protectRoute, requireAdmin, getGlobalListeningStats);

// Get listening stats for a specific song
router.get("/stats/song/:songId", protectRoute, getSongListeningStats);

export default router;
