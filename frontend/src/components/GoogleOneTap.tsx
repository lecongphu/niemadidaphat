import { useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import toast from "react-hot-toast";

declare global {
	interface Window {
		google?: {
			accounts: {
				id: {
					initialize: (config: any) => void;
					prompt: (callback?: (notification: any) => void) => void;
					cancel: () => void;
				};
			};
		};
		googleOneTapInitialized?: boolean;
	}
}

const GoogleOneTap = () => {
	const { isAuthenticated, login } = useAuthStore();
	const hasInitialized = useRef(false);
	const isPrompting = useRef(false);

	useEffect(() => {
		// Don't show One-Tap if user is already signed in
		if (isAuthenticated) {
			// Cancel any pending prompts if user just logged in
			if (window.google?.accounts?.id) {
				window.google.accounts.id.cancel();
			}
			return;
		}

		// Prevent multiple initializations
		if (hasInitialized.current || window.googleOneTapInitialized) return;

		const initializeGoogleOneTap = () => {
			if (!window.google?.accounts?.id) {
				console.warn("Google Identity Services not loaded yet");
				return;
			}

			// Check if already prompting
			if (isPrompting.current) return;

			// Get the Google Client ID from environment variable
			const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
			if (!clientId) {
				console.error("VITE_GOOGLE_CLIENT_ID is not configured");
				return;
			}

			// Mark as initialized BEFORE calling initialize to prevent race conditions
			hasInitialized.current = true;
			window.googleOneTapInitialized = true;

			try {
				// Initialize Google One-Tap
				window.google.accounts.id.initialize({
					client_id: clientId,
					callback: handleCredentialResponse,
					auto_select: false,
					cancel_on_tap_outside: false,
					context: "signin",
					ux_mode: "popup",
					itp_support: true,
				});

				// Display the One-Tap prompt with a slight delay to ensure DOM is ready
				setTimeout(() => {
					if (!window.google?.accounts?.id) return;

					isPrompting.current = true;
					window.google.accounts.id.prompt((notification: any) => {
						isPrompting.current = false;

						// Log notification for debugging
						if (notification.isNotDisplayed()) {
							console.warn("One-Tap not displayed:", notification.getNotDisplayedReason());
						}
						if (notification.isSkippedMoment()) {
							console.warn("One-Tap skipped:", notification.getSkippedReason());
						}
						if (notification.isDismissedMoment()) {
							console.log("One-Tap dismissed:", notification.getDismissedReason());
						}
					});
				}, 500);
			} catch (error) {
				console.error("Error initializing Google One-Tap:", error);
				hasInitialized.current = false;
				window.googleOneTapInitialized = false;
				isPrompting.current = false;
			}
		};

		// Check if script is already loaded
		if (window.google?.accounts?.id) {
			initializeGoogleOneTap();
			return;
		}

		// Check if script is already being loaded
		const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
		if (existingScript) {
			existingScript.addEventListener("load", initializeGoogleOneTap);
			return () => {
				existingScript.removeEventListener("load", initializeGoogleOneTap);
			};
		}

		// Load Google Identity Services script
		const script = document.createElement("script");
		script.src = "https://accounts.google.com/gsi/client";
		script.async = true;
		script.defer = true;
		script.onload = initializeGoogleOneTap;
		script.onerror = () => {
			console.error("Failed to load Google Identity Services script");
			hasInitialized.current = false;
			window.googleOneTapInitialized = false;
		};

		document.head.appendChild(script);

		// Cleanup
		return () => {
			// Cancel any pending One-Tap prompts
			if (window.google?.accounts?.id && isPrompting.current) {
				try {
					window.google.accounts.id.cancel();
					isPrompting.current = false;
				} catch {
					// Ignore errors during cleanup
				}
			}
		};
	}, [isAuthenticated]);

	const handleCredentialResponse = async (response: { credential: string }) => {
		try {
			await login(response.credential);
			toast.success("Đăng nhập thành công!");
		} catch {
			toast.error("Đăng nhập thất bại. Vui lòng thử lại.");
		}
	};

	// This component doesn't render anything visible
	return null;
};

export default GoogleOneTap;
