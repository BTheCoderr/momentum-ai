// Environment configuration for Momentum AI

export const ENV_CONFIG = {
  // API URLs
  MOMENTUM_API_URL: 'https://api.momentum-ai.app',
  SUPABASE_URL: 'https://nsgqhhbqpyvonirlfluv.supabase.co',
  
  // Feature flags
  OFFLINE_MODE: true,
  DEVELOPMENT_MODE: __DEV__,
  
  // Claude AI Configuration
  CLAUDE_ENABLED: true,
};

/**
 * Get environment variables with fallbacks
 */
export const getEnvVar = (key: string, fallback?: string): string | undefined => {
  const possibleKeys = [
    process.env[key],
    process.env[`NEXT_PUBLIC_${key}`],
    process.env[`EXPO_PUBLIC_${key}`],
    process.env[`REACT_NATIVE_${key}`],
  ];

  return possibleKeys.find(val => val && val.length > 0) || fallback;
};

/**
 * Get Claude API key from various possible environment variable names
 */
export const getClaudeApiKey = (): string | null => {
  const possibleKeys = [
    'CLAUDE_API_KEY',
    'ANTHROPIC_API_KEY',
    'AI_API_KEY',
  ];

  for (const key of possibleKeys) {
    const value = getEnvVar(key);
    if (value && value.length > 10) { // Basic validation
      return value;
    }
  }

  return null;
};

/**
 * Check if we're in development mode
 */
export const isDevelopment = (): boolean => {
  return ENV_CONFIG.DEVELOPMENT_MODE || false;
};

/**
 * Get API configuration
 */
export const getApiConfig = () => {
  return {
    momentumApiUrl: getEnvVar('MOMENTUM_API_URL') || ENV_CONFIG.MOMENTUM_API_URL,
    supabaseUrl: getEnvVar('SUPABASE_URL') || ENV_CONFIG.SUPABASE_URL,
    supabaseAnonKey: getEnvVar('SUPABASE_ANON_KEY'),
    offlineMode: ENV_CONFIG.OFFLINE_MODE,
  };
}; 