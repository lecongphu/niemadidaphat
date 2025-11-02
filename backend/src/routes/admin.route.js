import { Router } from "express";
import {
	checkAdmin,
	createAlbum,
	createSong,
	deleteAlbum,
	deleteSong,
	createTeacher,
	deleteTeacher,
	updateTeacher
} from "../controller/admin.controller.js";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protectRoute, requireAdmin);

router.get("/check", checkAdmin);

router.post("/songs", createSong);
router.delete("/songs/:id", deleteSong);

router.post("/albums", createAlbum);
router.delete("/albums/:id", deleteAlbum);

router.post("/teachers", createTeacher);
router.delete("/teachers/:id", deleteTeacher);
router.put("/teachers/:id", updateTeacher);

export default router;
