import Constants from 'expo-constants';

// Mobile App Configuration
export const API_CONFIG = {
  // AI Backend - running on port 8000
  BASE_URL: __DEV__ ? 'http://localhost:8000' : 'https://your-ai-backend-url.com',
  
  // Legacy API URLs (for non-AI services if needed)
  LEGACY_BASE_URL: __DEV__ ? 'http://localhost:3000' : 'https://your-production-url.com',
  
  // AI-Enhanced API Endpoints (matching the actual running backend)
  ENDPOINTS: {
    // AI Services - Actual endpoints from the running backend
    SMART_COACH: '/smart-coaching',
    BEHAVIOR_TRACK: '/behavior-tracking', 
    DRIFT_PREDICT: '/drift-prediction',
    INSIGHTS: '/insights-generation',
    FUTURE_PLAN: '/future-planning',
    SEMANTIC_SEARCH: '/semantic-search',
    HEALTH: '/health',
    USER_CONTEXT: '/user-context',
    
    // Legacy Endpoints (if needed for fallback)
    CHAT: '/api/ai/productivity-coach',  // Legacy coach fallback
    GOALS: '/api/goals', 
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

export const getApiUrl = () => {
  const apiUrl = Constants.expoConfig?.extra?.apiUrl || 'https://api.momentum-ai.app';
  return apiUrl;
};

export const isOfflineMode = () => {
  return Constants.expoConfig?.extra?.offlineMode || false;
}; 