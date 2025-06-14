import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nsgqhhbqpyvonirlfluv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zZ3FoaGJxcHl2b25pcmxmbHV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NTY1NTgsImV4cCI6MjA2NTMzMjU1OH0.twGF9Y6clrRtJg_4S1OWHA1vhhYpKzn3ZpFJPGJbmEo'

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
}

export interface Message {
  id: string
  content: string
  sender: string
  type: string
  timestamp?: string
  user_id?: string
} 