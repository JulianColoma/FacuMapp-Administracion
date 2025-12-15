// Resolve API URL smartly for local and LAN access
// Priority: explicit VITE_API_URL -> same-host (LAN) :3000 -> localhost fallback
const sameHostApi = typeof window !== 'undefined'
	? `http://${window.location.hostname}:3000`
	: 'http://localhost:3000';

export const API_URL = import.meta.env.VITE_API_URL || sameHostApi || 'http://localhost:3000';
