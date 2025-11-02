import axios from "axios";

export const axiosInstance = axios.create({
	baseURL: import.meta.env.MODE === "development" ? "http://localhost:5000/api" : "/api",
});

// Store the getToken function to be set by AuthProvider
let getTokenFunction: (() => Promise<string | null>) | null = null;

export const setTokenGetter = (getToken: () => Promise<string | null>) => {
	getTokenFunction = getToken;
};

// Request interceptor to automatically add fresh token to each request
axiosInstance.interceptors.request.use(
	async (config) => {
		if (getTokenFunction) {
			try {
				const token = await getTokenFunction();
				if (token) {
					config.headers.Authorization = `Bearer ${token}`;
				}
			} catch (error) {
				console.error("Error getting token:", error);
			}
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);
