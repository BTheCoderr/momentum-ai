import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase, Message } from '@/lib/supabase';

// Development mode - bypass auth for testing
const isDevelopment = process.env.NODE_ENV === 'development'

// In-memory storage for development messages
let developmentMessages: any[] = [
  {
    id: '1',
    content: 'Welcome to Momentum AI! I\'m here to help you stay accountable to your goals. How are you feeling about your progress today?',
    type: 'greeting',
    sender: 'ai',
    timestamp: new Date('2024-01-01T10:00:00Z').toISOString(),
  },
  {
    id: '2',
    content: 'I\'m excited to get started! I have goals I want to work on.',
    type: 'response',
    sender: 'user',
    timestamp: new Date('2024-01-01T10:01:00Z').toISOString(),
  },
  {
    id: '3',
    content: 'That\'s fantastic! I can see you\'re working on some ambitious goals. What\'s been your biggest challenge so far?',
    type: 'insight',
    sender: 'ai',
    timestamp: new Date('2024-01-01T10:01:30Z').toISOString(),
  },
]

export async function GET() {
  try {
    console.log('💬 Fetching messages from Supabase...')
    
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .order('timestamp', { ascending: true })

    if (error) {
      console.error('❌ Supabase error:', error)
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    console.log(`✅ Successfully fetched ${messages?.length || 0} messages from database`)
    return NextResponse.json(messages || [])
  } catch (error) {
    console.error('❌ Error fetching messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, sender, type = 'message' } = body
    
    console.log('💬 Saving message to database:', sender, content.substring(0, 50) + '...')
    
    const newMessage = {
      id: `msg-${Date.now()}`,
      content,
      sender,
      type,
      user_id: 'default-user'
    }

    const { data, error } = await supabase
      .from('messages')
      .insert(newMessage)
      .select()
      .single()

    if (error) {
      console.error('❌ Supabase insert error:', error)
      return NextResponse.json({ error: 'Failed to save message' }, { status: 500 })
    }

    console.log('✅ Message saved successfully to database!')
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('❌ Error saving message:', error)
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 })
  }
}

function generateContextualMockResponse(userMessage: string) {
  const message = userMessage.toLowerCase();
  
  // Contextual responses based on keywords
  if (message.includes('motivation') || message.includes('motivated')) {
    return {
      content: "I understand motivation can fluctuate! The key is building systems that work even when motivation is low. What's one small action you could take right now?",
      type: "insight"
    };
  }
  
  if (message.includes('stuck') || message.includes('struggling')) {
    return {
      content: "Feeling stuck is normal - it often means you're at the edge of growth! Let's break this down into smaller, manageable steps. What's the smallest next action?",
      type: "coaching"
    };
  }
  
  if (message.includes('progress') || message.includes('behind')) {
    return {
      content: "Progress isn't always linear. Even small steps count! What's one thing you accomplished recently that you can build on?",
      type: "encouragement"
    };
  }
  
  if (message.includes('habit') || message.includes('routine')) {
    return {
      content: "Habits are the compound interest of self-improvement! Start with just 2 minutes a day - consistency beats intensity every time.",
      type: "insight"
    };
  }
  
  if (message.includes('goal') || message.includes('achieve')) {
    return {
      content: "Great goals start with understanding your 'why'. What deeper reason drives this goal? That emotional connection will fuel your persistence.",
      type: "question"
    };
  }
  
  // Default responses for general messages
  const defaultResponses = [
    {
      content: "I'm here to help you stay accountable and motivated. What's the biggest challenge you're facing with your goals right now?",
      type: "question"
    },
    {
      content: "That's interesting! Tell me more about what's driving this goal - understanding your deeper motivation is key to lasting success.",
      type: "insight"
    },
    {
      content: "I can sense you're committed to growth. What would success look like for you in the next 30 days?",
      type: "coaching"
    }
  ];
  
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

 