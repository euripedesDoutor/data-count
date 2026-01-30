const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/datacount' : 'http://localhost:3000');

export const getApiUrl = (path: string) => {
    // Ensure a clean base URL without trailing slash
    const cleanBase = API_BASE_URL.replace(/\/+$/, '');
    // Ensure path starts with exactly one slash
    const cleanPath = path.startsWith('/') ? path : '/' + path;

    return `${cleanBase}${cleanPath}`;
};
