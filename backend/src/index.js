import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import path from "path";
import cors from "cors";
import fs from "fs";
import { createServer } from "http";
import cron from "node-cron";

import { initializeSocket } from "./lib/socket.js";

import { connectDB } from "./lib/db.js";
import userRoutes from "./routes/user.route.js";
import adminRoutes from "./routes/admin.route.js";
import authRoutes from "./routes/auth.route.js";
import songRoutes from "./routes/song.route.js";
import albumRoutes from "./routes/album.route.js";
import statRoutes from "./routes/stat.route.js";
import teacherRoutes from "./routes/teacher.route.js";
import categoryRoutes from "./routes/category.route.js";
import playlistRoutes from "./routes/playlist.route.js";
import sitemapRoutes from "./routes/sitemap.route.js";
import listeningRoutes from "./routes/listening.route.js";

dotenv.config();

const __dirname = path.resolve();
const app = express();
const PORT = process.env.PORT;

const httpServer = createServer(app);
initializeSocket(httpServer);

app.use(
	cors({
		origin: process.env.NODE_ENV === "production" ? process.env.FRONTEND_URL || "https://niemadidaphat.com" : "http://localhost:3000",
		credentials: true,
	})
);

app.use(express.json()); // to parse req.body
app.use(cookieParser()); // to parse cookies

// Request logging
app.use((req, res, next) => {
	console.log(`${req.method} ${req.path}`);
	next();
});

app.use(
	fileUpload({
		useTempFiles: true,
		tempFileDir: path.join(__dirname, "tmp"),
		createParentPath: true,
		limits: {
			fileSize: 95 * 1024 * 1024, // 95MB max file size
		},
	})
);

// cron jobs
const tempDir = path.join(process.cwd(), "tmp");
cron.schedule("*/10 * * * *", () => {
	if (fs.existsSync(tempDir)) {
		fs.readdir(tempDir, (err, files) => {
			if (err) {
				console.log("error", err);
				return;
			}
			for (const file of files) {
				fs.unlink(path.join(tempDir, file), (err) => {});
			}
		});
	}
});

// Serve static files in production
if (process.env.NODE_ENV === "production") {
	// Use process.cwd() which is the backend directory when running npm start --prefix backend
	const frontendDistPath = path.join(process.cwd(), "../frontend/dist");
	console.log("Frontend dist path:", frontendDistPath);
	app.use(express.static(frontendDistPath));
}

// Sitemap route - must be BEFORE API routes to avoid auth
app.use("/", sitemapRoutes);

// API routes
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/stats", statRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/listening", listeningRoutes);

// SPA fallback - must be AFTER API routes
if (process.env.NODE_ENV === "production") {
	const frontendDistPath = path.join(process.cwd(), "../frontend/dist");
	const indexPath = path.join(frontendDistPath, "index.html");
	console.log("Index.html path:", indexPath);

	app.use((req, res, next) => {
		// Only serve index.html for non-API routes that haven't been handled yet
		if (!req.path.startsWith('/api')) {
			res.sendFile(indexPath, (err) => {
				if (err) {
					console.error("Error serving index.html:", err);
					console.error("Tried to serve from:", indexPath);
					next(err);
				}
			});
		} else {
			next();
		}
	});
}

// error handler
app.use((err, req, res, next) => {
	console.error("Error occurred:", err);
	res.status(500).json({
		message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
		...(process.env.NODE_ENV !== "production" && { stack: err.stack })
	});
});

httpServer.listen(PORT, () => {
	console.log("Server is running on port " + PORT);
	connectDB();
});
