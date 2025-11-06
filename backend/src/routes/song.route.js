import { Router } from "express";
import { getAllSongs, getSongById, searchAll } from "../controller/song.controller.js";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", protectRoute, requireAdmin, getAllSongs);
router.get("/search", protectRoute, searchAll);
router.get("/:id", protectRoute, getSongById);

export default router;
