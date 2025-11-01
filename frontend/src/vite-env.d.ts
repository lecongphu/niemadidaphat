/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly MODE: string;
	readonly DEV: boolean;
	readonly PROD: boolean;
	readonly SSR: boolean;
	readonly BASE_URL: string;
	readonly VITE_CLERK_PUBLISHABLE_KEY: string;
	readonly VITE_BACKEND_URL?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
