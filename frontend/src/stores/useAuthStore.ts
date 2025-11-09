import { axiosInstance } from "@/lib/axios";
import { create } from "zustand";

interface User {
	_id: string;
	email: string;
	fullName: string;
	imageUrl: string;
	isAdmin: boolean;
}

interface AuthStore {
	user: User | null;
	isAuthenticated: boolean;
	isAdmin: boolean;
	isLoading: boolean;
	error: string | null;

	login: (credential: string) => Promise<void>;
	logout: () => Promise<void>;
	checkAuth: () => Promise<void>;
	reset: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
	user: null,
	isAuthenticated: false,
	isAdmin: false,
	isLoading: true,
	error: null,

	login: async (credential: string) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.post("/auth/google", { credential });
			const { user, token } = response.data;

			// Store token in localStorage
			localStorage.setItem("token", token);

			set({ user, isAuthenticated: true, isAdmin: user.isAdmin, isLoading: false });
		} catch (error: any) {
			const errorMessage = error.response?.data?.message || "Login failed";
			set({ error: errorMessage, isLoading: false });
			throw error;
		}
	},

	logout: async () => {
		try {
			await axiosInstance.post("/auth/logout");
			localStorage.removeItem("token");
			set({ user: null, isAuthenticated: false, isAdmin: false, error: null });
		} catch (error: any) {
			console.error("Logout error:", error);
		}
	},

	checkAuth: async () => {
		const token = localStorage.getItem("token");
		if (!token) {
			set({ isLoading: false, isAuthenticated: false, isAdmin: false, user: null });
			return;
		}

		try {
			const response = await axiosInstance.get("/auth/me");
			const user = response.data.user;
			set({ user, isAuthenticated: true, isAdmin: user.isAdmin, isLoading: false });
		} catch (error: any) {
			localStorage.removeItem("token");
			set({ isLoading: false, isAuthenticated: false, isAdmin: false, user: null });
		}
	},

	reset: () => {
		set({ user: null, isAuthenticated: false, isAdmin: false, isLoading: false, error: null });
	},
}));
