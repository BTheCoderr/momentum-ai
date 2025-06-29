import axios from 'axios';

// Safe SecureStore wrapper with module existence check
const SafeSecureStore = {
  async setItemAsync(key: string, value: string) {
    try {
      // Check if the module exists first
      const SecureStore = require('expo-secure-store');
      if (SecureStore && SecureStore.setItemAsync) {
        return await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      // Module not available
    }
    console.log('SecureStore not available, skipping token storage');
    return Promise.resolve();
  },
  async getItemAsync(key: string) {
    try {
      // Check if the module exists first
      const SecureStore = require('expo-secure-store');
      if (SecureStore && SecureStore.getItemAsync) {
        return await SecureStore.getItemAsync(key);
      }
    } catch (error) {
      // Module not available
    }
    console.log('SecureStore not available, no stored token');
    return Promise.resolve(null);
  },
  async deleteItemAsync(key: string) {
    try {
      // Check if the module exists first
      const SecureStore = require('expo-secure-store');
      if (SecureStore && SecureStore.deleteItemAsync) {
        return await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      // Module not available
    }
    console.log('SecureStore not available, skipping token deletion');
    return Promise.resolve();
  }
};

// Safe Constants wrapper with module existence check
const SafeConstants = {
  get expoConfig() {
    try {
      const Constants = require('expo-constants');
      if (Constants && Constants.default && Constants.default.expoConfig) {
        return Constants.default.expoConfig;
      }
    } catch (error) {
      // Module not available
    }
    console.log('Constants not available, using fallback config');
    return {
      extra: {
        apiUrl: 'http://10.225.8.234:3001/api'
      }
    };
  }
};

// Get API URL from Expo config or fallback to local development
const API_URL = SafeConstants.expoConfig?.extra?.apiUrl || 'http://10.225.8.234:3001/api';

// Debug: Log the API URL being used
console.log('🔍 API_URL being used:', API_URL);
console.log('🔍 SafeConstants.expoConfig?.extra:', SafeConstants.expoConfig?.extra);

const api = axios.create({ 
  baseURL: API_URL,
  timeout: 10000, // Increased timeout to 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  try {
    const token = await SafeSecureStore.getItemAsync('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Debug: Log the full request URL
    console.log('🚀 Making API request to:', `${config.baseURL || 'unknown'}${config.url || ''}`);
  } catch (error) {
    console.log('Error getting token:', error);
  }
  return config;
});

// Handle auth errors and network issues
api.interceptors.response.use(
  (response) => {
    console.log('✅ API response received:', response.status);
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, clear it
      await SafeSecureStore.deleteItemAsync('accessToken');
    } else if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNREFUSED') {
      console.log('Network error - using offline mode');
      // You can implement offline functionality here
    }
    console.log('❌ API error:', error.response?.status, error.message);
    return Promise.reject(error);
  }
);

export default api; 