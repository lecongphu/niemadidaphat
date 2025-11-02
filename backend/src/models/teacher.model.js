import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		bio: {
			type: String,
			default: "",
		},
		imageUrl: {
			type: String,
			required: true,
		},
		specialization: {
			type: String,
			default: "",
		},
		yearsOfExperience: {
			type: Number,
			default: 0,
		},
	},
	{ timestamps: true }
);

export const Teacher = mongoose.model("Teacher", teacherSchema);
