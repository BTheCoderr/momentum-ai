import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Daily Check-In System - captures comprehensive user state
export async function POST(request: NextRequest) {
  try {
    const { 
      userId = 'demo-user', 
      mood, 
      energy, 
      stress, 
      goalProgress = [], 
      wins = [], 
      challenges = [],
      priorities = [],
      reflection = ''
    } = await request.json();

    console.log('📝 Processing daily check-in for:', userId);

    // Calculate overall wellness score
    const wellnessScore = calculateWellnessScore(mood, energy, stress);
    
    // Store check-in data
    const checkInData = {
      user_id: userId,
      mood_score: mood,
      energy_level: energy,
      stress_level: stress,
      wellness_score: wellnessScore,
      wins: JSON.stringify(wins),
      challenges: JSON.stringify(challenges),
      priorities: JSON.stringify(priorities),
      reflection_text: reflection,
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0] // YYYY-MM-DD
    };

    // Store in user_events table
    await supabase.from('user_events').insert({
      user_id: userId,
      event_type: 'daily_checkin',
      event_data: checkInData,
      timestamp: new Date().toISOString()
    });

    // Update goal progress if provided
    if (goalProgress.length > 0) {
      for (const progress of goalProgress) {
        await supabase.from('goals')
          .update({ 
            progress: progress.progress,
            updated_at: new Date().toISOString()
          })
          .eq('id', progress.goalId)
          .eq('user_id', userId);
      }
    }

    // Generate personalized insights based on check-in
    const insights = await generateCheckInInsights(userId, checkInData);
    
    // Store insights
    if (insights) {
      await supabase.from('insights').insert({
        user_id: userId,
        insight_text: insights.text,
        insight_type: 'daily_checkin',
        confidence_score: insights.confidence,
        created_at: new Date().toISOString()
      });
    }

    // Update streaks
    await updateUserStreaks(userId);

    return NextResponse.json({
      success: true,
      wellnessScore,
      insights: insights?.text,
      message: generateCheckInResponse(wellnessScore, wins.length, challenges.length)
    });

  } catch (error) {
    console.error('❌ Check-in Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process check-in',
      message: "Thanks for checking in! I'm having a small technical hiccup, but your commitment to growth is what matters most."
    });
  }
}

// GET endpoint for check-in history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'demo-user';
    const days = parseInt(searchParams.get('days') || '7');

    const { data: checkIns } = await supabase
      .from('user_events')
      .select('*')
      .eq('user_id', userId)
      .eq('event_type', 'daily_checkin')
      .order('timestamp', { ascending: false })
      .limit(days);

    return NextResponse.json({
      success: true,
      checkIns: checkIns || []
    });

  } catch (error) {
    console.error('❌ Check-in History Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch check-in history'
    });
  }
}

// Calculate wellness score from mood, energy, stress
function calculateWellnessScore(mood: number, energy: number, stress: number): number {
  // Mood and energy are positive (1-5), stress is negative (1-5, where 5 is most stressed)
  const normalizedStress = 6 - stress; // Flip stress so higher is better
  const rawScore = (mood + energy + normalizedStress) / 3;
  return Math.round(rawScore * 20); // Convert to 0-100 scale
}

// Generate personalized insights based on check-in data
async function generateCheckInInsights(userId: string, checkInData: any) {
  try {
    // Get recent check-ins for pattern analysis
    const { data: recentCheckIns } = await supabase
      .from('user_events')
      .select('*')
      .eq('user_id', userId)
      .eq('event_type', 'daily_checkin')
      .order('timestamp', { ascending: false })
      .limit(7);

    if (!recentCheckIns || recentCheckIns.length === 0) {
      return {
        text: "Great job on your first check-in! I'm starting to learn your patterns. Keep this up and I'll be able to give you more personalized insights.",
        confidence: 0.7
      };
    }

    // Analyze patterns
    const patterns = analyzeCheckInPatterns(recentCheckIns, checkInData);
    
    return {
      text: generateInsightFromPatterns(patterns),
      confidence: 0.85
    };

  } catch (error) {
    console.error('Error generating insights:', error);
    return null;
  }
}

