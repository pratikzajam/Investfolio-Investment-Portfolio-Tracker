const rawUrl = import.meta.env.VITE_BACKEND_URL || 'https://investfolio-investment-portfolio-tr.vercel.app';
export const API_BASE_URL = rawUrl.replace(/\/+$/, '');
