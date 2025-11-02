import { Teacher } from "../models/teacher.model.js";

export const getAllTeachers = async (req, res, next) => {
	try {
		const teachers = await Teacher.find().sort({ createdAt: -1 });
		res.json(teachers);
	} catch (error) {
		next(error);
	}
};

export const getTeacherById = async (req, res, next) => {
	try {
		const { id } = req.params;
		const teacher = await Teacher.findById(id);

		if (!teacher) {
			return res.status(404).json({ message: "Teacher not found" });
		}

		res.json(teacher);
	} catch (error) {
		next(error);
	}
};
