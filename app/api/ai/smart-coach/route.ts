import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Smart AI Coach that works without external APIs
export async function POST(request: NextRequest) {
  try {
    const { message, userId = 'demo-user', goals = [], userContext = {} } = await request.json();

    console.log('🧠 Smart AI Coach processing:', { message, userId });

    // Store the user message in Supabase
    await supabase.from('chat_messages').insert({
      user_id: userId,
      message: message,
      is_ai: false,
      timestamp: new Date().toISOString()
    });

    // Get user's recent activity and goals from Supabase
    const { data: recentGoals } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: recentEvents } = await supabase
      .from('user_events')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(10);

    const { data: recentInsights } = await supabase
      .from('insights')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(3);

    // Generate intelligent response based on user data
    const aiResponse = generateSmartResponse({
      message,
      goals: recentGoals || goals || [],
      recentEvents: recentEvents || [],
      insights: recentInsights || [],
      userContext
    });

    // Store AI response in Supabase
    await supabase.from('chat_messages').insert({
      user_id: userId,
      message: aiResponse,
      is_ai: true,
      timestamp: new Date().toISOString()
    });

    // Generate actionable insight if appropriate
    if (shouldGenerateInsight(message, recentEvents || [])) {
      const insight = generateInsight(message, recentGoals || [], recentEvents || []);
      await supabase.from('insights').insert({
        user_id: userId,
        title: insight.title,
        content: insight.content,
        category: insight.category,
        confidence_score: insight.confidence,
        created_at: new Date().toISOString()
      });
    }

    return NextResponse.json({
      response: aiResponse,
      success: true,
      insights_generated: shouldGenerateInsight(message, recentEvents || [])
    });

  } catch (error) {
    console.error('Smart AI Coach Error:', error);
    
    const fallbackResponse = generateFallbackResponse();
    
    return NextResponse.json({
      response: fallbackResponse,
      success: false,
      fallback: true
    });
  }
}

// Intelligent response generation based on patterns and context
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
  
  if (recentActions > 3) {
    return `I'm seeing incredible consistency from you! 🔥 ${recentActions} goal-aligned actions recently. This is how lasting change happens. You're not just achieving goals - you're becoming the person who achieves goals naturally.`;
  } else if (recentActions > 0) {
    return `Nice work on staying active with your goals! 📈 I see ${recentActions} recent actions. Let's build on this momentum. What's the next logical step for your most important goal?`;
  } else {
    return `It looks like it's been quiet on the goal front lately, and that's totally normal. Life happens! 🌱 Let's restart gently. What's one small action you can take today to reconnect with your goals?`;
  }
}

function generateObstacleResponse(message: string, goals: any[], insights: any[]): string {
  return `I appreciate you sharing this challenge with me. 🤝 Obstacles aren't roadblocks - they're data points that help us refine our approach. Let's break this down: What specifically is making this difficult? Often, the solution is simpler than we think.`;
}

function generateReflectionResponse(recentEvents: any[], insights: any[]): string {
  if (insights.length > 0) {
    return `Your self-awareness is a superpower! 🧠 Based on your recent patterns, I've noticed you're strongest when you ${insights[0]?.content || 'stay consistent with small actions'}. How does this resonate with your experience?`;
  }
  
  return `Reflection is where growth lives. 🌱 Looking at your recent journey, what pattern do you notice about when you feel most motivated vs. when you struggle? Understanding this gives us the blueprint for your success.`;
}

function generatePlanningResponse(goals: any[], userContext: any): string {
  return `I love that you're thinking ahead! 🗓️ Great achievers are great planners. Based on your goals, what's the one thing that, if you accomplished it tomorrow, would make the biggest positive impact on your progress? Let's build your day around that.`;
}

function generateContextualResponse(message: string, goals: any[], userContext: any, mood: string): string {
  const responses = [
    `I'm here to support your journey! 🌟 Every conversation we have is an investment in your future self. What's on your mind about your goals today?`,
    `Your commitment to growth inspires me! 💪 Whether you're celebrating wins or working through challenges, I'm here to help you stay focused on what matters most.`,
    `Success is built one conversation, one decision, one action at a time. 🎯 You're already investing in yourself by being here. What would make today feel like a win for you?`
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

function shouldGenerateInsight(message: string, recentEvents: any[]): boolean {
  // Generate insights for meaningful conversations or patterns
  return message.length > 50 || recentEvents.length > 5;
}

function generateInsight(message: string, goals: any[], recentEvents: any[]) {
  return {
    title: "Pattern Recognition",
    content: "You tend to be most successful when you break big goals into small, daily actions.",
    category: "behavioral_pattern",
    confidence: 0.8
  };
}

function generateFallbackResponse(): string {
  const fallbacks = [
    "I'm processing your message and want to give you a thoughtful response. Your goals matter to me, and I'm here to support you however I can. What's your biggest priority right now?",
    "Thank you for sharing with me. I'm designed to help you achieve your goals through consistent action and reflection. What would make today feel successful for you?",
    "I appreciate your patience as I analyze the best way to support you. Your commitment to growth is already a victory. What's one small step you can take toward your goals today?"
  ];
  
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
} 