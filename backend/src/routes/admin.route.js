import { Router } from "express";
import {
	checkAdmin,
	createAlbum,
	updateAlbum,
	createSong,
	createSongFromUrl,
	deleteAlbum,
	deleteSong,
	updateSong,
	createTeacher,
	deleteTeacher,
	updateTeacher,
	getCategories,
	updateSongsOrder,
	getAllUsers,
	forceLogoutUser,
	deleteUser,
	createCategory,
	updateCategory,
	deleteCategory,
	grantAdminRights,
	revokeAdminRights,
} from "../controller/admin.controller.js";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protectRoute, requireAdmin);

router.get("/check", checkAdmin);

router.post("/songs", createSong);
router.post("/songs/url", createSongFromUrl);
router.put("/songs/:id", updateSong);
router.delete("/songs/:id", deleteSong);
router.put("/songs/order", updateSongsOrder);

router.post("/albums", createAlbum);
router.put("/albums/:id", updateAlbum);
router.delete("/albums/:id", deleteAlbum);

router.post("/teachers", createTeacher);
router.delete("/teachers/:id", deleteTeacher);
router.put("/teachers/:id", updateTeacher);

router.get("/categories", getCategories);
router.post("/categories", createCategory);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

// User management
router.get("/users", getAllUsers);
router.post("/users/:userId/logout", forceLogoutUser);
router.delete("/users/:userId", deleteUser);

// Admin rights management
router.post("/users/:userId/grant-admin", grantAdminRights);
router.post("/users/:userId/revoke-admin", revokeAdminRights);

export default router;
