import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default-user';

    // Get user's goals for pattern analysis
    const { data: goals, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) {
      console.error('Error fetching goals from Supabase:', error);
    }

    // Analyze patterns from the data
    const patterns = analyzeUserPatterns(goals || []);

    return NextResponse.json(patterns);
  } catch (error) {
    console.error('Error fetching user patterns:', error);
    
    // Return mock patterns for development
    return NextResponse.json({
      behaviorTrends: {
        checkInFrequency: 'stable',
        bestPerformanceTime: 'Tuesday mornings',
        worstPerformanceTime: 'Friday evenings',
        weeklyPattern: [85, 90, 95, 80, 60, 70, 88],
        monthlyTrend: 'up'
      },
      emotionalPatterns: {
        motivationTriggers: ['Progress visualization', 'Peer encouragement', 'Small wins'],
        demotivationTriggers: ['Perfectionism', 'Comparison to others', 'Overwhelming goals'],
        emotionalCycles: {
          high: ['Monday motivation', 'Post-workout endorphins', 'Achievement celebrations'],
          low: ['Sunday scaries', 'Mid-week slumps', 'Setback recovery']
        },
        stressIndicators: ['Skipped check-ins', 'Negative self-talk', 'Goal avoidance']
      },
      goalPatterns: {
        successFactors: ['Clear milestones', 'Daily habits', 'Accountability partners'],
        failurePatterns: ['Vague objectives', 'All-or-nothing thinking', 'Isolation'],
        optimalGoalTypes: ['Health & fitness', 'Skill development', 'Creative projects'],
        riskFactors: ['Overcommitment', 'External pressure', 'Perfectionism']
      },
      interventionHistory: {
        successfulInterventions: ['Gentle reminders', 'Progress celebrations', 'Habit stacking'],
        ignoredInterventions: ['Harsh accountability', 'Generic advice', 'Overwhelming suggestions'],
        preferredInterventionTypes: ['Encouraging', 'Specific', 'Timely']
      }
    });
  }
}

function analyzeUserPatterns(goals: any[]) {
  // Basic pattern analysis based on goals data
  const totalGoals = goals.length;
  const activeGoals = goals.filter(g => g.status === 'active').length;
  const completedGoals = goals.filter(g => g.status === 'completed').length;
  
  // Calculate completion rate
  const completionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;
  
  // Analyze goal creation patterns
  const recentGoals = goals.filter(g => {
    const createdAt = new Date(g.created_at);
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return createdAt > oneWeekAgo;
  });

  // Generate weekly pattern (mock data based on actual goals)
  const weeklyPattern = [
    Math.min(85 + (completionRate * 0.1), 100),
    Math.min(90 + (activeGoals * 2), 100),
    Math.min(95, 100),
    Math.min(80 + (recentGoals.length * 5), 100),
    Math.min(60 + (completionRate * 0.2), 100),
    Math.min(70 + (activeGoals * 3), 100),
    Math.min(88, 100)
  ].map(n => Math.round(n));

  // Determine best performance time based on patterns
  const bestDayIndex = weeklyPattern.indexOf(Math.max(...weeklyPattern));
  const worstDayIndex = weeklyPattern.indexOf(Math.min(...weeklyPattern));
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return {
    behaviorTrends: {
      checkInFrequency: recentGoals.length > 2 ? 'increasing' : recentGoals.length < 1 ? 'decreasing' : 'stable',
      bestPerformanceTime: `${dayNames[bestDayIndex]} mornings`,
      worstPerformanceTime: `${dayNames[worstDayIndex]} evenings`,
      weeklyPattern,
      monthlyTrend: completionRate > 70 ? 'up' : completionRate < 30 ? 'down' : 'stable'
    },
    emotionalPatterns: {
      motivationTriggers: ['Progress visualization', 'Peer encouragement', 'Small wins'],
      demotivationTriggers: ['Perfectionism', 'Comparison to others', 'Overwhelming goals'],
      emotionalCycles: {
        high: ['Monday motivation', 'Post-workout endorphins', 'Achievement celebrations'],
        low: ['Sunday scaries', 'Mid-week slumps', 'Setback recovery']
      },
      stressIndicators: ['Skipped check-ins', 'Negative self-talk', 'Goal avoidance']
    },
    goalPatterns: {
      successFactors: completedGoals > 0 ? ['Clear milestones', 'Daily habits', 'Accountability'] : ['Need more data'],
      failurePatterns: totalGoals > completedGoals ? ['Vague objectives', 'All-or-nothing thinking'] : ['Need more data'],
      optimalGoalTypes: ['Health & fitness', 'Skill development', 'Creative projects'],
      riskFactors: activeGoals > 3 ? ['Overcommitment', 'External pressure'] : ['Perfectionism']
    },
    interventionHistory: {
      successfulInterventions: ['Gentle reminders', 'Progress celebrations', 'Habit stacking'],
      ignoredInterventions: ['Harsh accountability', 'Generic advice', 'Overwhelming suggestions'],
      preferredInterventionTypes: ['Encouraging', 'Specific', 'Timely']
    }
  };
} 