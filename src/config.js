const PROD_URL = "https://website-sma-y1ls-4vy3hvenx-bangdastins-projects.vercel.app";
const hostname = window.location.hostname;
export const API_BASE_URL = (hostname === 'localhost') 
  ? "http://localhost:5000" 
  : (hostname.includes('vercel.app')) 
    ? PROD_URL 
    : `http://${hostname}:5000`;