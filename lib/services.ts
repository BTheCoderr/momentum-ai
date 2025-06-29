import type { Goal, Message } from './supabase';
import { supabase } from './supabase';
import axios from 'axios';
// import Constants from 'expo-constants'; // Removed direct import to prevent native module errors
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// Enable offline mode for App Store review
const OFFLINE_MODE = true;

// Get configuration from multiple sources (env vars, app config, fallbacks)
const getAPIConfig = () => {
  let apiUrl = process.env.API_URL;
  
  // If env vars not available, try to get from app config (development builds)
  if (!apiUrl) {
    try {
      const Constants = require('expo-constants');
      const extra = Constants.expoConfig?.extra || Constants.default?.expoConfig?.extra;
      
      if (extra) {
        apiUrl = extra.apiUrl;
      }
    } catch (error) {
      // Constants not available, use fallback
    }
  }
  
  // Final fallback
  apiUrl = apiUrl || 'http://10.225.13.180:3000/api';
  
  return { apiUrl };
};

// Get API URL from environment or use fallback
const getApiUrl = () => {
  const { apiUrl } = getAPIConfig();
  console.log('🔍 API_URL being used:', apiUrl);
  console.log('🔍 OFFLINE_MODE enabled:', OFFLINE_MODE);
  return apiUrl;
};

const API_URL = getApiUrl();

// Configure axios with better timeout and retry logic
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 seconds - match the error timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Add response interceptor for better error handling and offline support
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, message } = error;
    
    // If offline mode is enabled, always return demo data
    if (OFFLINE_MODE) {
      console.log('📱 Offline mode enabled, using demo data');
      return { data: getDemoData(config.url) };
    }

    // Check network connectivity
    const networkState = await NetInfo.fetch();
    if (!networkState.isConnected) {
      console.log('📱 No network connection, using offline data');
      try {
        const offlineData = await AsyncStorage.getItem(`offline_${config.url}`);
        if (offlineData) {
          return { data: JSON.parse(offlineData) };
        }
        // If no offline data, return demo data as fallback
        return { data: getDemoData(config.url) };
      } catch (e) {
        console.error('Error reading offline data:', e);
        return { data: getDemoData(config.url) };
      }
    }

    // If we get here, we're online but had an error
    console.error('❌ API Error:', message);
    return { data: getDemoData(config.url) };
  }
);

// Add request interceptor for authentication and logging
api.interceptors.request.use(
  async (config) => {
    // Check network before making request
    const networkState = await NetInfo.fetch();
    if (!networkState.isConnected) {
      return Promise.reject(new Error('No network connection'));
    }

    // Add auth token if available
    const session = await supabase.auth.getSession();
    if (session?.data?.session?.access_token) {
      config.headers.Authorization = `Bearer ${session.data.session.access_token}`;
    }
    
    console.log('🚀 Making API request to:', `${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request setup error:', error);
    return Promise.reject(error);
  }
);

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

// Helper function to get demo data based on endpoint
const getDemoData = (endpoint: string) => {
  if (endpoint.includes('/goals')) return DEMO_DATA.goals;
  if (endpoint.includes('/stats')) return DEMO_DATA.userStats;
  if (endpoint.includes('/checkins')) return DEMO_DATA.recentCheckins;
  return null;
};

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

// Utility function for API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_URL}${endpoint}`;
  
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

export const isDemo = async () => {
  if (OFFLINE_MODE) return true;
  const demoMode = await AsyncStorage.getItem('demoMode');
  return demoMode === 'true';
};

// Goal Services
export const goalServices = {
  async getAll() {
    try {
      if (await isDemo()) {
        return DEMO_DATA.goals;
      }
      const response = await api.get('/goals');
      return response.data;
    } catch (error) {
      console.error('Error fetching goals:', error);
      return DEMO_DATA.goals;
    }
  },

  async create(goalData: Partial<Goal>) {
    const { data, error } = await supabase
      .from('goals')
      .insert([goalData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(goalId: string, updates: Partial<Goal>) {
    const { data, error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', goalId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(goalId: string) {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId);

    if (error) throw error;
  },

  async updateMilestone(goalId: string, milestoneIndex: number, completed: boolean) {
    const { data: goal, error: getError } = await supabase
      .from('goals')
      .select('milestones')
      .eq('id', goalId)
      .single();

    if (getError) throw getError;

    const milestones = [...goal.milestones];
    milestones[milestoneIndex].completed = completed;

    const { data, error: updateError } = await supabase
      .from('goals')
      .update({ milestones })
      .eq('id', goalId)
      .select()
      .single();

    if (updateError) throw updateError;
    return data;
  },

  async getStats() {
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting stats:', error);
      return null;
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

  async getRecent(limit = 7) {
    try {
      if (await isDemo()) {
        return DEMO_DATA.recentCheckins;
      }
      const response = await api.get(`/checkins?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching checkins:', error);
      return DEMO_DATA.recentCheckins;
    }
  },

  async create(checkinData: any) {
    try {
      if (OFFLINE_MODE) {
        console.log('📱 Creating check-in in offline mode');
        return DEMO_DATA.recentCheckins[0];
      }

      const response = await api.post('/checkins', checkinData);
      return response.data;
    } catch (error) {
      console.log('📱 Error creating check-in, using demo data');
      return DEMO_DATA.recentCheckins[0];
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
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('timestamp', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  },

  async sendMessage(message: string) {
    try {
      // First, save the user's message
      const { data: userMessage, error: userMessageError } = await supabase
        .from('messages')
        .insert([{
          content: message,
          sender: 'user',
          type: 'text',
          timestamp: new Date().toISOString(),
        }])
        .select()
        .single();

      if (userMessageError) throw userMessageError;

      // Then get AI response
      const response = await api.post('/chat', { message });
      const aiResponse = response.data.message;

      // Save AI response
      const { data: aiMessage, error: aiMessageError } = await supabase
        .from('messages')
        .insert([{
          content: aiResponse,
          sender: 'coach',
          type: 'text',
          timestamp: new Date().toISOString(),
        }])
        .select()
        .single();

      if (aiMessageError) throw aiMessageError;

      return aiResponse;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },
};

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
  async get() {
    try {
      if (await isDemo()) {
        return DEMO_DATA.userStats;
      }
      const response = await api.get('/user/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return DEMO_DATA.userStats;
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
    userStatsServices.get()
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
    const currentStats = await userStatsServices.get();
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