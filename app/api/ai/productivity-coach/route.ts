import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Lifelong Partner AI - Subtle, intuitive, naturally supportive
export async function POST(request: NextRequest) {
  try {
    const { message, userId = 'demo-user', context = {} } = await request.json();
    
    console.log('🤝 Lifelong Partner processing:', { message, userId });

    // Get user's historical context and patterns
    const userContext = await getUserContext(userId);
    
    // Analyze message intent and emotional state
    const messageAnalysis = analyzeMessage(message, userContext);
    
    // Generate contextually aware response
    const response = await generateLifelongPartnerResponse(message, messageAnalysis, userContext);
    
    // Store interaction for learning
    await storeInteraction(userId, message, response, messageAnalysis);

    return NextResponse.json({
      response: response.text,
      tone: response.tone,
      suggestedActions: response.actions,
      insights: response.insights
    });

  } catch (error) {
    console.error('❌ Lifelong Partner Error:', error);
    return NextResponse.json({
      response: getFallbackResponse(),
      tone: 'supportive'
    });
  }
}

// Get comprehensive user context for personalized responses
async function getUserContext(userId: string) {
  try {
    // Get recent interactions, goals, check-ins, and patterns
    const [interactions, goals, checkIns, streaks] = await Promise.all([
      supabase.from('user_events')
        .select('*')
        .eq('user_id', userId)
        .eq('event_type', 'ai_interaction')
        .order('timestamp', { ascending: false })
        .limit(10),
      
      supabase.from('goals')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true),
      
      supabase.from('user_events')
        .select('*')
        .eq('user_id', userId)
        .eq('event_type', 'daily_checkin')
        .order('timestamp', { ascending: false })
        .limit(7),
      
      supabase.from('streaks')
        .select('*')
        .eq('user_id', userId)
    ]);

    return {
      recentInteractions: interactions.data || [],
      activeGoals: goals.data || [],
      recentCheckIns: checkIns.data || [],
      streaks: streaks.data || [],
      relationshipDuration: calculateRelationshipDuration(interactions.data || [])
    };
  } catch (error) {
    console.error('Error getting user context:', error);
    return { recentInteractions: [], activeGoals: [], recentCheckIns: [], streaks: [] };
  }
}

// Analyze message for intent, emotion, and context
function analyzeMessage(message: string, userContext: any) {
  const lowerMessage = message.toLowerCase();
  
  // Detect emotional state
  const emotionalMarkers = {
    frustrated: ['frustrated', 'annoyed', 'stuck', 'can\'t', 'impossible', 'giving up'],
    excited: ['excited', 'amazing', 'awesome', 'great', 'fantastic', 'love'],
    uncertain: ['maybe', 'not sure', 'confused', 'don\'t know', 'unsure'],
    determined: ['will', 'going to', 'committed', 'ready', 'let\'s do this'],
    overwhelmed: ['too much', 'overwhelmed', 'stressed', 'busy', 'crazy'],
    reflective: ['thinking', 'wondering', 'realized', 'learned', 'noticed']
  };

  const detectedEmotions = [];
  for (const [emotion, markers] of Object.entries(emotionalMarkers)) {
    if (markers.some(marker => lowerMessage.includes(marker))) {
      detectedEmotions.push(emotion);
    }
  }

  // Detect intent categories
  const intentPatterns = {
    seeking_motivation: ['motivation', 'inspire', 'encourage', 'push me', 'need energy'],
    problem_solving: ['how do i', 'what should', 'help me', 'stuck on', 'figure out'],
    progress_sharing: ['did', 'completed', 'finished', 'achieved', 'accomplished'],
    goal_setting: ['want to', 'plan to', 'goal', 'target', 'aim to'],
    reflection: ['feel like', 'been thinking', 'realize', 'learned', 'noticed'],
    casual_chat: ['hi', 'hello', 'hey', 'how are', 'what\'s up'],
    seeking_accountability: ['should i', 'keep me', 'remind me', 'check on'],
    expressing_doubt: ['not sure if', 'maybe i should', 'wondering if', 'doubt']
  };

  const detectedIntents = [];
  for (const [intent, patterns] of Object.entries(intentPatterns)) {
    if (patterns.some(pattern => lowerMessage.includes(pattern))) {
      detectedIntents.push(intent);
    }
  }

  return {
    emotions: detectedEmotions,
    intents: detectedIntents,
    messageLength: message.length,
    isFirstInteraction: userContext.recentInteractions.length === 0,
    recentMood: getRecentMoodFromCheckIns(userContext.recentCheckIns)
  };
}

