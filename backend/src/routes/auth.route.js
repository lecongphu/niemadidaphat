import { Router } from "express";
import { googleAuth, getMe, logout } from "../controller/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/google", googleAuth);
router.get("/me", protectRoute, getMe);
router.post("/logout", logout);

export default router;
