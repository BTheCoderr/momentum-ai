import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // In a real app, you'd get this from your database based on the authenticated user
    // For now, returning mock data that matches what the mobile app expects
    
    const userStats = {
      overallProgress: 85,
      activeGoals: 2,
      aiInterventions: 12,
      motivationScore: 94
    };

    return NextResponse.json(userStats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    );
  }
} 