// Generate response that feels like a lifelong partner
async function generateLifelongPartnerResponse(message: string, analysis: any, userContext: any) {
  const { emotions, intents, isFirstInteraction } = analysis;
  
  // Base personality: Wise friend who knows you well
  let response = '';
  let tone = 'supportive';
  let actions = [];
  let insights = [];

  // Handle first interaction differently
  if (isFirstInteraction) {
    return {
      text: "I'm glad we're connecting. I'm here to grow alongside you - not just as a tool, but as someone who genuinely cares about your journey. What's been on your mind lately?",
      tone: 'welcoming',
      actions: ['share_current_focus'],
      insights: []
    };
  }

  // Emotional-first responses (like a good friend would)
  if (emotions.includes('frustrated')) {
    const frustrationResponses = [
      "I can feel that frustration. Sometimes the path forward isn't clear, but that doesn't mean it doesn't exist.",
      "That's a tough spot you're in. I've seen you navigate challenges before - what's different about this one?",
      "Frustration often means you care deeply about something. What matters most to you in this situation?"
    ];
    response = getRandomResponse(frustrationResponses);
    tone = 'empathetic';
    actions = ['break_down_problem', 'take_break', 'reframe_perspective'];
  }
  
  else if (emotions.includes('excited')) {
    const excitementResponses = [
      "I love seeing this energy from you! This excitement is fuel - how can we channel it?",
      "Your enthusiasm is contagious. What sparked this feeling?",
      "This is the you I know - full of possibility. Let's make the most of this momentum."
    ];
    response = getRandomResponse(excitementResponses);
    tone = 'energetic';
    actions = ['capture_momentum', 'set_stretch_goal', 'share_progress'];
  }

  else if (emotions.includes('overwhelmed')) {
    const overwhelmResponses = [
      "When everything feels like too much, sometimes we need to zoom out and remember what truly matters.",
      "I hear you. Let's find one small thing you can control right now.",
      "Overwhelm is information - it's telling us something about our boundaries or priorities."
    ];
    response = getRandomResponse(overwhelmResponses);
    tone = 'calming';
    actions = ['prioritize_tasks', 'simplify_focus', 'practice_breathing'];
  }

  // Intent-based responses if no strong emotion detected
  else if (intents.includes('seeking_motivation')) {
    response = generateMotivationalResponse(userContext);
    tone = 'inspiring';
    actions = ['review_why', 'visualize_success', 'take_next_step'];
  }

  else if (intents.includes('progress_sharing')) {
    response = generateProgressResponse(message, userContext);
    tone = 'celebratory';
    actions = ['celebrate_win', 'build_momentum', 'set_next_milestone'];
  }

  else if (intents.includes('problem_solving')) {
    response = generateProblemSolvingResponse(userContext);
    tone = 'thoughtful';
    actions = ['clarify_problem', 'explore_options', 'test_solution'];
  }

  else if (intents.includes('casual_chat')) {
    response = generateCasualResponse(userContext);
    tone = 'friendly';
    actions = ['share_update', 'check_goals', 'explore_feelings'];
  }

  // Default: Contextual response based on user history
  else {
    response = generateContextualResponse(message, userContext);
    tone = 'thoughtful';
    actions = ['reflect_together', 'explore_deeper', 'take_action'];
  }

  // Add personalized insights based on patterns
  insights = generatePersonalizedInsights(userContext, analysis);

  return { text: response, tone, actions, insights };
}

// Generate motivational response based on user's specific context
function generateMotivationalResponse(userContext: any) {
  const hasActiveGoals = userContext.activeGoals.length > 0;
  const hasRecentProgress = userContext.recentCheckIns.length > 0;
  
  if (hasActiveGoals && hasRecentProgress) {
    return "I've been watching your journey, and I see the consistency you're building. That's not luck - that's you choosing to show up. What feels challenging about staying motivated right now?";
  } else if (hasActiveGoals) {
    return "You've set some meaningful goals. Sometimes motivation isn't about feeling ready - it's about trusting the process even when we don't feel like it. What's one small step you could take today?";
  } else {
    return "Motivation often comes after action, not before. What's something you've been thinking about pursuing? We could explore what's holding you back.";
  }
}

// Generate progress celebration response
function generateProgressResponse(message: string, userContext: any) {
  const progressWords = ['completed', 'finished', 'achieved', 'accomplished', 'did'];
  const hasProgressWord = progressWords.some(word => message.toLowerCase().includes(word));
  
  if (hasProgressWord) {
    return "That's fantastic! I love hearing about your wins. Progress isn't always linear, but moments like these remind us that we're moving forward. How does it feel to have accomplished that?";
  } else {
    return "I can sense some positive energy in what you're sharing. These moments of progress, big or small, are worth acknowledging. What's working well for you right now?";
  }
}

// Generate problem-solving response
function generateProblemSolvingResponse(userContext: any) {
  const responses = [
    "Let's think through this together. Sometimes the solution isn't immediately obvious, but talking it through can help clarify things.",
    "I've noticed you have a good track record of figuring things out. What approaches have worked for you in similar situations?",
    "Problems often feel bigger in our minds than they are in reality. What if we broke this down into smaller pieces?"
  ];
  return getRandomResponse(responses);
}

