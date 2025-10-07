import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	server: {
		port: 3000,
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks: (id) => {
					// Tách React và React-related libraries
					if (id.includes("node_modules/react") || id.includes("node_modules/react-dom")) {
						return "react-vendor";
					}
					
					// Tách React Router
					if (id.includes("node_modules/react-router")) {
						return "router-vendor";
					}
					
					// Tách Zustand (state management)
					if (id.includes("node_modules/zustand")) {
						return "zustand-vendor";
					}
					
					// Tách Clerk (authentication)
					if (id.includes("node_modules/@clerk")) {
						return "clerk-vendor";
					}
					
					// Tách UI libraries (Radix UI, etc)
					if (id.includes("node_modules/@radix-ui")) {
						return "ui-vendor";
					}
					
					// Tách Axios
					if (id.includes("node_modules/axios")) {
						return "axios-vendor";
					}
					
					// Tách Socket.io client
					if (id.includes("node_modules/socket.io-client")) {
						return "socket-vendor";
					}
					
					// Tách các UI components khác
					if (id.includes("node_modules/lucide-react") || 
					    id.includes("node_modules/class-variance-authority") ||
					    id.includes("node_modules/clsx") ||
					    id.includes("node_modules/tailwind-merge")) {
						return "utils-vendor";
					}
					
					// Các node_modules còn lại vào vendor chung
					if (id.includes("node_modules")) {
						return "vendor";
					}
				},
			},
		},
		// Tăng chunk size warning limit lên 1000 kB
		chunkSizeWarningLimit: 1000,
		// Minify với esbuild (nhanh hơn terser)
		minify: "esbuild",
	},
});
