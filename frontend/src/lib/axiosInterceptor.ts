import { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";

// Kiểu cho getToken function từ Clerk
type GetTokenFunction = (options?: { template?: string }) => Promise<string | null>;

/**
 * Setup axios interceptor để tự động refresh JWT token khi hết hạn
 * @param axiosInstance - Axios instance cần setup interceptor
 * @param getToken - Clerk's getToken function để lấy token mới
 */
export const setupAxiosInterceptor = (
	axiosInstance: AxiosInstance,
	getToken: GetTokenFunction
) => {
	// Response interceptor để bắt lỗi 401 và retry với token mới
	const interceptor = axiosInstance.interceptors.response.use(
		// Success response - không cần xử lý gì
		(response) => response,
		
		// Error response - xử lý 401
		async (error: AxiosError) => {
			const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

			// Chỉ xử lý lỗi 401 (Unauthorized) và chưa retry
			if (error.response?.status === 401 && !originalRequest._retry) {
				originalRequest._retry = true;

				try {
					// Lấy token mới từ Clerk với template "HoPhap"
					const newToken = await getToken({ template: 'HoPhap' });

					if (newToken) {
						// Cập nhật token mới vào axios instance
						axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
						
						// Cập nhật token vào request gốc
						originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

						// Retry request gốc với token mới
						return axiosInstance(originalRequest);
					}
				} catch (refreshError) {
					// Nếu refresh token fail, reject promise
					// Clerk sẽ tự động redirect về login page
					console.error("Token refresh failed:", refreshError);
					return Promise.reject(refreshError);
				}
			}

			// Các lỗi khác hoặc đã retry rồi - reject luôn
			return Promise.reject(error);
		}
	);

	// Return cleanup function để remove interceptor khi unmount
	return () => {
		axiosInstance.interceptors.response.eject(interceptor);
	};
};