// Generate casual conversation response
function generateCasualResponse(userContext: any) {
  const timeOfDay = new Date().getHours();
  const hasRecentActivity = userContext.recentCheckIns.length > 0 || userContext.recentInteractions.length > 2;
  
  if (timeOfDay < 12) {
    return hasRecentActivity 
      ? "Good morning! I've been thinking about our recent conversations. How are you feeling about the day ahead?"
      : "Morning! There's something nice about fresh starts, isn't there? What's on your mind today?";
  } else if (timeOfDay < 17) {
    return hasRecentActivity
      ? "How's your day unfolding? I'm curious how you're feeling about the progress you've been making."
      : "Afternoon! How's everything going in your world?";
  } else {
    return hasRecentActivity
      ? "Evening! It's nice to connect again. How did today treat you?"
      : "Evening! Perfect time for a check-in. What's been on your mind lately?";
  }
}

// Generate contextual response based on user history
function generateContextualResponse(message: string, userContext: any) {
  const hasGoals = userContext.activeGoals.length > 0;
  const hasStreaks = userContext.streaks.length > 0;
  
  if (hasGoals && hasStreaks) {
    return "I've been following your journey, and I see the patterns you're building. There's something powerful about consistency, even when progress feels slow. What's your sense of how things are going?";
  } else if (hasGoals) {
    return "I know you have some important goals you're working toward. Sometimes it helps to step back and see the bigger picture. What feels most important to focus on right now?";
  } else {
    return "I'm here to listen and think through whatever you're processing. What's been occupying your thoughts lately?";
  }
}

// Generate personalized insights based on user patterns
function generatePersonalizedInsights(userContext: any, analysis: any) {
  const insights = [];
  
  // Pattern-based insights
  if (userContext.recentCheckIns.length >= 3) {
    const moodTrend = analyzeMoodTrend(userContext.recentCheckIns);
    if (moodTrend === 'improving') {
      insights.push("I've noticed your mood trending upward lately - that's beautiful to see.");
    } else if (moodTrend === 'declining') {
      insights.push("I've been noticing some shifts in your energy. Want to talk about what might be contributing?");
    }
  }
  
  // Behavioral insights
  if (userContext.recentInteractions.length >= 5) {
    const interactionPattern = analyzeInteractionPattern(userContext.recentInteractions);
    if (interactionPattern === 'seeking_support') {
      insights.push("You've been reaching out more lately. I'm glad you're comfortable sharing what's on your mind.");
    }
  }
  
  return insights;
}

// Helper functions
function getRandomResponse(responses: string[]): string {
  return responses[Math.floor(Math.random() * responses.length)];
}

function calculateRelationshipDuration(interactions: any[]): number {
  if (!interactions || interactions.length === 0) return 0;
  const oldest = new Date(interactions[interactions.length - 1].timestamp);
  const now = new Date();
  return Math.floor((now.getTime() - oldest.getTime()) / (1000 * 60 * 60 * 24));
}

function getRecentMoodFromCheckIns(checkIns: any[]): string {
  if (!checkIns || checkIns.length === 0) return 'unknown';
  const latestCheckIn = checkIns[0];
  const moodScore = latestCheckIn.event_data?.mood_score || 3;
  
  if (moodScore >= 4) return 'positive';
  if (moodScore <= 2) return 'challenging';
  return 'neutral';
}

function analyzeMoodTrend(checkIns: any[]): string {
  if (checkIns.length < 3) return 'stable';
  
  const scores = checkIns.slice(0, 3).map(ci => ci.event_data?.mood_score || 3);
  const recent = scores[0];
  const older = scores[2];
  
  if (recent > older + 0.5) return 'improving';
  if (recent < older - 0.5) return 'declining';
  return 'stable';
}

function analyzeInteractionPattern(interactions: any[]): string {
  const recentMessages = interactions.slice(0, 5);
  const seekingHelpCount = recentMessages.filter(i => 
    i.event_data?.message?.toLowerCase().includes('help') ||
    i.event_data?.message?.toLowerCase().includes('stuck') ||
    i.event_data?.message?.toLowerCase().includes('don\'t know')
  ).length;
  
  return seekingHelpCount >= 3 ? 'seeking_support' : 'regular';
}

// Store interaction for learning and personalization
async function storeInteraction(userId: string, message: string, response: any, analysis: any) {
  try {
    await supabase.from('user_events').insert({
      user_id: userId,
      event_type: 'ai_interaction',
      event_data: {
        user_message: message,
        ai_response: response.text,
        detected_emotions: analysis.emotions,
        detected_intents: analysis.intents,
        response_tone: response.tone,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error storing interaction:', error);
  }
}

// Fallback response for errors
function getFallbackResponse(): string {
  const fallbacks = [
    "I'm having a moment of technical difficulty, but I'm still here with you. What's on your mind?",
    "Sorry, I got a bit scrambled there. Let's try again - what were you thinking about?",
    "Technical hiccup on my end, but our conversation matters more than perfect systems. What's going on?"
  ];
  return getRandomResponse(fallbacks);
} 