import { createClient } from '@supabase/supabase-js'

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Goal interface
export interface Goal {
  id: string
  title: string
  description?: string
  progress: number
  created_at: string
  updated_at: string
  user_id: string
  target_date?: string
  category?: string
  priority?: 'low' | 'medium' | 'high'
  status: 'active' | 'completed' | 'paused'
}

// User interface
export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

// Habit interface
export interface Habit {
  id: string
  goal_id: string
  title: string
  description?: string
  frequency: 'daily' | 'weekly' | 'monthly'
  completed_at?: string
  created_at: string
  user_id: string
}

// Achievement interface
export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked_at?: string
  progress: number
  target: number
  user_id: string
}

// API helpers
export const goalService = {
  async getAll(): Promise<Goal[]> {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async create(goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>): Promise<Goal> {
    const { data, error } = await supabase
      .from('goals')
      .insert(goal)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Goal>): Promise<Goal> {
    const { data, error } = await supabase
      .from('goals')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

export const habitService = {
  async getByGoalId(goalId: string): Promise<Habit[]> {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('goal_id', goalId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async markComplete(id: string): Promise<Habit> {
    const { data, error } = await supabase
      .from('habits')
      .update({ completed_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

export const achievementService = {
  async getAll(): Promise<Achievement[]> {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('unlocked_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }
} 