import axios from 'axios';
import { supabase } from './supabase';
import { getApiUrl } from './config';
import NetInfo from '@react-native-community/netinfo';
import universalStorage from './storage';
import { AuthenticationError } from './errors';

// Custom error classes for better error handling
export class NetworkError extends Error {
  constructor(message = 'Network connection unavailable') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class APIError extends Error {
  constructor(message = 'API request failed', public statusCode?: number) {
    super(message);
    this.name = 'APIError';
  }
}

export class OfflineError extends Error {
  constructor(message = 'Operation not available offline') {
    super(message);
    this.name = 'OfflineError';
  }
}

// Re-export AuthenticationError for convenience
export { AuthenticationError };

const API_URL = getApiUrl();

// Configure axios with better timeout and retry logic
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Centralized error handler
export const handleError = async (error: any) => {
  // Check if it's a network error
  const networkState = await NetInfo.fetch();
  if (!networkState.isConnected) {
    throw new NetworkError();
  }

  // Handle authentication errors
  if (error?.response?.status === 401) {
    throw new AuthenticationError('Authentication failed');
  }

  // Handle API errors
  if (error?.response?.status) {
    throw new APIError(error.message, error.response.status);
  }

  // Handle offline errors
  if (error.message?.includes('offline')) {
    throw new OfflineError();
  }

  // Log error for debugging
  console.error('Unhandled error:', {
    name: error.name,
    message: error.message,
    stack: error.stack,
  });

  throw error;
};

// Add response interceptor for better error handling and offline support
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config } = error;
    
    try {
      // Check network connectivity
      const networkState = await NetInfo.fetch();
      if (!networkState.isConnected) {
        console.log('📱 No network connection');
        const offlineData = await universalStorage.getItem(`offline_${config.url}`);
        if (offlineData) {
          return { data: JSON.parse(offlineData) };
        }
        throw new NetworkError();
      }

      await handleError(error);
    } catch (handledError) {
      throw handledError;
    }
  }
);

export { api };

// Goal Services
export const goalServices = {
  async getAll() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching goals:', error);
      return [];
    }
  }
};

