import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // For now, return mock user profile data
    // In a real app, this would fetch from your database based on the authenticated user
    const userProfile = {
      name: "Chris",
      primaryGoal: "Going to the gym consistently",
      motivation: "My son",
      experience: "beginner",
      preferredTime: "morning",
      email: "chris@example.com",
      joinedDate: "2024-01-15",
      totalGoals: 5,
      completedGoals: 2,
      currentStreak: 7,
      longestStreak: 14
    };

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
} 