import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log('🔥 Fetching streak stats for user:', userId);

    // Get user streak stats using our database function
    const { data: streakData, error: streakError } = await supabase
      .rpc('get_user_streak_stats', { p_user_id: userId });

    if (streakError) {
      console.error('❌ Error fetching streak stats:', streakError);
      
      // Provide fallback streak data for demo purposes
      const fallbackStreaks = [
        {
          goal_id: '550e8400-e29b-41d4-a716-446655440001',
          goal_title: 'Daily Exercise',
          current_streak: 7,
          longest_streak: 12,
          last_activity_date: new Date().toISOString().split('T')[0],
          streak_type: 'daily',
          progress: 75
        },
        {
          goal_id: '550e8400-e29b-41d4-a716-446655440002',
          goal_title: 'Read More Books',
          current_streak: 5,
          longest_streak: 15,
          last_activity_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          streak_type: 'daily',
          progress: 80
        },
        {
          goal_id: '550e8400-e29b-41d4-a716-446655440003',
          goal_title: 'Meditation Practice',
          current_streak: 3,
          longest_streak: 8,
          last_activity_date: new Date().toISOString().split('T')[0],
          streak_type: 'daily',
          progress: 45
        }
      ];
      
      console.log('✅ Using fallback streak data for demo');
      return NextResponse.json({
        success: true,
        streaks: fallbackStreaks,
        demo: true,
        message: 'Using demo data - run database schema to enable real tracking'
      });
    }

    console.log('✅ Successfully fetched streak stats:', streakData);

    return NextResponse.json({
      success: true,
      streaks: streakData || []
    });

  } catch (error) {
    console.error('❌ Streak API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, streakType = 'daily_checkin' } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log('🔥 Updating streak for user:', userId, 'type:', streakType);

    // Update user streak using our database function
    const { data: streakResult, error: streakError } = await supabase
      .rpc('update_user_streak', { 
        p_user_id: userId, 
        p_streak_type: streakType 
      });

    if (streakError) {
      console.error('❌ Error updating streak:', streakError);
      return NextResponse.json({ error: 'Failed to update streak' }, { status: 500 });
    }

    console.log('✅ Successfully updated streak:', streakResult);

    return NextResponse.json({
      success: true,
      streak: streakResult
    });

  } catch (error) {
    console.error('❌ Streak update API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 