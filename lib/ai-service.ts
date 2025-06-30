import { supabase } from './supabase';

// AI Service Configuration
const AI_CONFIG = {
  provider: process.env.EXPO_PUBLIC_AI_PROVIDER || 'openai', // 'openai', 'groq', or 'demo'
  openaiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
  groqKey: process.env.EXPO_PUBLIC_GROQ_API_KEY,
  baseURL: {
    openai: 'https://api.openai.com/v1/chat/completions',
    groq: 'https://api.groq.com/openai/v1/chat/completions',
  }
};

interface UserContext {
  goals: any[];
  recentCheckins: any[];
  mood: string;
  energy: number;
  streakDays: number;
  totalXP: number;
  currentChallenges: string[];
}

interface CoachPersona {
  id: string;
  name: string;
  systemPrompt: string;
  tone: string;
}

export class AIService {
  
  async generateResponse(
    userMessage: string, 
    userContext: UserContext, 
    coachPersona: CoachPersona
  ): Promise<string> {
    
    // If no API keys are available, use enhanced demo responses
    if (!AI_CONFIG.openaiKey && !AI_CONFIG.groqKey) {
      return this.getEnhancedDemoResponse(userMessage, userContext, coachPersona);
    }

    try {
      // Build comprehensive system prompt with user context
      const systemPrompt = this.buildSystemPrompt(coachPersona, userContext);
      
      // Get AI response
      const response = await this.callAIAPI(systemPrompt, userMessage);
      
      // Store conversation for learning
      await this.storeConversation(userMessage, response, coachPersona.id);
      
      return response;
      
    } catch (error) {
      console.error('AI Service Error:', error);
      // Fallback to enhanced demo
      return this.getEnhancedDemoResponse(userMessage, userContext, coachPersona);
    }
  }

  private buildSystemPrompt(coach: CoachPersona, context: UserContext): string {
    const contextStr = `
USER CONTEXT:
- Active Goals: ${context.goals.map(g => `${g.title} (${g.progress}% complete)`).join(', ')}
- Current Mood: ${context.mood || 'neutral'}
- Energy Level: ${context.energy || 'moderate'}/10
- Streak: ${context.streakDays} days
- Total XP: ${context.totalXP}
- Recent Challenges: ${context.currentChallenges.join(', ')}
- Recent Check-ins: ${context.recentCheckins.slice(0, 3).map(c => c.summary).join('; ')}

COACH PERSONALITY: ${coach.systemPrompt}

INSTRUCTIONS:
- Be specific and actionable based on their actual progress
- Reference their goals and current situation
- Maintain your coaching personality (${coach.tone})
- Keep responses under 150 words
- Be encouraging but honest about areas for improvement
- Suggest concrete next steps when relevant
`;

    return contextStr;
  }

