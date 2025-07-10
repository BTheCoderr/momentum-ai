import { NextRequest, NextResponse } from 'next/server';
import { aiClient } from '@/lib/ai-client';

export async function POST(request: NextRequest) {
  try {
    const behavior = await request.json();

    // Validate required fields
    if (!behavior.user_id || !behavior.action_type) {
      return NextResponse.json({ 
        error: 'user_id and action_type are required' 
      }, { status: 400 });
    }

    // Add timestamp if not provided
    if (!behavior.timestamp) {
      behavior.timestamp = new Date().toISOString();
    }

    const result = await aiClient.trackBehavior(behavior);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error tracking behavior:', error);
    return NextResponse.json({ error: 'Failed to track behavior' }, { status: 500 });
  }
} 