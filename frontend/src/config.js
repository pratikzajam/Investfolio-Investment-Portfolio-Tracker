const rawUrl = import.meta.env.VITE_BACKEND_URL || 'https://investment-backend.vercel.app';
export const API_BASE_URL = rawUrl.replace(/\/+$/, '');