  private async callAIAPI(systemPrompt: string, userMessage: string): Promise<string> {
    const provider = AI_CONFIG.provider;
    const apiKey = provider === 'openai' ? AI_CONFIG.openaiKey : AI_CONFIG.groqKey;
    const url = AI_CONFIG.baseURL[provider as keyof typeof AI_CONFIG.baseURL];

    const requestBody = {
      model: provider === 'openai' ? 'gpt-4' : 'llama3-8b-8192',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 200,
      temperature: 0.7,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`AI API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private async storeConversation(
    userMessage: string, 
    aiResponse: string, 
    coachId: string
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('ai_conversations').insert([
        {
          user_id: user.id,
          coach_id: coachId,
          user_message: userMessage,
          ai_response: aiResponse,
          timestamp: new Date().toISOString(),
        }
      ]);
    } catch (error) {
      console.error('Error storing conversation:', error);
    }
  }

  private getEnhancedDemoResponse(
    userMessage: string, 
    context: UserContext, 
    coach: CoachPersona
  ): string {
    const responses = {
      supportive: [
        `I can see you have ${context.goals.length} goals you're working on. That takes real courage! ${context.streakDays > 0 ? `Your ${context.streakDays}-day streak shows you're already building momentum. ` : ''}What feels most challenging right now?`,
        `${context.mood === 'stressed' ? 'I notice you mentioned feeling stressed. ' : ''}Remember, progress isn't always linear. ${context.totalXP > 100 ? `You've already earned ${context.totalXP} XP - that's real progress! ` : ''}Which goal would feel good to focus on today?`,
        `You're showing up consistently, and that matters. ${context.goals.filter(g => g.progress > 50).length > 0 ? 'I see some of your goals are really progressing well! ' : ''}What support do you need right now?`
      ],
      motivational: [
        `${context.streakDays > 0 ? `${context.streakDays} days strong! ` : ''}Let's turn that momentum into unstoppable progress! 💪 Which of your ${context.goals.length} goals are you ready to crush today?`,
        `Champions make progress even on tough days! ${context.totalXP > 200 ? `Your ${context.totalXP} XP proves you've got what it takes! ` : ''}What's one action you can take RIGHT NOW?`,
        `No excuses, just results! 🔥 ${context.goals.filter(g => g.progress < 25).length > 0 ? 'I see some goals that need your fire. ' : ''}Time to level up - what\'s your next move?`
      ],
      analytical: [
        `Looking at your data: ${context.goals.length} active goals, ${context.streakDays} day streak, ${context.totalXP} total XP. ${context.goals.filter(g => g.progress > 75).length > 0 ? 'High completion rate on some goals suggests good systems. ' : ''}Where do you see the biggest optimization opportunity?`,
        `Pattern analysis: ${context.mood === 'energetic' ? 'High energy correlates with better goal progress. ' : ''}${context.recentCheckins.length > 3 ? 'Consistent check-ins indicate strong habit formation. ' : ''}What metrics matter most to you?`,
        `Progress breakdown: ${Math.round(context.goals.reduce((sum, g) => sum + g.progress, 0) / context.goals.length)}% average completion. ${context.energy > 7 ? 'Energy levels optimal for tackling harder challenges. ' : ''}Which goal needs strategic focus?`
      ],
      mindful: [
        `Take a breath with me... 🧘 ${context.streakDays > 0 ? `Notice how your ${context.streakDays}-day journey has unfolded. ` : ''}What wisdom is your inner self sharing about your ${context.goals.length} goals?`,
        `${context.mood === 'anxious' ? 'I sense some anxiety around your progress. That\'s completely natural. ' : ''}Your goals are merely waypoints on a deeper journey. What truly matters to you today?`,
        `Presence over pressure... ${context.totalXP > 150 ? `Your ${context.totalXP} XP reflects dedication, but numbers don't capture your growth. ` : ''}What would self-compassion tell you right now?`
      ],
      practical: [
        `Current status: ${context.goals.length} goals, ${context.streakDays} day streak. ${context.goals.filter(g => g.progress < 50).length > 0 ? 'Some goals need acceleration. ' : ''}What's the most efficient next step? 🎯`,
        `Time audit: ${context.recentCheckins.length > 2 ? 'Check-in habit established. ' : 'Check-in consistency needs work. '}${context.energy < 5 ? 'Low energy suggests need for energy management strategy. ' : ''}Priority action?`,
        `Resource optimization: ${context.streakDays > 7 ? 'Momentum established, scale up. ' : 'Build consistency first. '}${context.goals.filter(g => g.progress > 80).length > 0 ? 'Some goals near completion - finish them. ' : ''}What delivers maximum impact?`
      ]
    };

    const coachResponses = responses[coach.id as keyof typeof responses] || responses.supportive;
    return coachResponses[Math.floor(Math.random() * coachResponses.length)];
  }

  async getUserContext(): Promise<UserContext> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Fetch user data in parallel
      const [goalsResult, checkinsResult, statsResult] = await Promise.all([
        supabase.from('goals').select('*').eq('user_id', user.id).limit(10),
        supabase.from('daily_checkins').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(7),
        supabase.from('user_stats').select('*').eq('user_id', user.id).single(),
      ]);

      const goals = goalsResult.data || [];
      const recentCheckins = checkinsResult.data || [];
      const stats = statsResult.data;

      // Get latest mood and energy from recent check-ins
      const latestCheckin = recentCheckins[0];
      
      return {
        goals,
        recentCheckins,
        mood: latestCheckin?.mood || 'neutral',
        energy: latestCheckin?.energy || 5,
        streakDays: stats?.current_streak || 0,
        totalXP: stats?.total_xp || 0,
        currentChallenges: goals.filter(g => g.progress < 50).map(g => g.title),
      };
      
    } catch (error) {
      console.error('Error getting user context:', error);
      // Return demo context
      return {
        goals: [{ title: 'Sample Goal', progress: 50 }],
        recentCheckins: [],
        mood: 'neutral',
        energy: 5,
        streakDays: 0,
        totalXP: 0,
        currentChallenges: [],
      };
    }
  }
}

export const aiService = new AIService(); 