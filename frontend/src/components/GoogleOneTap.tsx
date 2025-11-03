import { useEffect } from "react";
import { useSignIn, useUser } from "@clerk/clerk-react";

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
	}
}

const GoogleOneTap = () => {
	const { signIn, isLoaded: signInLoaded } = useSignIn();
	const { isSignedIn } = useUser();

	useEffect(() => {
		// Don't show One-Tap if user is already signed in or Clerk is not loaded
		if (isSignedIn || !signInLoaded) return;

		// Load Google Identity Services script
		const script = document.createElement("script");
		script.src = "https://accounts.google.com/gsi/client";
		script.async = true;
		script.defer = true;

		script.onload = () => {
			if (!window.google) return;

			// Get the Google Client ID from environment variable
			const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

			if (!clientId) {
				console.warn("Google Client ID not found. Please add VITE_GOOGLE_CLIENT_ID to your .env file");
				return;
			}

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

		document.body.appendChild(script);

		// Cleanup
		return () => {
			if (document.body.contains(script)) {
				document.body.removeChild(script);
			}
			// Cancel any pending One-Tap prompts
			if (window.google?.accounts?.id) {
				window.google.accounts.id.cancel();
			}
		};
	}, [isSignedIn, signInLoaded]);

	const handleCredentialResponse = async (response: { credential: string }) => {
		try {
			if (!signIn) return;

			// Since Clerk handles OAuth separately, we'll redirect to Google OAuth
			// The credential from One-Tap can't be used directly with Clerk
			// So we trigger the standard OAuth flow
			await signIn.authenticateWithRedirect({
				strategy: "oauth_google",
				redirectUrl: "/sso-callback",
				redirectUrlComplete: "/auth-callback",
			});
		} catch (error) {
			console.error("Error handling Google One-Tap credential:", error);
		}
	};

	// This component doesn't render anything visible
	return null;
};

export default GoogleOneTap;
