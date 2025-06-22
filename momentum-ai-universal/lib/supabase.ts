import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database types
export interface Goal {
  id: string
  title: string
  description?: string
  emotional_context?: string
  progress: number
  status: string
  deadline?: string
  created_at?: string
  updated_at?: string
  user_id?: string
  category?: string
  target?: number
}

export interface Message {
  id: string
  content: string
  sender: string
  type: string
  timestamp?: string
  user_id?: string
} 