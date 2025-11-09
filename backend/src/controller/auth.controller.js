import { User } from "../models/user.model.js";
import { OAuth2Client } from "google-auth-library";
import { generateToken, generateSessionToken } from "../lib/jwt.js";

// Initialize OAuth2Client - will be created on first use if CLIENT_ID is not available yet
let client;

export const googleAuth = async (req, res, next) => {
	try {
		const { credential } = req.body;

		if (!process.env.GOOGLE_CLIENT_ID) {
			return res.status(500).json({ success: false, message: "Server configuration error" });
		}

		// Initialize OAuth2Client if not already initialized
		if (!client) {
			client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
		}

		// Verify Google credential
		const ticket = await client.verifyIdToken({
			idToken: credential,
			audience: process.env.GOOGLE_CLIENT_ID,
		});

		const payload = ticket.getPayload();
		const { sub: googleId, email, name, picture } = payload;

		// Check if user exists
		let user = await User.findOne({ googleId });

		// Generate new session token (this will invalidate all other sessions)
		const sessionToken = generateSessionToken();

		if (!user) {
			// Create new user
			// Check if this is the first user or if email matches ADMIN_EMAIL (for backward compatibility)
			const userCount = await User.countDocuments();
			const isFirstUser = userCount === 0;
			const isAdminEmail = email === process.env.ADMIN_EMAIL;

			user = await User.create({
				googleId,
				email,
				fullName: name,
				imageUrl: picture,
				sessionToken,
				isAdmin: isFirstUser || isAdminEmail, // First user or ADMIN_EMAIL gets admin rights
			});
		} else {
			// Update user info and session token (invalidates old sessions)
			user.fullName = name;
			user.imageUrl = picture;
			user.sessionToken = sessionToken;
			await user.save();
		}

		// Get isAdmin from database
		const isAdmin = user.isAdmin;

		// Generate JWT token with session token
		const token = generateToken(user._id.toString(), email, isAdmin, sessionToken);

		// Set cookie
		res.cookie("token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
		});

		res.status(200).json({
			success: true,
			user: {
				_id: user._id.toString(),
				email: user.email,
				fullName: user.fullName,
				imageUrl: user.imageUrl,
				isAdmin,
			},
			token,
		});
	} catch (error) {
		const errorMessage = error.message || "Invalid credential";
		res.status(401).json({ success: false, message: errorMessage });
	}
};

export const getMe = async (req, res, next) => {
	try {
		const user = await User.findById(req.userId);

		if (!user) {
			return res.status(404).json({ success: false, message: "User not found" });
		}

		res.status(200).json({
			success: true,
			user: {
				_id: user._id.toString(),
				email: user.email,
				fullName: user.fullName,
				imageUrl: user.imageUrl,
				isAdmin: req.isAdmin,
			},
		});
	} catch (error) {
		next(error);
	}
};

export const logout = async (req, res) => {
	try {
		// Clear session token in database
		if (req.userId) {
			await User.findByIdAndUpdate(req.userId, { sessionToken: null });
		}

		res.cookie("token", "", {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 0,
		});

		res.status(200).json({ success: true, message: "Logged out successfully" });
	} catch (error) {
		res.status(500).json({ success: false, message: "Internal server error" });
	}
};
