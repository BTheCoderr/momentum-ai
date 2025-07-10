// Configuration for Claude API integration
export const CLAUDE_CONFIG = {
  // Claude API endpoint
  API_URL: 'https://api.anthropic.com/v1/messages',
  
  // Model to use
  MODEL: 'claude-3-sonnet-20240229',
  
  // API version
  API_VERSION: '2023-06-01',
  
  // Default max tokens for responses
  MAX_TOKENS: 1000,
  
  // Rate limiting (requests per minute)
  RATE_LIMIT: 60,
};

/**
 * Get Claude API key from environment
 * Supports multiple environment variable names for flexibility
 */
export function getClaudeApiKey(): string | null {
  // Try different possible environment variable names
  const possibleKeys = [
    process.env.CLAUDE_API_KEY,
    process.env.ANTHROPIC_API_KEY,
    process.env.NEXT_PUBLIC_CLAUDE_API_KEY,
    process.env.EXPO_PUBLIC_CLAUDE_API_KEY,
  ];

  return possibleKeys.find(key => key && key.length > 0) || null;
}

/**
 * Check if Claude API is available
 */
export function isClaudeAvailable(): boolean {
  return getClaudeApiKey() !== null;
} 