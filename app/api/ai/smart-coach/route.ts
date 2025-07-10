import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Import the new enhanced AI services
let aiService: any = null;
let embeddingsService: any = null;
let patternRecognitionService: any = null;

// Dynamically import AI services (for serverless compatibility)
async function initializeAIServices() {
  if (!aiService) {
    try {
      const aiModule = await import('@/lib/ai-service');
      const embeddingsModule = await import('@/lib/embeddings-service');
      const patternModule = await import('@/lib/pattern-recognition-service');
      
      aiService = aiModule.aiService;
      embeddingsService = embeddingsModule.embeddingsService;
      patternRecognitionService = patternModule.patternRecognitionService;
    } catch (error) {
      console.warn('AI services not available, using fallback responses');
    }
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Enhanced AI Coach with real LLM and pattern recognition
export async function POST(request: NextRequest) {
  try {
    // Initialize AI services with timeout
    await Promise.race([
      initializeAIServices(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('AI service timeout')), 5000))
    ]);

    const { message, userId } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json({ 
        response: "I'm here to help! What's on your mind today?",
        success: true 
      });
    }

    // Get user data in parallel with timeouts
    const [goals, recentCheckins, conversationHistory, userStats] = await Promise.allSettled([
      Promise.race([getUserGoals(userId), new Promise((_, reject) => setTimeout(() => reject('timeout'), 2000))]),
      Promise.race([getUserCheckins(userId), new Promise((_, reject) => setTimeout(() => reject('timeout'), 2000))]),
      Promise.race([getConversationHistory(userId), new Promise((_, reject) => setTimeout(() => reject('timeout'), 2000))]),
      Promise.race([getUserStats(userId), new Promise((_, reject) => setTimeout(() => reject('timeout'), 2000))])
    ]);

    // Extract results safely
    const recentGoals = goals.status === 'fulfilled' ? goals.value : [];
    const checkins = recentCheckins.status === 'fulfilled' ? recentCheckins.value : [];
    const chatHistory = conversationHistory.status === 'fulfilled' ? conversationHistory.value : [];
    const stats = userStats.status === 'fulfilled' ? userStats.value : null;

    // Create simplified context quickly
    const enhancedContext = {
      goals: recentGoals || [],
      recentCheckins: checkins || [],
      mood: 'motivated',
      energy: 7,
      streakDays: calculateStreak(checkins || []),
      totalXP: stats?.total_xp || 0,
      currentChallenges: extractChallenges(chatHistory || []),
      behaviorPatterns: {
        peakPerformanceTimes: ['9:00 AM'],
        strugglingAreas: [],
        motivationTriggers: ['achievement', 'progress']
      },
      historicalData: {
        successRate: 75,
        avgSessionLength: 15,
        preferredCheckInTimes: ['9:00 AM', '6:00 PM']
      }
    };

    let aiResponse = '';

    // Try AI service with timeout
    if (aiService) {
      try {
        const responsePromise = aiService.generateResponse(message, enhancedContext);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('AI response timeout')), 10000)
        );
        
        aiResponse = await Promise.race([responsePromise, timeoutPromise]) as string;

        // Store conversation asynchronously (don't wait)
        setImmediate(async () => {
          try {
            if (embeddingsService) {
              await embeddingsService.storeAIConversation(
                userId,
                message,
                aiResponse,
                'momentum-master',
                enhancedContext,
                analyzeSentiment(message)
              );
            }
          } catch (error) {
            console.warn('Background embedding storage failed:', error);
          }
        });

      } catch (aiError) {
        console.warn('AI service error, using smart fallback:', aiError);
        aiResponse = generateSmartResponse({
          message,
          goals: enhancedContext.goals,
          recentEvents: checkins || [],
          insights: [],
          userContext: enhancedContext
        });
      }
    } else {
      // Fast fallback response
      aiResponse = generateSmartResponse({
        message,
        goals: enhancedContext.goals,
        recentEvents: checkins || [],
        insights: [],
        userContext: enhancedContext
      });
    }

    // Store chat messages asynchronously (don't wait)
    setImmediate(async () => {
      try {
        await Promise.all([
          supabase.from('chat_messages').insert({
            user_id: userId,
            message: message,
            is_ai: false,
            timestamp: new Date().toISOString()
          }),
          supabase.from('chat_messages').insert({
            user_id: userId,
            message: aiResponse,
            is_ai: true,
            timestamp: new Date().toISOString()
          })
        ]);
      } catch (error) {
        console.warn('Background chat storage failed:', error);
      }
    });

    // Return response immediately
    return NextResponse.json({
      response: aiResponse,
      success: true,
      aiPowered: !!aiService,
      patterns: enhancedContext.behaviorPatterns,
      insights_generated: false, // Disabled for speed
      metadata: {
        streak: enhancedContext.streakDays,
        energy: enhancedContext.energy,
        mood: enhancedContext.mood,
        response_time: Date.now()
      }
    });

  } catch (error) {
    console.error('Enhanced AI Coach Error:', error);
    
    return NextResponse.json({
      response: generateFallbackResponse(),
      success: false,
      fallback: true,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Enhanced helper functions

async function getUserGoals(userId: string) {
  const { data } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);
  return data;
}

async function getUserCheckins(userId: string) {
  const { data } = await supabase
    .from('checkins')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);
  return data;
}

async function getConversationHistory(userId: string) {
  const { data } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .limit(10);
  return data;
}

async function getUserStats(userId: string) {
  const { data } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .single();
  return data;
}

async function getBehaviorPatterns(userId: string) {
  try {
    if (!patternRecognitionService) return null;
    
    const analysis = await patternRecognitionService.analyzeHabitPatterns(userId);
    return {
      peakPerformanceTimes: analysis.patterns?.timePatterns?.peakHour ? [`${analysis.patterns.timePatterns.peakHour}:00`] : [],
      strugglingAreas: extractStrugglingAreas(analysis),
      motivationTriggers: extractMotivationTriggers(analysis)
    };
  } catch (error) {
    console.warn('Failed to get behavior patterns:', error);
    return null;
  }
}

async function getHistoricalData(userId: string) {
  try {
    const { data: goals } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId);
    
         const completedGoals = goals?.filter(g => g.status === 'completed') || [];
     const successRate = goals && goals.length > 0 ? (completedGoals.length / goals.length) * 100 : 0;
    
    return {
      successRate: Math.round(successRate),
      avgSessionLength: 15, // Could be calculated from actual data
      preferredCheckInTimes: ['9:00 AM', '6:00 PM'] // Could be calculated from patterns
    };
  } catch (error) {
    return {
      successRate: 0,
      avgSessionLength: 15,
      preferredCheckInTimes: []
    };
  }
}

