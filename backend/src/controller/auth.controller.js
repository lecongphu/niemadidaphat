import { User } from "../models/user.model.js";
import { OAuth2Client } from "google-auth-library";
import { generateToken, generateSessionToken } from "../lib/jwt.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuth = async (req, res, next) => {
	try {
		const { credential } = req.body;

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
			user = await User.create({
				googleId,
				email,
				fullName: name,
				imageUrl: picture,
				sessionToken,
			});
		} else {
			// Update user info and session token (invalidates old sessions)
			user.fullName = name;
			user.imageUrl = picture;
			user.sessionToken = sessionToken;
			await user.save();
		}

		// Check if user is admin
		const isAdmin = email === process.env.ADMIN_EMAIL;

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
				id: user._id.toString(),
				email: user.email,
				fullName: user.fullName,
				imageUrl: user.imageUrl,
				isAdmin,
			},
			token,
		});
	} catch (error) {
		console.log("Error in Google auth", error);
		res.status(401).json({ success: false, message: "Invalid credential" });
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
				id: user._id.toString(),
				email: user.email,
				fullName: user.fullName,
				imageUrl: user.imageUrl,
				isAdmin: req.isAdmin,
			},
		});
	} catch (error) {
		console.log("Error in getMe", error);
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
		console.log("Error in logout", error);
		res.status(500).json({ success: false, message: "Internal server error" });
	}
};
