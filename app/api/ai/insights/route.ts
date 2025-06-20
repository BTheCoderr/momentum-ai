import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nsgqhhbqpyvonirlfluv.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zZ3FoaGJxcHl2b25pcmxmbHV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NTY1NTgsImV4cCI6MjA2NTMzMjU1OH0.twGF9Y6clrRtJg_4S1OWHA1vhhYpKzn3ZpFJPGJbmEo'
);

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Enhanced AI coaching prompts for different insight types
const COACHING_PROMPTS = {
  pattern_recognition: `You are an expert behavioral coach analyzing user patterns. Based on the check-in data provided, identify ONE key behavioral pattern and provide a specific, actionable insight. Focus on timing, energy levels, mood patterns, or progress trends. Respond in 1-2 sentences with an emoji. Be encouraging and specific.`,
  
  energy_optimization: `You are an energy management coach. Analyze the user's energy levels and timing patterns from their check-ins. Provide ONE specific recommendation for optimizing their energy throughout the day. Include practical timing suggestions. Use 1-2 sentences with an emoji.`,
  
  mood_coaching: `You are a positive psychology coach. Look at the user's mood patterns and progress correlation. Provide ONE insight about what drives their positive moods or how to maintain emotional balance. Be supportive and actionable. 1-2 sentences with an emoji.`,
  
  productivity_boost: `You are a productivity expert. Analyze the user's progress patterns, challenges, and wins. Provide ONE specific strategy to boost their productivity based on their actual behavior patterns. Be practical and encouraging. 1-2 sentences with an emoji.`,
  
  habit_formation: `You are a habit formation specialist. Look at the user's consistency patterns and check-in frequency. Provide ONE insight about their habit-building progress or suggest a specific technique to strengthen their routine. Be motivational. 1-2 sentences with an emoji.`
};

async function generateInsightFromGroq(pattern: string, latestCheckIn: any, insightType: string = 'pattern_recognition'): Promise<string | null> {
  if (!GROQ_API_KEY || GROQ_API_KEY === 'gsk_demo_key') {
    console.log('No Groq API key found, using fallback insight');
    return generateFallbackInsight(latestCheckIn, insightType);
  }

  try {
    const systemPrompt = COACHING_PROMPTS[insightType as keyof typeof COACHING_PROMPTS] || COACHING_PROMPTS.pattern_recognition;
    
    const userPrompt = `Recent check-in pattern:
${pattern}

Latest check-in details:
- Mood: ${latestCheckIn?.mood || 'Not specified'}
- Progress: ${latestCheckIn?.progress || 0}%
- Energy Level: ${latestCheckIn?.meta?.energy_level || 'Not specified'}
- Wins: ${latestCheckIn?.meta?.wins || 'None mentioned'}
- Challenges: ${latestCheckIn?.meta?.challenges || 'None mentioned'}
- Time of Day: ${latestCheckIn?.meta?.time_of_day || 'Not specified'}

Provide one specific, actionable insight based on this data.`;

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 200,
        temperature: 0.7,
        top_p: 0.9
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Groq API error:', errorData);
      return generateFallbackInsight(latestCheckIn, insightType);
    }

    const data = await response.json();
    const insight = data.choices[0]?.message?.content?.trim();
    
    if (!insight) {
      console.error('No insight generated from Groq');
      return generateFallbackInsight(latestCheckIn, insightType);
    }

    console.log('✅ Generated AI insight:', insight);
    return insight;

  } catch (error) {
    console.error('Error calling Groq API:', error);
    return generateFallbackInsight(latestCheckIn, insightType);
  }
}