// Chat Services
export const chatServices = {
  async getHistory() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching chat history:', error);
      return [];
    }
  },

  async sendMessage(message: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // First, save the user's message
      const { data: userMessage, error: userMessageError } = await supabase
        .from('messages')
        .insert([{
          content: message,
          sender: 'user',
          type: 'text',
          user_id: user.id,
          timestamp: new Date().toISOString(),
        }])
        .select()
        .single();

      if (userMessageError) throw userMessageError;

      // Then get AI response
      const response = await api.post('/chat', { message, userId: user.id });
      const aiResponse = response.data.message;

      // Save AI response
      const { data: aiMessage, error: aiMessageError } = await supabase
        .from('messages')
        .insert([{
          content: aiResponse,
          sender: 'coach',
          type: 'text',
          user_id: user.id,
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

// Message Services (for AI Coach)
export const messageServices = {
  async getAll() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', user.id)
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // First, save the user's message
      const { data: userMessage, error: userMessageError } = await supabase
        .from('messages')
        .insert([{
          content: message,
          sender: 'user',
          user_id: user.id,
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (userMessageError) throw userMessageError;

      // For now, return a simple AI response
      // In a real app, you'd call your AI service here
      const aiResponse = `I hear you saying: "${message}". That's interesting! How does that make you feel?`;

      // Save AI response
      const { data: aiMessage, error: aiMessageError } = await supabase
        .from('messages')
        .insert([{
          content: aiResponse,
          sender: 'coach',
          user_id: user.id,
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (aiMessageError) throw aiMessageError;

      return aiMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
};

// User Stats Services
export const userStatsServices = {
  async get() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      return data || {
        current_streak: 0,
        best_streak: 0,
        total_checkins: 0,
        total_goals: 0,
        completed_goals: 0,
        totalXP: 0,
        level: 1,
        motivationScore: 70
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  },

  async update(userId?: string) {
    try {
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No authenticated user');
        userId = user.id;
      }

      const response = await api.post('/user/stats', {
        userId,
        timestamp: new Date().toISOString()
      });

      return response.data;
    } catch (error) {
      console.error('Error updating user stats:', error);
      throw error;
    }
  }
};

// AI Services
export const aiServices = {
  async getInsights(userId?: string) {
    try {
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No authenticated user');
        userId = user.id;
      }
      
      // Use our Claude-powered insights
      const { generateInsights } = await import('./ai-insights');
      const insights = await generateInsights(userId);
      
      // Convert to expected format
      return insights.map((insight, index) => ({
        id: `insight-${index}`,
        type: 'pattern' as const,
        title: `Insight ${index + 1}`,
        content: insight,
        emoji: '💡',
        category: 'Analytics',
        createdAt: new Date()
      }));
    } catch (error) {
      console.error('Error getting AI insights:', error);
      return [];
    }
  }
};

// Type definitions
export interface Insight {
  id: string;
  type: 'pattern' | 'encouragement' | 'suggestion' | 'reflection';
  title: string;
  content: string;
  emoji?: string;
  category?: string;
  createdAt?: Date;
}

// Checkin Services
export const checkinServices = {
  async getAll(userId?: string) {
    try {
      if (!userId) {
        return [];
      }

      const { data, error } = await supabase
        .from('checkins')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching checkins:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAll:', error);
      return [];
    }
  },

  async getRecent(limit = 30) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return [];
      }

      const { data, error } = await supabase
        .from('checkins')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching recent checkins:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getRecent:', error);
      return [];
    }
  },

  async create(userId: string, checkinData: any) {
    try {
      if (!userId) {
        return null;
      }

      // Format the data properly
      const formattedData = {
        user_id: userId,
        date: new Date(checkinData.date).toISOString().split('T')[0],
        mood: checkinData.mood,
        energy: checkinData.energy,
        stress: checkinData.stress,
        wins: checkinData.wins,
        challenges: checkinData.challenges || '',
        reflection: checkinData.reflection || '',
        priorities: checkinData.priorities
      };

      const { data, error } = await supabase
        .from('checkins')
        .insert([formattedData])
        .select()
        .single();

      if (error) {
        console.error('Error in create:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in create:', error);
      return null;
    }
  },

  async getLatest(userId: string) {
    try {
      if (!userId) {
        return null;
      }

      const { data, error } = await supabase
        .from('checkins')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching latest checkin:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getLatest:', error);
      return null;
    }
  },
};

// XP-related functions
export const getXPFromCheckIn = (currentStreak: number) => {
  const baseXP = 25;
  const streakBonus = Math.min(currentStreak * 5, 25); // Max 25 XP bonus for streaks
  return baseXP + streakBonus;
};

export const updateUserXP = async (userId: string, xpAmount: number, reason: string) => {
  try {
    const { data: currentStats } = await supabase
      .from('user_stats')
      .select('totalXP')
      .eq('user_id', userId)
      .single();

    const newTotalXP = (currentStats?.totalXP || 0) + xpAmount;
    const newLevel = Math.floor(newTotalXP / 100) + 1;
    const oldLevel = Math.floor((currentStats?.totalXP || 0) / 100) + 1;

    const { data, error } = await supabase
      .from('user_stats')
      .upsert({
        user_id: userId,
        totalXP: newTotalXP,
        level: newLevel
      })
      .select()
      .single();

    if (error) throw error;
    
    const leveledUp = newLevel > oldLevel;
    return { success: true, leveledUp, newLevel };
  } catch (error) {
    console.error('Error updating XP:', error);
    return { success: false, leveledUp: false, newLevel: 1 };
  }
};

// Coach Services
export const coachServices = {
  async getCoachPersonality() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('coach_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      return data || {
        name: 'Alex',
        personality: 'Empathetic AI coach focused on emotional support',
        style: 'supportive'
      };
    } catch (error) {
      console.error('Error getting coach personality:', error);
      return null;
    }
  }
};

// User Profile Services
export const userProfileServices = {
  async get() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      return data || {
        id: user.id,
        email: user.email,
        full_name: '',
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  async update(profileData: any) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
}; 