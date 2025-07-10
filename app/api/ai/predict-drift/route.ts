import { NextRequest, NextResponse } from 'next/server';
import { aiClient } from '@/lib/ai-client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const daysAhead = parseInt(searchParams.get('daysAhead') || '7');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const prediction = await aiClient.predictDrift(userId, daysAhead);
    
    return NextResponse.json(prediction);
  } catch (error) {
    console.error('Error predicting drift:', error);
    return NextResponse.json({ error: 'Failed to predict drift' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, daysAhead = 7 } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const prediction = await aiClient.predictDrift(userId, daysAhead);
    
    return NextResponse.json(prediction);
  } catch (error) {
    console.error('Error predicting drift:', error);
    return NextResponse.json({ error: 'Failed to predict drift' }, { status: 500 });
  }
} 