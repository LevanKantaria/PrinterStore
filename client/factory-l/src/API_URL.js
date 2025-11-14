// Normalize API_URL to remove trailing slash for consistent path concatenation
const rawUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
export const API_URL = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
// export const API_URL = 'https://factory-l.herokuapp.com/'