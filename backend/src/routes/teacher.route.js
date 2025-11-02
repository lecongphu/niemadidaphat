import { Router } from "express";
import { getAllTeachers, getTeacherById } from "../controller/teacher.controller.js";

const router = Router();

router.get("/", getAllTeachers);
router.get("/:id", getTeacherById);

export default router;
