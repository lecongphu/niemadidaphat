import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		fullName: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		imageUrl: {
			type: String,
			required: true,
		},
		googleId: {
			type: String,
			required: true,
			unique: true,
		},
		sessionToken: {
			type: String,
			default: null,
		},
		isAdmin: {
			type: Boolean,
			default: false,
		},
		isOnline: {
			type: Boolean,
			default: false,
		},
		lastActive: {
			type: Date,
			default: Date.now,
		},
	},
	{ timestamps: true } //  createdAt, updatedAt
);

export const User = mongoose.model("User", userSchema);
