// config/DjangoConfig.ts
export const BACKEND_URL = 'http://192.168.1.2:8000'; // Use your local IP address or backend domain

export const API_CONFIG = {
  ENDPOINTS: {
    LIVE_PRICES: '/api/live_prices/', // Update this to match your Django URL pattern
    USER: '/api/user/',
    FEEDS: '/api/Feeds/',
    LOGIN: '/api/login/',
    CHECK_USER: '/api/user/check/',
    SCHEMESS: '/api/getSchemes/',
    JOINSCHEMESS: '/api/join_scheme/',
    CREATE_RAZORPAY_ORDER: '/api/create-razorpay-order/', // Add this for Razorpay integration
    PAYMENT_SUCCESS: '/api/payment-success/', // Add this for payment success handling
  },
  REFRESH_INTERVAL: 3600000, // Refresh every hour (adjust as needed)
};