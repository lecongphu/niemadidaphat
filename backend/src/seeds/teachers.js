import mongoose from "mongoose";
import { Teacher } from "../models/teacher.model.js";
import { config } from "dotenv";

config();

const teachers = [
	{
		name: "Pháp sư Tịnh Không",
		bio: "Pháp sư nổi tiếng người Trung Quốc, chuyên ho홍 Tịnh độ tông, có ảnh hưởng sâu rộng trong Phật giáo Đại thừa.",
		imageUrl: "/teacher-images/tinh-khong.jpg",
		specialization: "Tịnh độ tông, Kinh điển Đại thừa",
		yearsOfExperience: 60,
	},
	{
		name: "Đại sư Ấn Quang",
		bio: "Tổ sư đời thứ 13 của Tịnh độ tông Trung Quốc, người có công lớn trong việc hồi phục Phật giáo thời cận đại.",
		imageUrl: "/teacher-images/an-quang.jpg",
		specialization: "Tịnh độ tông",
		yearsOfExperience: 50,
	},
	{
		name: "Pháp sư Tuyên Hóa",
		bio: "Thiền sư và giảng sư Phật học nổi tiếng, sáng lập nhiều trung tâm Phật giáo tại Mỹ, người có công lớn trong việc hoằng dương Phật pháp tại phương Tây.",
		imageUrl: "/teacher-images/tuyen-hoa.jpg",
		specialization: "Thiền tông, Kinh điển",
		yearsOfExperience: 55,
	},
];

const seedTeachers = async () => {
	try {
		await mongoose.connect(process.env.MONGODB_URI);

		// Clear existing teachers
		await Teacher.deleteMany({});

		// Insert new teachers
		await Teacher.insertMany(teachers);

		console.log("Teachers seeded successfully!");
	} catch (error) {
		console.error("Error seeding teachers:", error);
	} finally {
		mongoose.connection.close();
	}
};

seedTeachers();
