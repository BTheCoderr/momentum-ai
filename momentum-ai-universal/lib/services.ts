import { supabase, Goal, Message } from './supabase'
import axios from 'axios';
import Constants from 'expo-constants';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// HARDCODED API URL - bypass config cache issues
const API_URL = 'http://10.225.2.129:3000/api';

console.log('🔍 HARDCODED API_URL being used:', API_URL);
console.log('🔍 Constants.expoConfig?.extra:', Constants.expoConfig?.extra);

// Demo Account Configuration for App Store Review
export const DEMO_ACCOUNT = {
  username: 'demo',
  password: 'demo123',
  userId: 'demo-user-app-store',
  email: 'demo@momentum-ai.app',
  name: 'Demo User'
};

// Demo data for App Store reviewers
export const DEMO_DATA = {
  goals: [
    {
      id: 'demo-goal-1',
      title: 'Exercise Daily',
      description: 'Complete 30 minutes of exercise every day',
      progress: 75,
      streak: 12,
      created_at: '2025-01-15T00:00:00Z'
    },
    {
      id: 'demo-goal-2', 
      title: 'Read for 20 Minutes',
      description: 'Read personal development books daily',
      progress: 60,
      streak: 8,
      created_at: '2025-01-10T00:00:00Z'
    }
  ],
  userStats: {
    current_streak: 12,
    best_streak: 21,
    total_checkins: 45,
    total_goals: 2,
    completed_goals: 3,
    totalXP: 1250,
    level: 5,
    motivationScore: 94
  },
  recentCheckins: [
    {
      id: 'demo-checkin-1',
      date: new Date().toISOString().split('T')[0],
      mood: 8,
      energy: 7,
      stress: 3,
      wins: 'Completed morning workout and had a productive work session',
      challenges: 'Felt a bit tired in the afternoon',
      priorities: 'Focus on the big presentation tomorrow',
      reflection: 'Great day overall, feeling motivated!'
    }
  ]
};