function calculateStreak(checkins: any[]): number {
  if (!checkins || checkins.length === 0) return 0;
  
  const today = new Date();
  let streak = 0;
  
  for (let i = 0; i < checkins.length; i++) {
    const checkinDate = new Date(checkins[i].created_at);
    const daysDiff = Math.floor((today.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === streak) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

function extractChallenges(conversations: any[]): string[] {
  const challenges = [];
  const challengeKeywords = ['difficult', 'hard', 'struggle', 'challenge', 'problem'];
  
  for (const conv of conversations || []) {
    if (!conv.is_ai && challengeKeywords.some(keyword => 
      conv.message.toLowerCase().includes(keyword)
    )) {
      // Extract the challenge context
      const words = conv.message.split(' ');
      const challengeIndex = words.findIndex((word: string) => 
        challengeKeywords.some(keyword => word.toLowerCase().includes(keyword))
      );
      
      if (challengeIndex > -1) {
        const context = words.slice(Math.max(0, challengeIndex - 2), challengeIndex + 3).join(' ');
        challenges.push(context);
      }
    }
  }
  
  return challenges.slice(0, 3); // Return top 3 challenges
}

function analyzeSentiment(text: string): number {
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'motivated', 'confident', 'happy', 'excited'];
  const negativeWords = ['bad', 'awful', 'terrible', 'struggling', 'frustrated', 'overwhelmed', 'stuck', 'difficult', 'hard', 'sad'];
  
  const words = text.toLowerCase().split(/\s+/);
  let score = 0;
  
     words.forEach((word: string) => {
     if (positiveWords.includes(word)) score += 1;
     if (negativeWords.includes(word)) score -= 1;
   });
  
  // Normalize to -1 to 1 range
  return Math.max(-1, Math.min(1, score / Math.max(words.length / 5, 1)));
}

function shouldGenerateInsights(message: string): boolean {
  const insightTriggers = ['help', 'advice', 'struggling', 'pattern', 'improve', 'better', 'analyze'];
  return insightTriggers.some(trigger => message.toLowerCase().includes(trigger));
}

async function storeInsight(userId: string, insight: any) {
  try {
    await supabase.from('insights').insert({
      user_id: userId,
      title: insight.title,
      content: insight.description,
      category: insight.category,
      confidence_score: insight.confidence,
      actionable: insight.actions?.length > 0,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.warn('Failed to store insight:', error);
  }
}

function extractStrugglingAreas(analysis: any): string[] {
  return analysis?.insights?.filter((i: any) => i.type === 'struggle_points')
    .map((i: any) => i.title) || [];
}

function extractMotivationTriggers(analysis: any): string[] {
  return analysis?.insights?.filter((i: any) => i.type === 'motivation_triggers')
    .map((i: any) => i.title) || [];
}

// Keep the existing smart response system as fallback
function generateSmartResponse({ message, goals, recentEvents, insights, userContext }: any) {
  const messageLower = message.toLowerCase();
  
  // Analyze user's emotional state and intent
  const intent = analyzeIntent(messageLower);
  const mood = analyzeMood(messageLower);
  
  // Personalized responses based on user data
  switch (intent) {
    case 'goal_check':
      return generateGoalCheckResponse(goals, userContext);
    
    case 'motivation_needed':
      return generateMotivationResponse(goals, recentEvents, mood);
    
    case 'progress_update':
      return generateProgressResponse(goals, recentEvents);
    
    case 'obstacle_discussion':
      return generateObstacleResponse(message, goals, insights);
    
    case 'reflection':
      return generateReflectionResponse(recentEvents, insights);
    
    case 'planning':
      return generatePlanningResponse(goals, userContext);
    
    default:
      return generateContextualResponse(message, goals, userContext, mood);
  }
}

function analyzeIntent(message: string): string {
  if (message.includes('goal') || message.includes('progress') || message.includes('achieve')) {
    return 'goal_check';
  }
  if (message.includes('motivat') || message.includes('inspire') || message.includes('stuck')) {
    return 'motivation_needed';
  }
  if (message.includes('did') || message.includes('completed') || message.includes('finished')) {
    return 'progress_update';
  }
  if (message.includes('problem') || message.includes('difficult') || message.includes('challenge')) {
    return 'obstacle_discussion';
  }
  if (message.includes('think') || message.includes('feel') || message.includes('reflect')) {
    return 'reflection';
  }
  if (message.includes('plan') || message.includes('next') || message.includes('tomorrow')) {
    return 'planning';
  }
  return 'general';
}

function analyzeMood(message: string): string {
  const positiveWords = ['great', 'good', 'happy', 'excited', 'motivated', 'confident'];
  const negativeWords = ['bad', 'sad', 'frustrated', 'stuck', 'overwhelmed', 'tired'];
  
  const hasPositive = positiveWords.some(word => message.includes(word));
  const hasNegative = negativeWords.some(word => message.includes(word));
  
  if (hasPositive && !hasNegative) return 'positive';
  if (hasNegative && !hasPositive) return 'negative';
  return 'neutral';
}

function generateGoalCheckResponse(goals: any[], userContext: any): string {
  if (!goals || goals.length === 0) {
    return "I notice you haven't set any goals yet. Let's start there! What's one meaningful goal you'd like to work toward? I'll help you break it down into manageable steps.";
  }
  
  const activeGoals = goals.filter(g => g.status === 'active');
  const totalProgress = activeGoals.reduce((sum, g) => sum + (g.progress || 0), 0) / activeGoals.length;
  
  if (totalProgress > 70) {
    return `You're crushing it! 🎯 Your goals are ${Math.round(totalProgress)}% complete on average. You're in the final stretch - this is where champions separate themselves. What's your next move to cross the finish line?`;
  } else if (totalProgress > 40) {
    return `Solid progress! You're ${Math.round(totalProgress)}% of the way there. You've built momentum - now let's amplify it. Which goal needs your focus today to keep this energy flowing?`;
  } else {
    return `Every expert was once a beginner. You're ${Math.round(totalProgress)}% into your journey, and that's ${Math.round(totalProgress)}% more than yesterday. Let's identify one small win you can achieve today to build momentum.`;
  }
}

function generateMotivationResponse(goals: any[], recentEvents: any[], mood: string): string {
  const motivationalMessages = {
    positive: [
      "Your positive energy is contagious! 🌟 Channel this momentum into your most important goal today. What action will you take while you're feeling this strong?",
      "I love seeing you fired up! This is the energy that transforms dreams into reality. Which goal deserves this incredible energy right now?"
    ],
    negative: [
      "I hear you, and it's okay to feel this way. Every successful person has these moments. 💪 Let's start small - what's one tiny step you can take today that your future self will thank you for?",
      "Tough days don't last, but resilient people do. You've overcome challenges before, and you'll overcome this one too. What's the smallest positive action you can take right now?"
    ],
    neutral: [
      "Sometimes the best breakthroughs come from quiet determination. 🎯 You don't need to feel perfect to make progress. What's one goal-aligned action you can take today?",
      "Consistency beats intensity every time. You're building something meaningful, one day at a time. What small step will you take today?"
    ]
  };
  
  const messages = motivationalMessages[mood as keyof typeof motivationalMessages] || motivationalMessages.neutral;
  return messages[Math.floor(Math.random() * messages.length)];
}

function generateProgressResponse(goals: any[], recentEvents: any[]): string {
  const recentActions = recentEvents.filter(e => e.event_type === 'goal_action').length;
  
  if (recentActions > 5) {
    return "You've been incredibly active lately! 🚀 I'm seeing consistent action toward your goals. This momentum is powerful - how can we sustain and build on it?";
  } else if (recentActions > 2) {
    return "Nice work on staying engaged with your goals! 📈 You're building valuable momentum. What's one area where you'd like to accelerate your progress?";
  } else {
    return "Let's get some momentum going! 💪 Even small actions compound over time. What's one goal-related action you can take today to restart your forward movement?";
  }
}

function generateObstacleResponse(message: string, goals: any[], insights: any[]): string {
  return "I hear that you're facing a challenge. Remember, obstacles are often opportunities in disguise. 🧗‍♂️ Let's break this down - what specific part of this challenge feels most manageable to tackle first?";
}

function generateReflectionResponse(recentEvents: any[], insights: any[]): string {
  if (insights && insights.length > 0) {
    return `Based on your recent patterns, I've noticed some interesting insights. ${insights[0]?.content || ''} What resonates with you about this observation?`;
  }
  
  return "Reflection is such a powerful tool for growth. 🤔 Looking at your recent journey, what's one thing you're proud of, and what's one area where you see room for improvement?";
}

function generatePlanningResponse(goals: any[], userContext: any): string {
  return "Planning ahead shows wisdom! 📅 Based on your current goals and energy level, what's the most important thing you want to accomplish next? Let's create a clear path forward.";
}

function generateContextualResponse(message: string, goals: any[], userContext: any, mood: string): string {
  const streak = userContext.streakDays || 0;
  const energy = userContext.energy || 7;
  
  if (streak > 7) {
    return `I'm impressed by your ${streak}-day streak! 🔥 That consistency is building real momentum. With your energy at ${energy}/10, what goal deserves your attention today?`;
  } else if (energy > 8) {
    return `You're radiating high energy today (${energy}/10)! ⚡ This is perfect for tackling something meaningful. What would make today feel like a win?`;
  } else {
    return "I'm here to support you on your journey. 🌟 Every step forward, no matter how small, is progress worth celebrating. What's on your mind today?";
  }
}

function generateFallbackResponse(): string {
  const responses = [
    "I'm having trouble connecting to my full capabilities right now, but I'm still here for you! 💪 Keep up the great work on your journey!",
    "Even though I can't access all my insights right now, I believe in your ability to stay consistent! 🌟 What's one small step you can take today?",
    "Connection issues won't stop your momentum! You've got this, and I'll be back online soon! 🚀 Keep pushing forward!"
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
} 