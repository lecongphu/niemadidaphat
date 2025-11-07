import { User } from "../models/user.model.js";

export const getAllUsers = async (req, res, next) => {
	try {
		const currentUserId = req.userId;
		const users = await User.find({ _id: { $ne: currentUserId } })
			.select("-sessionToken -googleId"); // Exclude sensitive fields
		res.status(200).json(users);
	} catch (error) {
		next(error);
	}
};
