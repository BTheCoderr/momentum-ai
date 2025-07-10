import { supabase } from './supabase';

// Types for our AI insights system
interface CheckIn {
  id: string;
  user_id: string;
  mood: number;
  energy: number;
  stress: number;
  wins: string;
  challenges: string;
  priorities: string;
  reflection: string;
  date: string;
  created_at: string;
}

interface InsightPattern {
  type: 'mood' | 'energy' | 'productivity' | 'behavior' | 'timing';
  pattern: string;
  confidence: number;
  timeframe: string;
}

interface ActionableSuggestion {
  category: 'routine' | 'mindset' | 'health' | 'productivity' | 'goals';
  suggestion: string;
  rationale: string;
  priority: 'high' | 'medium' | 'low';
}

/**
 * Call Claude 3 API with a prompt and return the response
 */
async function callClaude(prompt: string): Promise<string> {
  const { getClaudeApiKey, CLAUDE_CONFIG } = await import('./claude-config');
  const CLAUDE_API_KEY = getClaudeApiKey();
  
  if (!CLAUDE_API_KEY) {
    console.warn('⚠️ Claude API key not found, using fallback response');
    return getFallbackResponse(prompt);
  }

  try {
    const response = await fetch(CLAUDE_CONFIG.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': CLAUDE_CONFIG.API_VERSION
      },
      body: JSON.stringify({
        model: CLAUDE_CONFIG.MODEL,
        max_tokens: CLAUDE_CONFIG.MAX_TOKENS,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text || '';
  } catch (error) {
    console.error('❌ Claude API call failed:', error);
    return getFallbackResponse(prompt);
  }
}

/**
 * Generate fallback response when Claude API is unavailable
 */
function getFallbackResponse(prompt: string): string {
  if (prompt.includes('patterns') || prompt.includes('insights')) {
    return `• You've been consistently checking in, showing great commitment to self-awareness
• Your energy levels tend to be higher earlier in the day
• You often mention productivity challenges in the afternoon
• Your mood correlates with completing morning routines
• You're developing a pattern of reflection and goal-setting`;
  }
  
  if (prompt.includes('suggestions') || prompt.includes('recommendations')) {
    return `• Try scheduling your most important tasks during your high-energy morning hours
• Implement a 10-minute afternoon walk to boost energy and mood
• Create a consistent morning routine that includes the activities that boost your mood
• Set specific, measurable goals for your top 3 priorities each week
• Practice gratitude journaling to reinforce positive patterns you're already building`;
  }

  return 'Based on your check-ins, you\'re building great self-awareness habits. Keep focusing on consistency and celebrating small wins!';
}

/**
 * Parse bullet points from AI response
 */
function parseBulletPoints(text: string): string[] {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('•') || line.startsWith('-') || line.startsWith('*'))
    .map(line => line.replace(/^[•\-\*]\s*/, ''))
    .filter(line => line.length > 0);
}

/**
 * Fetch user's check-in history from Supabase
 */
async function getUserCheckIns(userId: string, limit = 30): Promise<CheckIn[]> {
  try {
    const { data, error } = await supabase
      .from('checkins')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ Error fetching check-ins:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('❌ Failed to fetch check-ins:', error);
    return [];
  }
}

/**
 * Generate insights about user's behavior patterns from check-in history
 */
export async function generateInsights(userId: string): Promise<string[]> {
  try {
    console.log('🧠 Generating insights for user:', userId);
    
    // Get user's recent check-ins
    const checkIns = await getUserCheckIns(userId);
    
    if (checkIns.length === 0) {
      return [
        'Start doing daily check-ins to unlock personalized insights about your patterns',
        'Your first week of check-ins will reveal your mood and energy trends',
        'Consistent logging helps identify what activities boost your wellbeing'
      ];
    }

    // Prepare context for Claude
    const checkInSummary = checkIns.slice(0, 10).map(checkIn => ({
      date: new Date(checkIn.created_at).toLocaleDateString(),
      mood: checkIn.mood,
      energy: checkIn.energy,
      stress: checkIn.stress,
      wins: checkIn.wins?.substring(0, 100) || '',
      challenges: checkIn.challenges?.substring(0, 100) || ''
    }));

    const prompt = `
Analyze this user's daily check-in data and identify 3-5 key behavioral patterns or insights. 
Be specific and actionable. Focus on trends in mood, energy, productivity, and timing.

Check-in history (most recent first):
${JSON.stringify(checkInSummary, null, 2)}

Please provide insights as bullet points, focusing on:
- Mood and energy patterns throughout the week
- Correlations between activities and wellbeing
- Timing patterns (when they feel best/worst)
- Recurring themes in wins and challenges
- Progress indicators or concerning trends

Format as bullet points starting with •
`;

    const response = await callClaude(prompt);
    const insights = parseBulletPoints(response);
    
    return insights.length > 0 ? insights : [
      'Your check-in consistency shows commitment to personal growth',
      'Continue tracking to reveal more detailed patterns',
      'Focus on noting what activities correlate with better mood and energy'
    ];

  } catch (error) {
    console.error('❌ Error generating insights:', error);
    return [
      'Unable to generate insights right now',
      'Keep doing your daily check-ins to build a pattern history',
      'Your consistency in self-reflection is already a positive habit'
    ];
  }
}

/**
 * Generate actionable suggestions based on user's patterns
 */
export async function getSuggestions(userId: string): Promise<string[]> {
  try {
    console.log('💡 Generating suggestions for user:', userId);
    
    // Get user's recent check-ins
    const checkIns = await getUserCheckIns(userId);
    
    if (checkIns.length === 0) {
      return [
        'Complete your first daily check-in to get personalized suggestions',
        'Try checking in at the same time each day to build a routine',
        'Be honest about both wins and challenges for better insights'
      ];
    }

    // First get insights to understand patterns
    const insights = await generateInsights(userId);
    
    // Prepare detailed context for suggestions
    const recentData = {
      averageMood: checkIns.reduce((sum, c) => sum + c.mood, 0) / checkIns.length,
      averageEnergy: checkIns.reduce((sum, c) => sum + c.energy, 0) / checkIns.length,
      averageStress: checkIns.reduce((sum, c) => sum + c.stress, 0) / checkIns.length,
      commonWins: checkIns.map(c => c.wins).filter(w => w).slice(0, 5),
      commonChallenges: checkIns.map(c => c.challenges).filter(c => c).slice(0, 5),
      checkInFrequency: checkIns.length
    };

    const prompt = `
Based on these insights about a user's behavior patterns, generate 4-6 specific, actionable suggestions to help them improve their wellbeing and productivity.

User Insights:
${insights.join('\n')}

Current Stats:
- Average mood: ${recentData.averageMood.toFixed(1)}/5
- Average energy: ${recentData.averageEnergy.toFixed(1)}/5  
- Average stress: ${recentData.averageStress.toFixed(1)}/5
- Recent wins: ${recentData.commonWins.join('; ')}
- Recent challenges: ${recentData.commonChallenges.join('; ')}

Provide specific, actionable suggestions like:
- Specific time-based recommendations (e.g., "Schedule deep work at 9 AM when your energy peaks")
- Habit adjustments based on patterns
- Stress management techniques 
- Energy optimization strategies
- Goal refinement suggestions

Format as bullet points starting with •
Make each suggestion specific and immediately actionable.
`;

    const response = await callClaude(prompt);
    const suggestions = parseBulletPoints(response);
    
    return suggestions.length > 0 ? suggestions : [
      'Schedule your most important tasks during your highest energy periods',
      'Create a consistent morning routine to start each day positively',
      'Take short breaks every 90 minutes to maintain energy throughout the day',
      'Practice deep breathing when stress levels are high',
      'Celebrate small wins to maintain motivation'
    ];

  } catch (error) {
    console.error('❌ Error generating suggestions:', error);
    return [
      'Continue your daily check-ins to unlock personalized suggestions',
      'Focus on identifying patterns in your mood and energy levels',
      'Note which activities consistently make you feel better',
      'Set small, specific goals that you can track daily'
    ];
  }
}

/**
 * Get a motivational coaching message based on recent check-ins
 */
export async function getCoachingMessage(userId: string, context?: string): Promise<string> {
  try {
    const checkIns = await getUserCheckIns(userId, 7); // Last week
    
    if (checkIns.length === 0) {
      return "Welcome to your journey of self-awareness! Your first check-in is the start of building better habits and understanding yourself better. I'm here to support you every step of the way! 🚀";
    }

    const recentMood = checkIns.slice(0, 3).reduce((sum, c) => sum + c.mood, 0) / Math.min(3, checkIns.length);
    const contextPrompt = context ? `The user just said: "${context}"` : '';
    
    const prompt = `
You're an empathetic AI coach. Give an encouraging, personalized message (2-3 sentences) based on this user's recent check-ins.

Recent mood average: ${recentMood.toFixed(1)}/5
Check-in streak: ${checkIns.length} days
${contextPrompt}

Recent wins: ${checkIns.map(c => c.wins).filter(w => w).slice(0, 3).join('; ')}

Be supportive, specific to their data, and motivating. Don't use bullet points.
`;

    const response = await callClaude(prompt);
    return response.trim() || "You're making great progress with your self-awareness journey. Keep up the consistent check-ins - they're building a foundation for lasting positive change! 💪";

  } catch (error) {
    console.error('❌ Error generating coaching message:', error);
    return "I believe in your ability to grow and improve. Every small step you take is building momentum toward your goals. Keep going! 🌟";
  }
}

/**
 * Comprehensive analysis combining insights, suggestions, and coaching
 */
export async function getComprehensiveAnalysis(userId: string): Promise<{
  insights: string[];
  suggestions: string[];
  coachingMessage: string;
  stats: {
    checkInCount: number;
    averageMood: number;
    averageEnergy: number;
    averageStress: number;
  };
}> {
  try {
    const checkIns = await getUserCheckIns(userId);
    
    const [insights, suggestions, coachingMessage] = await Promise.all([
      generateInsights(userId),
      getSuggestions(userId),
      getCoachingMessage(userId)
    ]);

    const stats = {
      checkInCount: checkIns.length,
      averageMood: checkIns.length > 0 ? checkIns.reduce((sum, c) => sum + c.mood, 0) / checkIns.length : 0,
      averageEnergy: checkIns.length > 0 ? checkIns.reduce((sum, c) => sum + c.energy, 0) / checkIns.length : 0,
      averageStress: checkIns.length > 0 ? checkIns.reduce((sum, c) => sum + c.stress, 0) / checkIns.length : 0,
    };

    return {
      insights,
      suggestions,
      coachingMessage,
      stats
    };

  } catch (error) {
    console.error('❌ Error generating comprehensive analysis:', error);
    return {
      insights: ['Keep building your check-in habit for deeper insights'],
      suggestions: ['Focus on consistency in your daily reflections'],
      coachingMessage: 'Every check-in is a step toward greater self-awareness!',
      stats: { checkInCount: 0, averageMood: 0, averageEnergy: 0, averageStress: 0 }
    };
  }
}

// Export the main functions
export { callClaude, parseBulletPoints }; 