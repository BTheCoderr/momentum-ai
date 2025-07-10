import { NextRequest, NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'demo-user';
    
    // Fetch real chat history from database
    const { data: chatHistory, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Error fetching chat history:', error);
      return NextResponse.json(
        { error: 'Failed to fetch chat history' },
        { status: 500 }
      );
    }

    // Transform to match expected format
    const formattedHistory = (chatHistory || []).map(msg => ({
      id: msg.id,
      role: msg.is_ai ? 'assistant' : 'user',
      content: msg.message,
      timestamp: new Date(msg.timestamp),
      userId: msg.user_id
    }));

    return NextResponse.json(formattedHistory);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    );
  }
} 