function generateFallbackInsight(latestCheckIn: any, insightType: string): string {
  const fallbackInsights = {
    pattern_recognition: [
      `🔍 I notice you're building great momentum with your check-ins! Your consistency is the foundation of lasting change.`,
      `📊 Your progress tracking shows you're ${latestCheckIn?.progress > 70 ? 'crushing it' : 'making steady progress'}. Keep up the great work!`,
      `⚡ Your energy levels seem to be ${latestCheckIn?.meta?.energy_level > 7 ? 'high - perfect for tackling big goals' : 'steady - consistency matters more than intensity'}!`
    ],
    energy_optimization: [
      `🌅 Your energy patterns suggest you work best ${latestCheckIn?.meta?.time_of_day === 'morning' ? 'in the morning - protect this golden time' : 'at different times - experiment to find your peak hours'}!`,
      `⚡ Consider scheduling your most important tasks when your energy is naturally higher for maximum impact.`,
      `🔋 Your energy level of ${latestCheckIn?.meta?.energy_level || 'unknown'} suggests you're ${latestCheckIn?.meta?.energy_level > 6 ? 'in a great flow state' : 'ready to recharge and come back stronger'}!`
    ],
    mood_coaching: [
      `😊 Your ${latestCheckIn?.mood || 'positive'} mood is a superpower! This emotional state is perfect for making progress on your goals.`,
      `💪 I see you're feeling ${latestCheckIn?.mood || 'motivated'} - this is when breakthroughs happen. Lean into this energy!`,
      `🌟 Your emotional awareness through these check-ins is building incredible self-knowledge. That's the key to lasting change!`
    ],
    productivity_boost: [
      `🎯 Your ${latestCheckIn?.progress || 50}% progress shows you're moving in the right direction. Small consistent steps create big results!`,
      `🚀 ${latestCheckIn?.meta?.wins ? `Celebrating your win: "${latestCheckIn.meta.wins}" - this momentum is everything!` : 'Every check-in is a win in itself - you\'re building the habit of self-awareness!'}`,
      `💡 ${latestCheckIn?.meta?.challenges ? `Your challenge "${latestCheckIn.meta.challenges}" is actually data - use it to optimize your approach!` : 'The fact that you\'re consistently checking in shows incredible commitment!'}`
    ],
    habit_formation: [
      `🔄 Every check-in strengthens your self-awareness habit. You're literally rewiring your brain for success!`,
      `📈 Your consistency with these check-ins is building the foundation for all your other goals. This is how change happens!`,
      `🎯 The habit of regular reflection you're building here will serve you in every area of life. Keep going!`
    ]
  };

  const insights = fallbackInsights[insightType as keyof typeof fallbackInsights] || fallbackInsights.pattern_recognition;
  return insights[Math.floor(Math.random() * insights.length)];
}

function determineInsightType(pattern: string, latestCheckIn: any): string {
  // Simple logic to determine what type of insight to generate
  const energyMentioned = pattern.includes('energy') || latestCheckIn?.meta?.energy_level;
  const moodFocus = pattern.includes('mood') || latestCheckIn?.mood;
  const progressFocus = pattern.includes('progress') || latestCheckIn?.progress;
  const challengesMentioned = latestCheckIn?.meta?.challenges;
  const winsMentioned = latestCheckIn?.meta?.wins;

  if (energyMentioned) return 'energy_optimization';
  if (challengesMentioned && winsMentioned) return 'productivity_boost';
  if (moodFocus) return 'mood_coaching';
  if (progressFocus) return 'habit_formation';
  
  return 'pattern_recognition';
}

