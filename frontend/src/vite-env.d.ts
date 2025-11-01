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

// CSS module declarations
declare module '*.css' {
	const content: Record<string, string>;
	export default content;
}

declare module '*.scss' {
	const content: Record<string, string>;
	export default content;
}

declare module '*.sass' {
	const content: Record<string, string>;
	export default content;
}

declare module '*.less' {
	const content: Record<string, string>;
	export default content;
}
