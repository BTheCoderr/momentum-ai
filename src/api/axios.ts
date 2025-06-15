import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

// Get API URL from Expo config or fallback to local development
const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://10.225.8.234:3001/api';

// Debug: Log the API URL being used
console.log('🔍 API_URL being used:', API_URL);
console.log('🔍 Constants.expoConfig?.extra:', Constants.expoConfig?.extra);

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
    const token = await SecureStore.getItemAsync('accessToken');
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
      await SecureStore.deleteItemAsync('accessToken');
    } else if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNREFUSED') {
      console.log('Network error - using offline mode');
      // You can implement offline functionality here
    }
    console.log('❌ API error:', error.response?.status, error.message);
    return Promise.reject(error);
  }
);

export default api; 