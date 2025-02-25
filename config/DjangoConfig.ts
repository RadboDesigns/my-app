// config/DjangoConfig.js
export const BACKEND_URL = 'http://192.168.1.2:8000'; // Use your local IP address

export const API_CONFIG = {
  ENDPOINTS: {
    LIVE_PRICES: '/api/live_prices/', // Update this to match your Django URL pattern
    USER: '/api/user/',
    FEEDS: '/api/Feeds/',
    LOGIN: '/api/login/',
    CHECK_USER: '/api/user/check/',
    SCHEMESS: '/api/getSchemes/',
    JOINSCHEMESS: '/api/join_scheme/',
  },
  REFRESH_INTERVAL: 3600000, // Refresh every minute (adjust as needed)
};