export async function POST(request: NextRequest) {
  try {
    const { userId, pattern, latestCheckIn } = await request.json();

    if (!userId || !pattern) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and pattern' },
        { status: 400 }
      );
    }

    console.log('🧠 Generating AI insight for user:', userId);

    // Determine the best type of insight to generate
    const insightType = determineInsightType(pattern || '', latestCheckIn);
    console.log('📊 Insight type:', insightType);

    // Generate AI insight using Groq
    const insight = await generateInsightFromGroq(pattern, latestCheckIn, insightType);
    
    if (!insight) {
      return NextResponse.json(
        { error: 'Failed to generate AI insight' },
        { status: 500 }
      );
    }

    // Determine appropriate tags based on insight type and content
    const tags = ['ai_generated', insightType];
    if (insight.includes('energy')) tags.push('energy_optimization');
    if (insight.includes('mood') || insight.includes('feel')) tags.push('mood_analysis');
    if (insight.includes('progress') || insight.includes('goal')) tags.push('goal_completion');
    if (insight.includes('habit') || insight.includes('consistent')) tags.push('habit_formation');
    if (insight.includes('time') || insight.includes('morning') || insight.includes('evening')) tags.push('timing_optimization');

    // Store insight in Supabase
    const { data, error } = await supabase
      .from('insights')
      .insert([{
        user_id: userId,
        summary: insight,
        source: GROQ_API_KEY && GROQ_API_KEY !== 'gsk_demo_key' ? 'groq' : 'fallback',
        tags: tags,
        meta: {
          pattern_analyzed: pattern,
          check_in_count: pattern.split('\n').length,
          generated_at: new Date().toISOString(),
          latest_mood: latestCheckIn?.mood,
          latest_energy: latestCheckIn?.meta?.energy_level
        }
      }])
      .select()
      .single();

    if (error) {
      console.error('Error storing insight:', error);
      return NextResponse.json(
        { error: 'Failed to store insight in database' },
        { status: 500 }
      );
    }

    console.log('✅ AI insight generated and stored successfully');

    return NextResponse.json({
      success: true,
      insight: data,
      insightType,
      tags,
      saved: !!data,
      message: 'AI insight generated and stored successfully'
    });

  } catch (error) {
    console.error('Error in insights API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch insights for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'test-user-id';
    const limit = parseInt(searchParams.get('limit') || '5');

    const { data, error } = await supabase
      .from('insights')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching insights:', error);
      
      // Provide fallback insights when database isn't set up
      const fallbackInsights = [
        {
          id: 'demo-1',
          user_id: userId,
          summary: '🎯 You\'re building great momentum! I notice you tend to have higher energy levels in the morning - consider scheduling your most important goals during this peak time for maximum impact.',
          timestamp: new Date().toISOString(),
          source: 'demo',
          tags: ['pattern_recognition', 'energy_optimization', 'timing'],
          meta: { confidence: 0.85, pattern_analyzed: 'energy_levels', check_in_count: 7 },
          is_read: false,
          is_liked: false,
          created_at: new Date().toISOString()
        },
        {
          id: 'demo-2',
          user_id: userId,
          summary: '💪 Your consistency with check-ins is impressive! Every time you reflect on your progress, you\'re strengthening the neural pathways for self-awareness. This habit will serve you well beyond just goal tracking.',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          source: 'demo',
          tags: ['habit_formation', 'consistency', 'positive_reinforcement'],
          meta: { confidence: 0.92, pattern_analyzed: 'check_in_frequency', check_in_count: 12 },
          is_read: false,
          is_liked: false,
          created_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 'demo-3',
          user_id: userId,
          summary: '🧠 I see you\'ve been mentioning challenges in your check-ins. This self-awareness is actually a superpower - most people avoid acknowledging obstacles. Your honesty with yourself is the foundation of breakthrough growth.',
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          source: 'demo',
          tags: ['self_awareness', 'challenge_processing', 'growth_mindset'],
          meta: { confidence: 0.78, pattern_analyzed: 'challenge_acknowledgment', check_in_count: 5 },
          is_read: true,
          is_liked: true,
          created_at: new Date(Date.now() - 172800000).toISOString()
        }
      ];

      return NextResponse.json({ 
        insights: fallbackInsights,
        count: fallbackInsights.length,
        demo: true,
        message: 'Using demo insights - run database schema to enable real AI coaching'
      });
    }

    return NextResponse.json({ 
      insights: data || [],
      count: data?.length || 0
    });

  } catch (error) {
    console.error('Error in GET insights API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 