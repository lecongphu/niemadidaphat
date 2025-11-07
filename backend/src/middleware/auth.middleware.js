import { verifyToken } from "../lib/jwt.js";
import { User } from "../models/user.model.js";

export const authenticate = async (req, res, next) => {
	try {
		// Get token from cookie or Authorization header
		let token = req.cookies?.token;

		if (!token) {
			const authHeader = req.headers.authorization;
			if (authHeader && authHeader.startsWith("Bearer ")) {
				token = authHeader.substring(7);
			}
		}

		if (!token) {
			return res.status(401).json({ message: "Unauthorized - no token provided" });
		}

		const decoded = verifyToken(token);
		if (!decoded) {
			return res.status(401).json({ message: "Unauthorized - invalid token" });
		}

		// Verify session token (single device login)
		const user = await User.findById(decoded.userId);
		if (!user || user.sessionToken !== decoded.sessionToken) {
			return res.status(401).json({ message: "Session expired - please login again" });
		}

		// Attach user info to request - use database isAdmin value for security
		req.userId = decoded.userId;
		req.userEmail = decoded.email;
		req.isAdmin = user.isAdmin; // Always check database for latest admin status

		next();
	} catch (error) {
		console.log("Error in authenticate middleware", error);
		res.status(401).json({ message: "Unauthorized - invalid token" });
	}
};

export const protectRoute = authenticate;

export const requireAdmin = async (req, res, next) => {
	if (!req.isAdmin) {
		return res.status(403).json({ message: "Unauthorized - you must be an admin" });
	}
	next();
};
