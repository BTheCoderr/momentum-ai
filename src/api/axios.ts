import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Use your web app's API endpoints
const api = axios.create({ 
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.log('Error getting token:', error);
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, clear it
      await SecureStore.deleteItemAsync('accessToken');
    }
    return Promise.reject(error);
  }
);

export default api; 