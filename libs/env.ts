/**
 * Backend addresses in one place.
 * Values come from .env.local (REACT_APP_API_URL, REACT_APP_API_GRAPHQL_URL, REACT_APP_API_WS).
 * If they are missing we fall back to the default backend port instead of silently
 * calling the Next.js server itself (that caused "POST localhost:3000/graphql 404").
 */
const DEFAULT_API = 'http://127.0.0.1:3007';

const clean = (value?: string): string | null => {
	if (!value || value === 'undefined' || value === 'null') return null;
	return value.trim().replace(/\/+$/, '');
};

export const API_URL: string = clean(process.env.REACT_APP_API_URL) ?? DEFAULT_API;

export const GRAPHQL_URL: string = clean(process.env.REACT_APP_API_GRAPHQL_URL) ?? `${API_URL}/graphql`;

export const WS_URL: string = clean(process.env.REACT_APP_API_WS) ?? API_URL.replace(/^http/, 'ws');

if (typeof window !== 'undefined' && !clean(process.env.REACT_APP_API_GRAPHQL_URL)) {
	console.warn(
		`[env] REACT_APP_API_GRAPHQL_URL is not set — using ${GRAPHQL_URL}. ` +
			'Create .env.local next to package.json and restart "npm run dev".',
	);
}