// Configure axios with shorter timeout for mobile
const api = axios.create({
  baseURL: API_URL,
  timeout: 5000, // Reduced from 10s to 5s for better mobile experience
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log('🚀 Making API request to:', `${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request setup error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    console.log('✅ API response received:', response.status);
    return response;
  },
  (error) => {
    console.log('❌ API error:', error.code, error.message);
    
    // Provide user-friendly error messages
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.warn('⚠️ Request timed out, using fallback');
      return Promise.reject(new Error('Connection timeout - check your internet connection'));
    }
    
    if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
      console.warn('⚠️ Network error, using fallback');
      return Promise.reject(new Error('Network error - please check your connection'));
    }
    
    return Promise.reject(error);
  }
);

// Helper function to handle API errors gracefully
const handleApiError = (error: any, fallbackData: any = null, context: string = '') => {
  console.error(`Error ${context}:`, error);
  
  // Return fallback data instead of throwing
  if (fallbackData !== null) {
    console.log(`📱 Using fallback data for ${context}`);
    return fallbackData;
  }
  
  throw error;
};

// Types for our data structures
export interface CheckIn {
  id?: string
  user_id?: string
  date: string
  mood: number
  energy: number
  stress: number
  wins: string
  challenges: string
  priorities: string
  reflection: string
  created_at?: string
}

export interface Reflection {
  id?: string
  user_id?: string
  date: string
  answers: string[]
  word_count: number
  created_at?: string
}

export interface UserStats {
  id?: string
  user_id?: string
  current_streak: number
  best_streak: number
  total_checkins: number
  total_goals: number
  updated_at?: string
  overallProgress?: number
  activeGoals?: number
  aiInterventions?: number
  motivationScore?: number
  completed_goals?: number
  completedGoals?: number
  totalGoals?: number
  averageProgress?: number
  longest_streak?: number
  totalXP?: number
  level?: number
  lastXPGain?: number
  lastXPAction?: string
}

export interface Insight {
  id: string
  type: 'pattern' | 'encouragement' | 'suggestion' | 'reflection'
  title: string
  content: string
  action?: string
  created_at?: string
  emoji?: string
  category?: string
  createdAt?: Date
}

// Get API URL from environment or use fallback
const getApiUrl = () => {
  // Check if we have a hardcoded URL for development
  const hardcodedUrl = 'http://10.225.2.129:3000/api';
  
  // Log for debugging
  console.log('🔍 HARDCODED API_URL being used:', hardcodedUrl);
  console.log('🔍 Constants.expoConfig?.extra:', Constants.expoConfig?.extra);
  
  return hardcodedUrl;
};

const API_BASE_URL = getApiUrl();

// Utility function for API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  console.log('🚀 Making API request to:', url);
  
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Get user token if available
  try {
    const userToken = await AsyncStorage.getItem('userToken');
    if (userToken) {
      defaultHeaders['Authorization'] = `Bearer ${userToken}`;
    }
  } catch (error) {
    console.warn('Could not get user token:', error);
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      console.log('❌ API error:', response.status, response.statusText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    console.log('✅ API response received:', response.status);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Goal Services
export const goalServices = {
  async getAll() {
    try {
      const userId = await AsyncStorage.getItem('userId') || 'demo-user';
      const response = await apiCall(`/goals?userId=${userId}`);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching goals:', error);
      // Return fallback data
      return [];
    }
  },

  async create(goalData: any) {
    try {
      const userId = await AsyncStorage.getItem('userId') || 'demo-user';
      const response = await apiCall('/goals', {
        method: 'POST',
        body: JSON.stringify({
          ...goalData,
          userId,
          id: Date.now().toString(), // Generate temporary ID
        }),
      });
      return response;
    } catch (error) {
      console.error('Error creating goal:', error);
      throw error;
    }
  },

  async update(goalId: string, updates: any) {
    try {
      const response = await apiCall(`/goals/${goalId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      return response;
    } catch (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
  },

  async delete(goalId: string) {
    try {
      const response = await apiCall(`/goals/${goalId}`, {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  },
};

// User Services
export const userServices = {
  async getStats() {
    try {
      const userId = await AsyncStorage.getItem('userId') || 'demo-user';
      const response = await apiCall(`/user/stats?userId=${userId}`);
      return response;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      // Return fallback data
      return {
        totalXP: 0,
        level: 1,
        streak: 0,
        goalsCompleted: 0,
        checkinsThisWeek: 0,
      };
    }
  },

  async updateXP(xpGained: number, reason: string) {
    try {
      const userId = await AsyncStorage.getItem('userId') || 'demo-user';
      const response = await apiCall('/user/stats', {
        method: 'POST',
        body: JSON.stringify({
          userId,
          xpGained,
          reason,
        }),
      });
      return response;
    } catch (error) {
      console.error('Error updating XP:', error);
      throw error;
    }
  },
};

// Check-in Services
export const checkinServices = {
  async getAll() {
    try {
      const userId = await AsyncStorage.getItem('userId') || 'demo-user';
      const response = await apiCall(`/checkins?userId=${userId}`);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching check-ins:', error);
      return [];
    }
  },

  async getRecent(limit: number = 7) {
    try {
      const userId = await AsyncStorage.getItem('userId') || 'demo-user';
      const response = await apiCall(`/checkins?userId=${userId}&limit=${limit}`);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching recent check-ins:', error);
      return [];
    }
  },

  async create(checkinData: any) {
    try {
      const userId = await AsyncStorage.getItem('userId') || 'demo-user';
      const response = await apiCall('/checkins', {
        method: 'POST',
        body: JSON.stringify({
          ...checkinData,
          userId,
          timestamp: new Date().toISOString(),
        }),
      });
      return response;
    } catch (error) {
      console.error('Error creating check-in:', error);
      throw error;
    }
  },
};

// Chat Services
export const chatServices = {
  async getHistory() {
    try {
      const userId = await AsyncStorage.getItem('userId') || 'demo-user';
      const response = await apiCall(`/chat/history?userId=${userId}`);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching chat history:', error);
      return [];
    }
  },

  async sendMessage(message: string) {
    try {
      const userId = await AsyncStorage.getItem('userId') || 'demo-user';
      const response = await apiCall('/chat', {
        method: 'POST',
        body: JSON.stringify({
          userId,
          message,
          timestamp: new Date().toISOString(),
        }),
      });
      return response;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },
};

// Message Services (for AI Coach)
export const messageServices = {
  async getAll(userId?: string): Promise<Message[]> {
    try {
      const response = await api.get('/chat/history', {
        params: { userId }
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, [], 'fetching chat history');
    }
  },

  async create(message: Omit<Message, 'id' | 'timestamp'>): Promise<Message | null> {
    try {
      const response = await api.post('/messages', message);
      return response.data;
    } catch (error) {
      // Save offline message
      const offlineMessage = {
        ...message,
        id: `offline_${Date.now()}`,
        offline: true,
        createdAt: new Date().toISOString()
      };
      return offlineMessage;
    }
  },
}

// Reflection Services
export const reflectionServices = {
  async create(reflection: Reflection): Promise<Reflection | null> {
    try {
      const { data, error } = await supabase
        .from('reflections')
        .insert([reflection])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating reflection:', error)
      return null
    }
  },

  async getRecent(limit: number = 10): Promise<Reflection[]> {
    try {
      const { data, error } = await supabase
        .from('reflections')
        .select('*')
        .order('date', { ascending: false })
        .limit(limit)
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching recent reflections:', error)
      return []
    }
  }
}

// User Stats Services
export const userStatsServices = {
  async get(userId?: string): Promise<UserStats> {
    try {
      console.log('🚀 Making API request to:', `${API_URL}/user/stats`);
      const response = await axios.get(`${API_URL}/user/stats`, {
        params: { userId },
        timeout: 5000
      });
      return response.data;
    } catch (error: any) {
      console.log('❌ API error:', error.code, error.message);
      console.log('Error fetching user stats:', error);
      
      // Return fallback data
      return {
        current_streak: 0,
        best_streak: 0,
        total_checkins: 0,
        overallProgress: 0,
        activeGoals: 0,
        aiInterventions: 0,
        motivationScore: 70,
        total_goals: 0,
        completed_goals: 0,
        averageProgress: 0
      };
    }
  },

  async update(userId?: string): Promise<UserStats> {
    try {
      console.log('🚀 Making API request to:', `${API_URL}/user/stats`);
      const response = await axios.post(`${API_URL}/user/stats`, {
        userId,
        timestamp: new Date().toISOString()
      }, {
        timeout: 5000
      });
      return response.data;
    } catch (error: any) {
      console.log('❌ API error:', error.code, error.message);
      console.log('Error updating user stats:', error);
      
      // Return fallback data
      return {
        current_streak: 0,
        best_streak: 0,
        total_checkins: 0,
        overallProgress: 0,
        activeGoals: 0,
        aiInterventions: 0,
        motivationScore: 70,
        total_goals: 0,
        completed_goals: 0,
        averageProgress: 0
      };
    }
  }
};

// AI Services
export const aiServices = {
  async sendMessage(message: string, context?: any): Promise<string> {
    try {
      const response = await api.post('/ai/smart-coach', {
        message,
        context
      });
      return response.data.message || response.data;
    } catch (error) {
      // Return fallback AI response
      const fallbackResponses = [
        "I'm having trouble connecting right now, but I'm still here for you! Keep up the great work! 💪",
        "Even though I can't access all my insights right now, I believe in your ability to stay consistent! 🌟",
        "Connection issues won't stop your momentum! You've got this, and I'll be back online soon! 🚀"
      ];
      
      const fallbackResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      return fallbackResponse;
    }
  },

  async getInsights(userId?: string) {
    try {
      const response = await api.get('/ai/reflect', {
        params: { userId }
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, [], 'getting AI insights');
    }
  }
};

// User Profile Services
export const userProfileServices = {
  async get(userId?: string) {
    try {
      const response = await api.get('/user/profile', {
        params: { userId }
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, null, 'fetching user profile');
    }
  },

  async update(userId: string, profile: any) {
    try {
      const response = await api.put('/user/profile', { userId, ...profile });
      return response.data;
    } catch (error) {
      return handleApiError(error, { ...profile, offline: true }, 'updating user profile');
    }
  }
};

// Helper function to get AI context
async function getAIContext(userId?: string) {
  const [goals, recentCheckins, userStats] = await Promise.all([
    goalServices.getAll(),
    checkinServices.getRecent(3),
    userStatsServices.get(userId)
  ])
  
  return {
    goals: Array.isArray(goals) ? goals.slice(0, 5) : [], // Last 5 goals
    recentCheckins: Array.isArray(recentCheckins) ? recentCheckins : [],
    userStats,
    timestamp: new Date().toISOString()
  }
}

// Mock insights for offline/fallback
function generateMockInsights(): Insight[] {
  return [
    {
      id: '1',
      type: 'encouragement',
      title: 'You\'re Building Momentum! 🚀',
      content: 'Your consistency this week shows real commitment to your goals. Keep up the great work!',
      action: 'celebrate'
    },
    {
      id: '2',
      type: 'pattern',
      title: 'Morning Energy Peak Detected ⚡',
      content: 'You tend to have higher energy levels in the morning. Consider scheduling important tasks then.',
      action: 'optimize'
    },
    {
      id: '3',
      type: 'suggestion',
      title: 'Break Down Your Big Goal 🎯',
      content: 'Your main goal could benefit from smaller, daily milestones. This makes progress more visible.',
      action: 'plan'
    },
    {
      id: '4',
      type: 'reflection',
      title: 'Weekly Reflection Reminder 🤔',
      content: 'It\'s been a few days since your last deep reflection. Taking time to reflect can provide valuable insights.',
      action: 'reflect'
    }
  ]
}

// Utility functions
export const utils = {
  formatDate(date: Date): string {
    return date.toISOString().split('T')[0]
  },

  getDaysAgo(days: number): string {
    const date = new Date()
    date.setDate(date.getDate() - days)
    return utils.formatDate(date)
  },

  calculateStreak(checkins: CheckIn[]): number {
    if (checkins.length === 0) return 0
    
    const today = new Date()
    let streak = 0
    
    for (let i = 0; i < checkins.length; i++) {
      const checkinDate = new Date(checkins[i].date)
      const daysDiff = Math.floor((today.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDiff === streak) {
        streak++
      } else {
        break
      }
    }
    
    return streak
  }
}

// Gamification System
export const getXPFromCheckIn = (streak: number): number => {
  return 10 + Math.min(streak * 2, 50); // Base 10 XP, +2 per streak day, max bonus 50
};

export const getXPFromGoal = (goalType: 'created' | 'completed' | 'milestone'): number => {
  switch (goalType) {
    case 'created': return 25;
    case 'milestone': return 50;
    case 'completed': return 100;
    default: return 10;
  }
};

export const levelFromXP = (xp: number): number => {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
};

export const xpForNextLevel = (currentLevel: number): number => {
  return Math.pow(currentLevel, 2) * 100;
};

export const updateUserXP = async (userId: string, xpGained: number, action: string) => {
  try {
    const currentStats = await userStatsServices.get(userId);
    const newXP = (currentStats?.totalXP || 0) + xpGained;
    const newLevel = levelFromXP(newXP);
    const oldLevel = levelFromXP(currentStats?.totalXP || 0);
    
    // For now, we'll just return the calculated values
    // In a real app, you'd update the backend here
    console.log(`XP Update: ${action} +${xpGained} XP (Total: ${newXP}, Level: ${newLevel})`);
    
    return {
      xpGained,
      newXP,
      newLevel,
      leveledUp: newLevel > oldLevel,
      action
    };
  } catch (error) {
    console.error('Failed to update XP:', error);
    throw error;
  }
};

// Toast System
export const showToast = (type: 'success' | 'error' | 'info', message: string) => {
  // For React Native, we'll use Alert for now, can be replaced with react-native-toast-message
  if (typeof Alert !== 'undefined') {
    Alert.alert(type === 'error' ? 'Error' : 'Success', message);
  }
};

// Authentication Services
export const authServices = {
  async signIn(username: string, password: string) {
    // Check for demo account
    if (username === DEMO_ACCOUNT.username && password === DEMO_ACCOUNT.password) {
      console.log('🎯 Demo account login successful');
      
      // Store demo user info
      await AsyncStorage.setItem('userId', DEMO_ACCOUNT.userId);
      await AsyncStorage.setItem('userToken', 'demo-token');
      await AsyncStorage.setItem('userName', DEMO_ACCOUNT.name);
      await AsyncStorage.setItem('userEmail', DEMO_ACCOUNT.email);
      await AsyncStorage.setItem('isDemo', 'true');
      
      return {
        success: true,
        user: {
          id: DEMO_ACCOUNT.userId,
          email: DEMO_ACCOUNT.email,
          name: DEMO_ACCOUNT.name
        }
      };
    }
    
    // Regular authentication would go here
    try {
      const response = await apiCall('/auth/signin', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      
      if (response.success) {
        await AsyncStorage.setItem('userId', response.user.id);
        await AsyncStorage.setItem('userToken', response.token);
        await AsyncStorage.setItem('userName', response.user.name);
        await AsyncStorage.setItem('userEmail', response.user.email);
      }
      
      return response;
    } catch (error) {
      console.error('Auth error:', error);
      return { success: false, error: 'Authentication failed' };
    }
  },

  async isDemo() {
    try {
      const isDemo = await AsyncStorage.getItem('isDemo');
      return isDemo === 'true';
    } catch {
      return false;
    }
  },

  async getCurrentUser() {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const userName = await AsyncStorage.getItem('userName');
      const userEmail = await AsyncStorage.getItem('userEmail');
      const isDemo = await this.isDemo();
      
      if (userId) {
        return {
          id: userId,
          name: userName,
          email: userEmail,
          isDemo
        };
      }
      return null;
    } catch {
      return null;
    }
  },

  async signOut() {
    try {
      await AsyncStorage.multiRemove([
        'userId', 'userToken', 'userName', 'userEmail', 'isDemo'
      ]);
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false };
    }
  }
};

export default {
  userStatsServices,
  goalServices,
  checkinServices,
  messageServices,
  aiServices,
  utils
}; 