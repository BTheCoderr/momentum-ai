import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const goalId = searchParams.get('goalId');
    const limit = parseInt(searchParams.get('limit') || '30');

    const checkIns = await prisma.dailyCheckIn.findMany({
      where: {
        userId: user.id,
        ...(goalId && { goalId })
      },
      include: {
        goal: {
          select: {
            title: true,
            id: true
          }
        }
      },
      orderBy: { date: 'desc' },
      take: limit
    });

    return NextResponse.json(checkIns);
  } catch (error) {
    console.error('Error fetching check-ins:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { goalId, completedHabits, mood, notes, motivationLevel } = body;

    // Verify user owns the goal
    const goal = await prisma.goal.findFirst({
      where: {
        id: goalId,
        userId: user.id
      },
      include: {
        habits: true
      }
    });

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    // Create the check-in
    const checkIn = await prisma.dailyCheckIn.create({
      data: {
        userId: user.id,
        goalId,
        completedHabits: completedHabits || [],
        mood,
        notes,
        motivationLevel
      }
    });

    // Update goal progress and streaks
    const habitCompletionRate = completedHabits.length / goal.habits.length;
    const shouldIncreaseStreak = habitCompletionRate >= 0.6; // 60% completion threshold
    
    const updatedGoal = await prisma.goal.update({
      where: { id: goalId },
      data: {
        lastCheckIn: new Date(),
        currentStreak: shouldIncreaseStreak ? goal.currentStreak + 1 : 0,
        bestStreak: shouldIncreaseStreak && (goal.currentStreak + 1) > goal.bestStreak 
          ? goal.currentStreak + 1 
          : goal.bestStreak,
        completionRate: Math.round((goal.completionRate + habitCompletionRate * 100) / 2),
        progress: Math.min(100, goal.progress + (habitCompletionRate * 5)) // Increase progress by up to 5% per check-in
      }
    });

    // Update habit completion status
    await Promise.all(
      goal.habits.map(habit =>
        prisma.habit.update({
          where: { id: habit.id },
          data: { completed: completedHabits.includes(habit.id) }
        })
      )
    );

    return NextResponse.json({ checkIn, updatedGoal }, { status: 201 });
  } catch (error) {
    console.error('Error creating check-in:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 