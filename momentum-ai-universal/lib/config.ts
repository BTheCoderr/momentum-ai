// Mobile App Configuration
export const API_CONFIG = {
  // Use your network IP for mobile development (check if server is running on port 3000)
  BASE_URL: __DEV__ ? 'http://10.225.2.129:3000' : 'https://your-production-url.com',
  
  // API Endpoints
  ENDPOINTS: {
    CHAT: '/api/ai/productivity-coach',  // Use our new productivity-focused coach
    GOALS: '/api/goals', 
    INSIGHTS: '/api/ai/reflect',
    CHECKINS: '/api/checkins',
    STREAKS: '/api/streaks'
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