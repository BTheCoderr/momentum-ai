// Mobile App Configuration
export const API_CONFIG = {
  // Use your network IP for mobile development
  BASE_URL: __DEV__ ? 'http://10.225.13.180:3000' : 'https://your-production-url.com',
  
  // API Endpoints
  ENDPOINTS: {
    CHAT: '/api/ai/productivity-coach',  // Use our new productivity-focused coach
    GOALS: '/api/goals', 
    INSIGHTS: '/api/ai/reflect',
    CHECKINS: '/api/checkins',
    STREAKS: '/api/streaks'
  },
  
  // API Timeouts (in milliseconds)
  TIMEOUTS: {
    DEFAULT: 30000, // 30 seconds
    UPLOAD: 60000,  // 60 seconds for uploads
    AI: 45000      // 45 seconds for AI operations
  }
};

// Mobile UI Configuration
export const MOBILE_CONFIG = {
  // Optimize for mobile performance
  ANIMATION_DURATION: 200,
  HAPTIC_FEEDBACK: true,
  AUTO_SAVE_DELAY: 1000,
  
  // Mobile-specific features
  FEATURES: {
    PUSH_NOTIFICATIONS: true,
    OFFLINE_MODE: true,
    DARK_MODE: true,
    BIOMETRIC_AUTH: false // Future feature
  }
};

// Development helpers
export const isDev = __DEV__;
export const isWeb = typeof window !== 'undefined';
export const isMobile = !isWeb; 