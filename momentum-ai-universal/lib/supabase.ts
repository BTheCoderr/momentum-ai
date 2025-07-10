import { createClient } from '@supabase/supabase-js'
import Constants from 'expo-constants'
import AsyncStorage from '@react-native-async-storage/async-storage'

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Please check your app.config.js')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// Helper function to get initialized client
export const getSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase client not initialized')
  }
  return supabase
}

// Initialize auth state
export const initializeAuth = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  } catch (error) {
    console.error('Error initializing auth:', error)
    return null
  }
}

// Database types
export interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  progress: number;
  target_date: string;
  milestones: Array<{
    title: string;
    completed: boolean;
  }>;
  priority: 'low' | 'medium' | 'high';
  reminder_frequency: 'daily' | 'weekly' | 'none';
  status: 'active' | 'completed';
  created_at: string;
  updated_at?: string;
  user_id?: string;
}

export interface Message {
  id: string
  content: string
  sender: string
  type: string
  timestamp?: string
  user_id?: string
} 