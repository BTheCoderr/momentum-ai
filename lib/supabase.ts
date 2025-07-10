import { createClient } from '@supabase/supabase-js'

// Get configuration from environment variables for web
const getSupabaseConfig = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nsgqhhbqpyvonirlfluv.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zZ3FoaGJxcHl2b25pcmxmbHV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NTY1NTgsImV4cCI6MjA2NTMzMjU1OH0.twGF9Y6clrRtJg_4S1OWHA1vhhYpKzn3ZpFJPGJbmEo';
  
  return { supabaseUrl, supabaseKey };
};

const { supabaseUrl, supabaseKey } = getSupabaseConfig();

console.log('🔧 Supabase Config:', { 
  url: supabaseUrl?.substring(0, 30) + '...', 
  keyFound: !!supabaseKey 
});

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
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
  type?: 'text' | 'insight' | 'reflection';
} 