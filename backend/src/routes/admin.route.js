import { Router } from "express";
import {
	checkAdmin,
	createAlbum,
	createSong,
	createSongFromUrl,
	deleteAlbum,
	deleteSong,
	createTeacher,
	deleteTeacher,
	updateTeacher,
	getCategories,
	updateSongsOrder
} from "../controller/admin.controller.js";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protectRoute, requireAdmin);

router.get("/check", checkAdmin);

router.post("/songs", createSong);
router.post("/songs/url", createSongFromUrl);
router.delete("/songs/:id", deleteSong);
router.put("/songs/order", updateSongsOrder);

router.post("/albums", createAlbum);
router.delete("/albums/:id", deleteAlbum);

router.post("/teachers", createTeacher);
router.delete("/teachers/:id", deleteTeacher);
router.put("/teachers/:id", updateTeacher);

router.get("/categories", getCategories);

export default router;
