import express from "express";
import dotenv from "dotenv";
import { clerkMiddleware } from "@clerk/express";
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

// Request logging
app.use((req, res, next) => {
	console.log(`${req.method} ${req.path}`);
	next();
});

app.use(clerkMiddleware()); // this will add auth to req obj => req.auth
app.use(
	fileUpload({
		useTempFiles: true,
		tempFileDir: path.join(__dirname, "tmp"),
		createParentPath: true,
		limits: {
			fileSize: 10 * 1024 * 1024, // 10MB  max file size
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
	const frontendDistPath = path.join(__dirname, "../../frontend/dist");
	app.use(express.static(frontendDistPath));
}

// API routes
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/stats", statRoutes);

// SPA fallback - must be AFTER API routes
if (process.env.NODE_ENV === "production") {
	const frontendDistPath = path.join(__dirname, "../../frontend/dist");
	app.use((req, res, next) => {
		// Only serve index.html for non-API routes that haven't been handled yet
		if (!req.path.startsWith('/api')) {
			res.sendFile(path.join(frontendDistPath, "index.html"), (err) => {
				if (err) {
					console.error("Error serving index.html:", err);
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
