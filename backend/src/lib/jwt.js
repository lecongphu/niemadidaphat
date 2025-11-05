import jwt from "jsonwebtoken";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d";

export const generateToken = (userId, email, isAdmin = false, sessionToken) => {
	return jwt.sign(
		{
			userId,
			email,
			isAdmin,
			sessionToken,
		},
		JWT_SECRET,
		{ expiresIn: JWT_EXPIRES_IN }
	);
};

export const verifyToken = (token) => {
	try {
		return jwt.verify(token, JWT_SECRET);
	} catch (error) {
		return null;
	}
};

export const generateSessionToken = () => {
	return crypto.randomBytes(32).toString("hex");
};
