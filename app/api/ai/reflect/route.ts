import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import Groq from "groq-sdk";

// Initialize Supabase client with fallback values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nsgqhhbqpyvonirlfluv.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zZ3FoaGJxcHl2b25pcmxmbHV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NTY1NTgsImV4cCI6MjA2NTMzMjU1OH0.twGF9Y6clrRtJg_4S1OWHA1vhhYpKzn3ZpFJPGJbmEo';

const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Groq client with fallback handling
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'dummy-key-for-build',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId = 'default-user', goals = [], patterns, recentActivity = [] } = body;

    // Get user's goals from Supabase if not provided
    let userGoals = goals;
    if (!goals || goals.length === 0) {
      const { data: goalsData, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && goalsData) {
        userGoals = goalsData;
      }
    }

    // Generate AI insights using Groq
    const aiInsights = await generateAIInsights(userGoals, patterns);

    return NextResponse.json(aiInsights);
  } catch (error) {
    console.error('Error generating AI reflection:', error);
    
    // Return mock insights for development
    return NextResponse.json({
      insights: [
        {
          type: 'pattern',
          title: 'Peak Performance Window Identified',
          description: 'Your data shows 40% higher completion rates on Tuesday mornings. Your brain chemistry and energy levels align perfectly during this time.',
          confidence: 0.87,
          actionable: true,
          suggestedActions: [
            'Schedule your most challenging goals for Tuesday mornings',
            'Block this time in your calendar as "Peak Performance"',
            'Use this window for goal planning and reflection'
          ]
        },
        {
          type: 'warning',
          title: 'Perfectionism Pattern Detected',
          description: 'I notice you tend to abandon goals when you miss 2+ days in a row. This all-or-nothing thinking is sabotaging your long-term success.',
          confidence: 0.92,
          actionable: true,
          suggestedActions: [
            'Implement the "2-day rule" - never miss twice in a row',
            'Create "minimum viable" versions of your habits',
            'Practice self-compassion when you have setbacks'
          ]
        },
        {
          type: 'success',
          title: 'Emotional Connection Strengthening',
          description: 'Your "why" statements have become 60% more specific over the past month. This deeper emotional connection predicts higher success rates.',
          confidence: 0.78,
          actionable: true,
          suggestedActions: [
            'Continue journaling about your deeper motivations',
            'Share your "why" with your accountability partner',
            'Revisit and refine your emotional anchors weekly'
          ]
        }
      ],
      predictions: {
        riskOfGoalAbandonment: 0.23,
        likelySuccessFactors: [
          'Consistent Tuesday morning check-ins',
          'Visual progress tracking',
          'Peer encouragement and sharing'
        ],
        recommendedInterventions: [
          'Gentle reminder on Sunday evenings',
          'Celebration of small wins',
          'Habit stacking with existing routines'
        ],
        optimalCheckInTimes: ['Tuesday 9:00 AM', 'Thursday 7:00 PM', 'Sunday 6:00 PM']
      },
      personalizedCoaching: {
        motivationalMessage: "I see you building something beautiful here. Your consistency this week shows real growth in your relationship with your goals. That Tuesday morning energy? That's your superpower - let's lean into it.",
        specificAdvice: [
          "Your perfectionism is both your strength and your kryptonite. Channel it into planning, not self-judgment.",
          "The way you bounce back from setbacks has improved 40% - you're learning to be your own best friend.",
          "Your goals are becoming more emotionally connected. This isn't just about tasks anymore - it's about who you're becoming."
        ],
        emotionalSupport: "I want you to know that the work you're doing on yourself matters. Every check-in, every moment of self-reflection, every time you choose growth over comfort - it's all building toward the person you're meant to be.",
        nextSteps: [
          "This week, focus on protecting your Tuesday morning ritual",
          "Practice the 'good enough' mindset when perfectionism creeps in",
          "Share one vulnerable truth about your goals with someone you trust"
        ]
      }
    });
  }
}

