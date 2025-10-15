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
import { apiLimiter, authLimiter } from "./middleware/rateLimit.js";
import helmet from "helmet";

dotenv.config();

const __dirname = path.resolve();
const app = express();
const PORT = process.env.PORT;

// Trust proxy - BẮT BUỘC khi deploy sau reverse proxy (Nginx, Cloudflare, etc.)
// Cho phép Express đọc X-Forwarded-For header để lấy IP thật của client
app.set('trust proxy', 1);

// Tạo tmp directory nếu chưa tồn tại - FIX cho Ubuntu
const tmpDir = path.join(__dirname, "tmp");
if (!fs.existsSync(tmpDir)) {
	fs.mkdirSync(tmpDir, { recursive: true, mode: 0o777 });
}

// Test write permission để verify tmp directory có thể ghi được
try {
	const testFile = path.join(tmpDir, '.write-test');
	fs.writeFileSync(testFile, 'test');
	fs.unlinkSync(testFile);
	console.log("✅ Tmp directory is writable");
} catch (err) {
	console.error("❌ Cannot write to tmp directory:", err.message);
	console.error("   Path:", tmpDir);
	console.error("   Please check directory permissions!");
}

const httpServer = createServer(app);
initializeSocket(httpServer);

app.use(
	cors({
		origin: ['http://localhost:3000', 'https://niemadidaphat.com'],
		credentials: true,
	})
);

app.use(helmet({
	contentSecurityPolicy: false, // Tắt CSP nếu gặp vấn đề với assets
}));

app.use(express.json()); // to parse req.body
app.use(clerkMiddleware({ 
	// Tự động verify JWT token trong Authorization header
	publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
	secretKey: process.env.CLERK_SECRET_KEY,
	
})); // this will add auth to req obj => req.auth()
app.use(
	fileUpload({
		useTempFiles: true,
		tempFileDir: tmpDir, // Sử dụng biến tmpDir đã tạo ở trên
		createParentPath: true,
		limits: {
			fileSize: 10 * 1024 * 1024, // 10MB  max file size
		},
	})
);

// Cron job - Cleanup tmp files mỗi giờ
cron.schedule("0 * * * *", () => {
	if (fs.existsSync(tmpDir)) {
		fs.readdir(tmpDir, (err, files) => {
			if (err) {
				console.log("❌ Error reading tmp directory:", err);
				return;
			}
			if (files.length > 0) {
				console.log(`🧹 Cleaning up ${files.length} temp files...`);
				for (const file of files) {
					fs.unlink(path.join(tmpDir, file), (err) => {
						if (err) console.log("Error deleting file:", file, err);
					});
				}
			}
		});
	}
});

app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/stats", statRoutes);
app.use("/api/", apiLimiter);
app.use("/api/auth/", authLimiter);

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "../frontend/dist")));
	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "../frontend", "dist", "index.html"));
	});
}

// error handler
app.use((err, req, res, next) => {
	// Handle file upload errors
	if (err.code === 'LIMIT_FILE_SIZE') {
		return res.status(413).json({ 
			message: 'File quá lớn. Giới hạn 10MB cho mỗi file.' 
		});
	}
	
	if (err.code === 'LIMIT_FILE_COUNT') {
		return res.status(400).json({ 
			message: 'Quá nhiều files được upload cùng lúc.' 
		});
	}
	
	// Log error for debugging
	console.error("Server Error:", {
		message: err.message,
		code: err.code,
		stack: process.env.NODE_ENV === "development" ? err.stack : undefined
	});
	
	res.status(500).json({ 
		message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message 
	});
});

httpServer.listen(PORT, () => {
	console.log("Server is running on port " + PORT);
	connectDB();
});
