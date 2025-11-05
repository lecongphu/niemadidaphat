import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		description: { type: String, default: "" },
		userId: { type: String, required: true }, // User ID
		imageUrl: { type: String, default: "https://res.cloudinary.com/dxoqhqhdr/image/upload/v1735916382/default-playlist_mgkb2w.png" }, // Default playlist image
		songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
		isPublic: { type: Boolean, default: false }, // For future sharing feature
	},
	{ timestamps: true }
); //  createdAt, updatedAt

export const Playlist = mongoose.model("Playlist", playlistSchema);
