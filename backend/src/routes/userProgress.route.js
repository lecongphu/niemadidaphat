import { Router } from "express";
import {
	saveProgress,
	getProgress,
	getAllProgress,
	deleteProgress,
	clearAllProgress,
} from "../controller/userProgress.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = Router();

// All routes require authentication
router.post("/", protectRoute, saveProgress);
router.get("/", protectRoute, getAllProgress);
router.get("/:songId", protectRoute, getProgress);
router.delete("/:songId", protectRoute, deleteProgress);
router.delete("/", protectRoute, clearAllProgress);

export default router;