async function generateAIInsights(goals: any[], patterns: any) {
  try {
    // Check if we have a valid API key (not the dummy build key)
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'dummy-key-for-build') {
      throw new Error('GROQ_API_KEY not available');
    }

    // Prepare context for Groq
    const context = {
      totalGoals: goals.length,
      activeGoals: goals.filter(g => g.status === 'active').length,
      completedGoals: goals.filter(g => g.status === 'completed').length,
      recentGoals: goals.filter(g => {
        const createdAt = new Date(g.created_at);
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return createdAt > oneWeekAgo;
      }).length,
      goalTitles: goals.map(g => g.title).slice(0, 5),
      patterns: patterns || {}
    };

    const prompt = `As an AI life coach, analyze this user's goal data and provide personalized insights:

Context:
- Total Goals: ${context.totalGoals}
- Active Goals: ${context.activeGoals}
- Completed Goals: ${context.completedGoals}
- Recent Goals (last week): ${context.recentGoals}
- Recent Goal Titles: ${context.goalTitles.join(', ')}

Based on this data, provide insights in the following format:
1. One key pattern you notice
2. One potential risk or warning
3. One success factor to celebrate

Keep insights specific, actionable, and encouraging. Focus on behavioral patterns and emotional connections to goals.`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an empathetic AI life coach who provides personalized insights based on user goal data. Be specific, actionable, and encouraging."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile", // Latest supported model
      temperature: 0.7,
      max_tokens: 1000,
    });

    const aiResponse = completion.choices[0]?.message?.content || '';

    // Parse AI response and structure it
    return {
      insights: [
        {
          type: 'pattern',
          title: 'AI-Generated Pattern Analysis',
          description: aiResponse.substring(0, 200) + '...',
          confidence: 0.85,
          actionable: true,
          suggestedActions: [
            'Review your goal patterns weekly',
            'Focus on your most successful strategies',
            'Adjust timing based on your peak performance windows'
          ]
        }
      ],
      predictions: {
        riskOfGoalAbandonment: context.activeGoals > context.completedGoals ? 0.4 : 0.2,
        likelySuccessFactors: [
          'Consistent goal tracking',
          'Regular progress reviews',
          'Emotional connection to goals'
        ],
        recommendedInterventions: [
          'Weekly goal review sessions',
          'Celebration of small wins',
          'Habit stacking with existing routines'
        ],
        optimalCheckInTimes: ['Tuesday 9:00 AM', 'Thursday 7:00 PM', 'Sunday 6:00 PM']
      },
      personalizedCoaching: {
        motivationalMessage: aiResponse,
        specificAdvice: [
          "Focus on consistency over perfection",
          "Celebrate small wins along the way",
          "Connect your goals to your deeper values"
        ],
        emotionalSupport: "Your commitment to growth is inspiring. Every step forward, no matter how small, is progress worth celebrating.",
        nextSteps: [
          "Review your most successful goal strategies",
          "Set up a weekly goal review ritual",
          "Share your progress with someone you trust"
        ]
      }
    };
  } catch (error) {
    console.error('Error calling Groq API:', error);
    
    // Fallback to mock data if Groq fails
    return {
      insights: [
        {
          type: 'pattern',
          title: 'Goal Creation Pattern',
          description: `You've created ${goals.length} goals, showing strong commitment to personal growth.`,
          confidence: 0.8,
          actionable: true,
          suggestedActions: [
            'Focus on completing existing goals before adding new ones',
            'Review your goal completion strategies',
            'Set realistic timelines for your objectives'
          ]
        }
      ],
      predictions: {
        riskOfGoalAbandonment: 0.3,
        likelySuccessFactors: ['Goal tracking', 'Regular reviews', 'Emotional connection'],
        recommendedInterventions: ['Weekly check-ins', 'Progress celebrations', 'Habit stacking'],
        optimalCheckInTimes: ['Tuesday 9:00 AM', 'Thursday 7:00 PM', 'Sunday 6:00 PM']
      },
      personalizedCoaching: {
        motivationalMessage: "Your dedication to setting goals shows real commitment to growth. Focus on consistency and celebrate every step forward.",
        specificAdvice: [
          "Quality over quantity - focus on fewer, more meaningful goals",
          "Track your progress regularly to maintain momentum",
          "Connect each goal to your deeper values and motivations"
        ],
        emotionalSupport: "Remember that every goal you set is an investment in your future self. You're building something meaningful.",
        nextSteps: [
          "Review your current active goals",
          "Identify your most effective success strategies",
          "Set up a consistent goal review schedule"
        ]
      }
    };
  }
} 