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

	useEffect(() => {
		// Don't show One-Tap if user is already signed in
		if (isAuthenticated) return;

		// Prevent multiple initializations
		if (hasInitialized.current || window.googleOneTapInitialized) return;

		const initializeGoogleOneTap = () => {
			if (!window.google) return;

			// Get the Google Client ID from environment variable
			const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

			if (!clientId) {
				console.warn("Google Client ID not found. Please add VITE_GOOGLE_CLIENT_ID to your .env file");
				return;
			}

			// Mark as initialized
			hasInitialized.current = true;
			window.googleOneTapInitialized = true;

			// Initialize Google One-Tap
			window.google.accounts.id.initialize({
				client_id: clientId,
				callback: handleCredentialResponse,
				auto_select: false,
				cancel_on_tap_outside: true,
				context: "signin",
			});

			// Display the One-Tap prompt
			window.google.accounts.id.prompt((notification: any) => {
				if (notification.isNotDisplayed()) {
					console.log("One-Tap could not be displayed");
				} else if (notification.isSkippedMoment()) {
					console.log("One-Tap was skipped");
				}
			});
		};

		// Check if script is already loaded
		if (window.google) {
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

		document.head.appendChild(script);

		// Cleanup
		return () => {
			// Cancel any pending One-Tap prompts
			if (window.google?.accounts?.id) {
				window.google.accounts.id.cancel();
			}
		};
	}, [isAuthenticated]);

	const handleCredentialResponse = async (response: { credential: string }) => {
		try {
			await login(response.credential);
			toast.success("Đăng nhập thành công!");
		} catch (error) {
			console.error("Error handling Google One-Tap credential:", error);
			toast.error("Đăng nhập thất bại. Vui lòng thử lại.");
		}
	};

	// This component doesn't render anything visible
	return null;
};

export default GoogleOneTap;
