import { Teacher } from "../models/teacher.model.js";
import { Album } from "../models/album.model.js";
import { Song } from "../models/song.model.js";

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

		// Fetch albums by this teacher
		const albums = await Album.find({ teacher: id })
			.populate("teacher", "name")
			.sort({ releaseYear: -1 });

		// Fetch songs by this teacher
		const songs = await Song.find({ teacher: id })
			.populate("teacher", "name")
			.populate("category", "name")
			.sort({ createdAt: -1 });

		res.json({
			...teacher.toObject(),
			albums,
			songs,
		});
	} catch (error) {
		next(error);
	}
};
