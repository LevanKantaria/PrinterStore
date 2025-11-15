// Normalize API_URL to remove trailing slash for consistent path concatenation
const rawUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
export const API_URL = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
// Production API URL: https://printerstore.onrender.com