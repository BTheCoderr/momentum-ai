import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    console.log('📋 Fetching check-ins...');
    
    // For now, return mock check-ins data
    // In the future, this could be connected to Supabase
    const mockCheckIns = [
      {
        id: 'checkin-1',
        date: new Date().toISOString(),
        goalId: 'goal-1',
        completedHabits: ['habit-1', 'habit-2'],
        mood: 8,
        notes: 'Great progress today!',
        motivationLevel: 9,
        goal: {
          id: 'goal-1',
          title: 'Daily Fitness'
        }
      },
      {
        id: 'checkin-2',
        date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        goalId: 'goal-1',
        completedHabits: ['habit-1'],
        mood: 7,
        notes: 'Decent day, could be better',
        motivationLevel: 7,
        goal: {
          id: 'goal-1',
          title: 'Daily Fitness'
        }
      }
    ];

    console.log(`✅ Returning ${mockCheckIns.length} check-ins`);
    return NextResponse.json(mockCheckIns);
  } catch (error) {
    console.error('❌ Error fetching check-ins:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📋 Creating new check-in...');
    
    const body = await request.json();
    const { goalId, completedHabits, mood, notes, motivationLevel } = body;

    // Create mock check-in response
    const checkIn = {
      id: `checkin-${Date.now()}`,
      date: new Date().toISOString(),
      goalId,
      completedHabits: completedHabits || [],
      mood,
      notes,
      motivationLevel,
      userId: 'default-user'
    };

    // Mock updated goal response
    const updatedGoal = {
      id: goalId,
      currentStreak: Math.floor(Math.random() * 10) + 1,
      bestStreak: Math.floor(Math.random() * 20) + 5,
      completionRate: Math.floor(Math.random() * 100),
      progress: Math.min(100, Math.floor(Math.random() * 100))
    };

    console.log('✅ Check-in created successfully');
    return NextResponse.json({ checkIn, updatedGoal }, { status: 201 });
  } catch (error) {
    console.error('❌ Error creating check-in:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 