// Analyze patterns in check-in data
function analyzeCheckInPatterns(recentCheckIns: any[], currentCheckIn: any) {
  const scores = recentCheckIns.map(ci => ci.event_data.wellness_score);
  const currentScore = currentCheckIn.wellness_score;
  
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  const isImproving = currentScore > avgScore;
  const isConsistent = Math.abs(currentScore - avgScore) < 10;
  
  const energyTrend = analyzeMetricTrend(recentCheckIns, 'energy_level');
  const moodTrend = analyzeMetricTrend(recentCheckIns, 'mood_score');
  const stressTrend = analyzeMetricTrend(recentCheckIns, 'stress_level');

  return {
    wellnessImproving: isImproving,
    wellnessConsistent: isConsistent,
    energyTrend,
    moodTrend,
    stressTrend,
    currentScore,
    avgScore: Math.round(avgScore)
  };
}

// Analyze trend for a specific metric
function analyzeMetricTrend(checkIns: any[], metric: string) {
  if (checkIns.length < 3) return 'stable';
  
  const values = checkIns.slice(0, 3).map(ci => ci.event_data[metric]);
  const recent = values[0];
  const older = values[2];
  
  if (recent > older + 0.5) return 'improving';
  if (recent < older - 0.5) return 'declining';
  return 'stable';
}

// Generate insight text from patterns
function generateInsightFromPatterns(patterns: any): string {
  const insights = [];

  if (patterns.wellnessImproving) {
    insights.push("You're on an upward trajectory! Your overall wellness has improved compared to recent days.");
  }

  if (patterns.energyTrend === 'improving') {
    insights.push("Your energy levels are climbing - whatever you're doing is working!");
  } else if (patterns.energyTrend === 'declining') {
    insights.push("I notice your energy dipping. Consider what might be draining you lately.");
  }

  if (patterns.moodTrend === 'improving') {
    insights.push("Your mood is brightening - that's beautiful to see.");
  }

  if (patterns.stressTrend === 'declining') {
    insights.push("Your stress levels are rising. Let's think about what support you might need.");
  }

  if (patterns.wellnessConsistent && patterns.currentScore >= 70) {
    insights.push("You're maintaining a strong baseline - that consistency is your superpower.");
  }

  if (insights.length === 0) {
    return "Every day you check in, you're building self-awareness. That's the foundation of all growth.";
  }

  return insights.join(' ');
}

// Generate encouraging response based on check-in
function generateCheckInResponse(wellnessScore: number, winsCount: number, challengesCount: number): string {
  if (wellnessScore >= 80) {
    return `You're crushing it today! ${winsCount > 0 ? 'Those wins you shared show your momentum.' : ''} Keep this energy flowing.`;
  } else if (wellnessScore >= 60) {
    return `Solid day overall. ${challengesCount > 0 ? "I see you're navigating some challenges - that takes strength." : ''} You're building resilience.`;
  } else {
    return `Thank you for being honest about how you're feeling. ${challengesCount > 0 ? 'Tough days teach us things good days never could.' : ''} Tomorrow is a fresh start.`;
  }
}

// Update user streaks based on check-in
async function updateUserStreaks(userId: string) {
  try {
    // Check if user checked in yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const { data: yesterdayCheckIn } = await supabase
      .from('user_events')
      .select('*')
      .eq('user_id', userId)
      .eq('event_type', 'daily_checkin')
      .gte('timestamp', yesterdayStr)
      .lt('timestamp', new Date().toISOString().split('T')[0]);

    // Get or create streak record
    const { data: existingStreak } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .eq('streak_type', 'daily_checkin')
      .single();

    if (existingStreak) {
      // Update existing streak
      const newStreak = yesterdayCheckIn && yesterdayCheckIn.length > 0 
        ? existingStreak.current_streak + 1 
        : 1; // Reset if missed yesterday

      await supabase
        .from('streaks')
        .update({
          current_streak: newStreak,
          longest_streak: Math.max(newStreak, existingStreak.longest_streak),
          last_activity_date: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        })
        .eq('id', existingStreak.id);
    } else {
      // Create new streak
      await supabase.from('streaks').insert({
        user_id: userId,
        current_streak: 1,
        longest_streak: 1,
        last_activity_date: new Date().toISOString().split('T')[0],
        streak_type: 'daily_checkin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Error updating streaks:', error);
  }
} 