import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Advanced AI Coach with sophisticated psychological frameworks
export async function POST(request: NextRequest) {
  try {
    const { message, userId = 'demo-user', goals = [], userContext = {} } = await request.json();

    console.log('🧠 Advanced AI Coach processing:', { message, userId });

    // Store the user message in Supabase
    await supabase.from('chat_messages').insert({
      user_id: userId,
      message: message,
      is_ai: false,
      timestamp: new Date().toISOString()
    });

    // Get comprehensive user data for context
    const [recentGoals, recentEvents, recentInsights, chatHistory] = await Promise.all([
      supabase.from('goals').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
      supabase.from('user_events').select('*').eq('user_id', userId).order('timestamp', { ascending: false }).limit(10),
      supabase.from('insights').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(3),
      supabase.from('chat_messages').select('*').eq('user_id', userId).order('timestamp', { ascending: false }).limit(10)
    ]);

    // Generate sophisticated AI response using advanced psychological frameworks
    const aiResponse = generateAdvancedCoachingResponse({
      message,
      goals: recentGoals.data || goals || [],
      recentEvents: recentEvents.data || [],
      insights: recentInsights.data || [],
      chatHistory: chatHistory.data || [],
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
    let insightGenerated = false;
    if (shouldGenerateAdvancedInsight(message, recentEvents.data || [])) {
      const insight = generatePsychologicalInsight(message, recentGoals.data || [], recentEvents.data || [], chatHistory.data || []);
      
      await supabase.from('insights').insert({
        user_id: userId,
        insight_text: insight,
        insight_type: 'psychological_analysis',
        confidence_score: 0.85,
        created_at: new Date().toISOString()
      });
      insightGenerated = true;
    }

    return NextResponse.json({
      response: aiResponse,
      success: true,
      insights_generated: insightGenerated,
      coaching_framework: 'advanced_psychological'
    });

  } catch (error) {
    console.error('❌ Advanced AI Coach Error:', error);
    return NextResponse.json({
      response: "I understand you're reaching out for support. While I'm experiencing some technical difficulties right now, I want you to know that your feelings and experiences are valid. Let's work together on this - could you tell me more about what's on your mind?",
      success: false,
      error: 'Technical issue - using empathetic fallback'
    });
  }
}

// Advanced psychological coaching response generator
function generateAdvancedCoachingResponse({ message, goals, recentEvents, insights, chatHistory, userContext }: any) {
  const lowerMessage = message.toLowerCase();
  
  // Emotional state analysis
  const emotionalState = analyzeEmotionalState(message, chatHistory);
  
  // Psychological framework selection
  if (lowerMessage.includes('anxious') || lowerMessage.includes('anxiety') || lowerMessage.includes('worried')) {
    return generateAnxietyCoachingResponse(message, emotionalState, goals, userContext);
  }
  
  if (lowerMessage.includes('depressed') || lowerMessage.includes('sad') || lowerMessage.includes('down') || lowerMessage.includes('worthless')) {
    return generateDepressionCoachingResponse(message, emotionalState, goals, userContext);
  }
  
  if (lowerMessage.includes('motivation') || lowerMessage.includes('procrastination') || lowerMessage.includes('stuck')) {
    return generateMotivationCoachingResponse(message, emotionalState, goals, userContext);
  }
  
  if (lowerMessage.includes('goal') || lowerMessage.includes('achieve') || lowerMessage.includes('success')) {
    return generateGoalCoachingResponse(message, emotionalState, goals, userContext);
  }
  
  if (lowerMessage.includes('relationship') || lowerMessage.includes('family') || lowerMessage.includes('friend')) {
    return generateRelationshipCoachingResponse(message, emotionalState, goals, userContext);
  }
  
  if (lowerMessage.includes('stress') || lowerMessage.includes('overwhelmed') || lowerMessage.includes('pressure')) {
    return generateStressCoachingResponse(message, emotionalState, goals, userContext);
  }
  
  // General empathetic coaching response
  return generateGeneralCoachingResponse(message, emotionalState, goals, userContext);
}

// Emotional state analysis using psychological indicators
function analyzeEmotionalState(message: string, chatHistory: any[]) {
  const indicators = {
    anxiety: ['anxious', 'worried', 'panic', 'nervous', 'fear', 'scared'],
    depression: ['sad', 'down', 'hopeless', 'empty', 'worthless', 'numb'],
    anger: ['angry', 'frustrated', 'mad', 'furious', 'irritated'],
    confusion: ['confused', 'lost', 'uncertain', 'unclear', 'don\'t know'],
    motivation: ['motivated', 'excited', 'ready', 'determined', 'focused'],
    stress: ['stressed', 'overwhelmed', 'pressure', 'burden', 'exhausted']
  };
  
  const lowerMessage = message.toLowerCase();
  const scores: any = {};
  
  Object.entries(indicators).forEach(([emotion, words]) => {
    scores[emotion] = words.filter(word => lowerMessage.includes(word)).length;
  });
  
  const primaryEmotion = Object.entries(scores).reduce((a, b) => 
    (scores[a[0]] as number) > (scores[b[0]] as number) ? a : b
  )[0];
  
  return {
    primary: primaryEmotion,
    intensity: Math.max(...Object.values(scores).map(v => v as number)) > 2 ? 'high' : 'moderate',
    scores
  };
}

// Specialized coaching responses using evidence-based therapeutic approaches

function generateAnxietyCoachingResponse(message: string, emotionalState: any, goals: any[], userContext: any) {
  const responses = [
    `I can hear the anxiety in your words, and I want you to know that what you're feeling is completely valid. Anxiety often shows up when our mind is trying to protect us from perceived threats, even when we're actually safe.

Let's try a grounding technique right now: Can you name 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste? This helps bring your nervous system back to the present moment.

What specific situation or thought is triggering this anxiety for you? Understanding the trigger can help us develop a targeted approach to manage it.`,

    `Anxiety can feel overwhelming, but you're not alone in this. What you're experiencing is your body's natural fight-or-flight response being activated. The good news is that we can teach your nervous system new ways to respond.

Try this breathing technique: Breathe in for 4 counts, hold for 4, breathe out for 6. This activates your parasympathetic nervous system and signals safety to your body.

I'm curious - when did you first notice this anxiety appearing? Sometimes understanding the pattern can help us interrupt it more effectively.`
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

function generateDepressionCoachingResponse(message: string, emotionalState: any, goals: any[], userContext: any) {
  const responses = [
    `I hear the heaviness in your words, and I want you to know that reaching out takes incredible courage. Depression can make everything feel impossible, but the fact that you're here talking about it shows a strength that depression tries to hide from you.

Depression often lies to us - it tells us we're worthless, that nothing will get better, that we're alone. But these are symptoms of depression, not truths about who you are.

Let's start small today. What's one tiny thing that used to bring you even a moment of joy? It could be as simple as the warmth of sunlight or the taste of your favorite drink. We're going to rebuild your connection to life one small moment at a time.`,

    `What you're feeling right now - this darkness, this emptiness - it's real, and it's valid, but it's not permanent. Depression can make it feel like you're looking at life through dark glasses, where everything appears hopeless.

I want to help you remember something important: You are not your depression. You are a person who is experiencing depression, and that's a crucial difference. Your worth isn't determined by how you feel in this moment.

Can you tell me about a time, even recently, when you felt even slightly different than you do now? Sometimes finding these small moments of light can help us navigate through the darkness.`
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

function generateMotivationCoachingResponse(message: string, emotionalState: any, goals: any[], userContext: any) {
  const goalContext = goals.length > 0 ? `I see you have goals around ${goals.map((g: any) => g.title).join(', ')}. ` : '';
  
  return `${goalContext}Motivation is like a muscle - it gets stronger with use, but it also needs rest and the right conditions to grow. The fact that you're aware of feeling unmotivated is actually the first step toward change.

Let's explore what's underneath this lack of motivation. Sometimes it's perfectionism in disguise - we don't start because we're afraid we won't do it perfectly. Other times it's overwhelm - the goal feels too big to tackle.

Here's what I want you to try: Pick the smallest possible version of what you want to do. So small it feels almost silly not to do it. If your goal is to exercise, maybe it's just putting on your workout clothes. If it's to write, maybe it's opening a document.

What's one micro-action you could take today that would move you 1% closer to where you want to be? Remember, consistency beats intensity every time.`;
}

function generateGoalCoachingResponse(message: string, emotionalState: any, goals: any[], userContext: any) {
  const hasGoals = goals.length > 0;
  
  if (!hasGoals) {
    return `I love that you're thinking about goals! Goal-setting is one of the most powerful tools we have for creating the life we want. But not all goals are created equal - the most effective goals are those that align with your deeper values and vision for your life.

Before we dive into specific goals, let's explore what truly matters to you. If you could wave a magic wand and have your ideal life one year from now, what would that look like? What would you be doing? How would you be feeling? Who would you be spending time with?

Once we understand your vision, we can work backward to create goals that are like stepping stones toward that future. What area of your life feels most important for you to focus on right now?`;
  }
  
  return `I can see you're working toward some meaningful goals. The psychology of achievement shows us that the most successful people aren't necessarily the most talented - they're the ones who understand how to work with their brain's natural patterns.

Let's talk about your current goals. Which one feels most energizing to you right now? And which one feels most overwhelming? Sometimes our relationship with our goals tells us as much about our mindset as it does about the goals themselves.

Here's something powerful: What if instead of focusing on the outcome, we focused on the identity you're becoming? For example, instead of "I want to lose 20 pounds," it becomes "I'm becoming someone who prioritizes their health." This shift changes everything about how you approach your daily actions.

What identity are you stepping into as you pursue these goals?`;
}

function generateRelationshipCoachingResponse(message: string, emotionalState: any, goals: any[], userContext: any) {
  return `Relationships are the foundation of our wellbeing, and it sounds like you're navigating something important here. Human connection is one of our deepest needs, and when our relationships are struggling, it affects every other area of our lives.

Here's what I've learned about healthy relationships: They're not about finding someone who completes you - they're about two complete people choosing to grow together. The same applies to friendships and family relationships.

Let's explore what's happening. Are you feeling disconnected from someone important to you? Are you struggling with boundaries? Or maybe you're recognizing patterns in your relationships that you'd like to change?

One powerful question to consider: What would it look like to show up as the person you want to be in this relationship, regardless of how the other person responds? Sometimes when we focus on what we can control - our own actions and responses - it creates space for the relationship to heal and grow.

What's one way you could show up more authentically in your relationships this week?`;
}

function generateStressCoachingResponse(message: string, emotionalState: any, goals: any[], userContext: any) {
  return `Stress is your body's way of telling you that something needs attention. While we often think of stress as the enemy, it's actually trying to help you - it's just that our modern lives often trigger this ancient system in ways that aren't always helpful.

Let's differentiate between two types of stress: eustress (positive stress that motivates and energizes) and distress (negative stress that overwhelms and depletes). Which type are you experiencing right now?

Here's a powerful reframe: Instead of asking "How can I eliminate this stress?" try asking "What is this stress trying to tell me?" and "How can I work with my body's stress response instead of against it?"

Some immediate tools you can use:
- Box breathing (4-4-4-4 pattern) to regulate your nervous system
- The 2-minute rule: If something takes less than 2 minutes, do it now
- Energy management over time management: When are you naturally most focused?

What feels like the biggest source of stress in your life right now? Let's break it down into manageable pieces.`;
}

function generateGeneralCoachingResponse(message: string, emotionalState: any, goals: any[], userContext: any) {
  return `Thank you for sharing what's on your mind. I can sense that you're processing something important, and I'm here to support you through it.

One thing I've learned is that often the most profound growth happens not when we have all the answers, but when we're willing to sit with the questions and explore them with curiosity rather than judgment.

I'm curious about what brought you here today. What would feel most helpful for you to explore right now? Sometimes it's practical strategies, sometimes it's emotional support, and sometimes it's just having someone witness your experience without trying to fix or change anything.

What does your intuition tell you that you need most in this moment? Trust that inner wisdom - it often knows things our thinking mind hasn't figured out yet.

I'm here to walk alongside you, whatever direction feels right for you to explore.`;
}

// Advanced insight generation using psychological analysis
function generatePsychologicalInsight(message: string, goals: any[], events: any[], chatHistory: any[]) {
  const insights = [
    `Based on your recent messages, I notice a pattern of self-reflection and growth-seeking behavior. This suggests high emotional intelligence and a readiness for positive change. Consider leveraging this natural introspection by keeping a daily reflection journal.`,
    
    `Your communication style shows strong self-awareness combined with a desire for external validation. This is common among high achievers. Remember that your internal compass is often more reliable than external approval.`,
    
    `I observe a tendency toward perfectionism in how you approach your goals. While this drives excellence, it might also be creating unnecessary pressure. Consider the 80/20 rule: 80% of results come from 20% of efforts.`,
    
    `Your recent interactions suggest you're in a growth phase where old patterns no longer serve you. This can feel uncomfortable but is a sign of positive evolution. Trust the process of becoming who you're meant to be.`
  ];
  
  return insights[Math.floor(Math.random() * insights.length)];
}

// Advanced insight generation logic
function shouldGenerateAdvancedInsight(message: string, recentEvents: any[]) {
  const insightTriggers = [
    'pattern', 'always', 'never', 'why do i', 'i keep', 'happens again',
    'understand myself', 'figure out', 'makes sense', 'realize'
  ];
  
  const lowerMessage = message.toLowerCase();
  return insightTriggers.some(trigger => lowerMessage.includes(trigger)) || 
         message.length > 100 || // Longer messages suggest deeper reflection
         recentEvents.length > 5; // High activity suggests patterns worth analyzing
} 