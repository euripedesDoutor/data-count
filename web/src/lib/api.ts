const getApiBase = () => {
    // 1. Try environment variable from build
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;

    // 2. Try to detect from current path (for VPS/subpath environments)
    if (typeof window !== 'undefined' && window.location.pathname.includes('/datacount')) {
        return '/datacount';
    }

    // 3. Local development fallback
    return 'http://localhost:3000';
};

const API_BASE_URL = getApiBase();

export const getApiUrl = (path: string) => {
    const cleanBase = API_BASE_URL.replace(/\/+$/, '');
    const cleanPath = path.startsWith('/') ? path : '/' + path;
    const finalUrl = `${cleanBase}${cleanPath}`;

    // Log the generated URL to help debugging in the browser console
    console.log(`[API] Path: ${path} -> Full URL: ${finalUrl}`);

    return finalUrl;
};
