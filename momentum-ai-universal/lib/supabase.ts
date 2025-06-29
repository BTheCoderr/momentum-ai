import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

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