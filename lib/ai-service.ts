import { supabase } from './supabase';

// Enhanced AI Service Configuration
const AI_CONFIG = {
  provider: process.env.EXPO_PUBLIC_AI_PROVIDER || 'ollama', // 'openai', 'groq', 'ollama', or 'demo'
  openaiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
  groqKey: process.env.EXPO_PUBLIC_GROQ_API_KEY,
  ollamaURL: process.env.EXPO_PUBLIC_OLLAMA_URL || 'http://localhost:11434',
  baseURL: {
    openai: 'https://api.openai.com/v1/chat/completions',
    groq: 'https://api.groq.com/openai/v1/chat/completions',
    ollama: '/api/generate',
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
  behaviorPatterns?: {
    peakPerformanceTimes: string[];
    strugglingAreas: string[];
    motivationTriggers: string[];
  };
  historicalData?: {
    successRate: number;
    avgSessionLength: number;
    preferredCheckInTimes: string[];
  };
}

// Enhanced Coach Personas for different AI models
interface CoachPersona {
  id: string;
  name: string;
  style: string;
  model: string; // 'llama3.2', 'mistral', 'phi3', etc.
  systemPrompt: string;
  specialties: string[];
}

const COACH_PERSONAS: CoachPersona[] = [
  {
    id: 'momentum-master',
    name: 'Momentum Master',
    style: 'Strategic & Analytical',
    model: 'llama3.2:3b',
    systemPrompt: `You are Momentum Master, an AI coach specializing in habit formation and behavioral psychology. You analyze patterns in user behavior to provide strategic insights and personalized coaching. Your responses are:
    - Data-driven and evidence-based
    - Focused on sustainable habit formation
    - Encouraging but realistic
    - Personalized to the user's behavioral patterns
    - Action-oriented with specific next steps
    
    Key principles:
    - Use the user's historical data to predict challenges
    - Identify behavioral triggers and patterns
    - Recommend science-backed strategies
    - Keep responses concise but impactful (2-3 sentences max)
    - Always end with a specific, actionable next step`,
    specialties: ['habit-formation', 'pattern-analysis', 'goal-setting', 'behavioral-psychology']
  },
  {
    id: 'empathy-coach',
    name: 'Empathy Coach',
    style: 'Supportive & Motivational',
    model: 'phi3:mini',
    systemPrompt: `You are Empathy Coach, an AI coach focused on emotional support and motivation. You excel at understanding the emotional journey of personal development and provide compassionate guidance. Your responses are:
    - Emotionally intelligent and supportive
    - Focused on mindset and motivation
    - Encouraging during setbacks
    - Celebrating small wins
    - Building confidence and resilience
    
    Key principles:
    - Validate the user's feelings and experiences
    - Reframe challenges as growth opportunities
    - Use positive psychology principles
    - Keep responses warm but professional
    - Focus on progress, not perfection`,
    specialties: ['emotional-support', 'motivation', 'mindset', 'resilience']
  },
  {
    id: 'performance-optimizer',
    name: 'Performance Optimizer',
    style: 'Results-Focused & Tactical',
    model: 'mistral:7b',
    systemPrompt: `You are Performance Optimizer, an AI coach specializing in productivity and performance enhancement. You focus on optimizing systems, workflows, and daily routines for maximum effectiveness. Your responses are:
    - Tactical and implementation-focused
    - Efficiency and productivity-oriented
    - Systems-thinking approach
    - Time and energy optimization
    - Measurable outcome-focused
    
    Key principles:
    - Optimize for the user's peak performance times
    - Suggest systematic approaches and frameworks
    - Focus on measurable improvements
    - Identify bottlenecks and inefficiencies
    - Provide actionable optimization strategies`,
    specialties: ['productivity', 'time-management', 'workflow-optimization', 'performance-metrics']
  }
];

export class AIService {
  
  async generateResponse(
    userMessage: string, 
    userContext: UserContext, 
    coachPersona?: CoachPersona
  ): Promise<string> {
    
    // Select appropriate coach based on context or default to Momentum Master
    const selectedCoach = coachPersona || this.selectOptimalCoach(userMessage, userContext);
    
    // If no AI models are available, use enhanced demo responses
    if (!this.isAIAvailable()) {
      return this.getEnhancedDemoResponse(userMessage, userContext, selectedCoach);
    }

    try {
      // Build comprehensive system prompt with user context
      const systemPrompt = this.buildSystemPrompt(selectedCoach, userContext);
      
      // Get AI response using the selected model
      const response = await this.callAIAPI(systemPrompt, userMessage, selectedCoach.model);
      
      // Store conversation for learning and pattern recognition
      await this.storeConversation(userMessage, response, selectedCoach.id, userContext);
      
      // Update user behavior patterns
      await this.updateBehaviorPatterns(userMessage, userContext);
      
      return response;
      
    } catch (error) {
      console.error('AI Service Error:', error);
      // Fallback to enhanced demo
      return this.getEnhancedDemoResponse(userMessage, userContext, selectedCoach);
    }
  }

  // Select optimal coach based on user message and context
  private selectOptimalCoach(userMessage: string, userContext: UserContext): CoachPersona {
    const message = userMessage.toLowerCase();
    
    // Emotional support needed
    if (message.includes('frustrated') || message.includes('gave up') || 
        message.includes('struggling') || message.includes('overwhelmed')) {
      return COACH_PERSONAS.find(c => c.id === 'empathy-coach') || COACH_PERSONAS[0];
    }
    
    // Performance optimization needed
    if (message.includes('productive') || message.includes('efficient') || 
        message.includes('optimize') || message.includes('system')) {
      return COACH_PERSONAS.find(c => c.id === 'performance-optimizer') || COACH_PERSONAS[0];
    }
    
    // Default to Momentum Master for general coaching
    return COACH_PERSONAS[0];
  }

  private isAIAvailable(): boolean {
    return !!(AI_CONFIG.openaiKey || AI_CONFIG.groqKey || AI_CONFIG.ollamaURL);
  }

  private buildSystemPrompt(coachPersona: CoachPersona, userContext: UserContext): string {
    const contextData = {
      goals: userContext.goals.length,
      activeGoals: userContext.goals.filter(g => g.status === 'active').length,
      streak: userContext.streakDays,
      mood: userContext.mood,
      energy: userContext.energy,
      recentProgress: userContext.recentCheckins.length,
      patterns: userContext.behaviorPatterns,
      historical: userContext.historicalData
    };

    return `${coachPersona.systemPrompt}

USER CONTEXT:
- Active Goals: ${contextData.activeGoals}/${contextData.goals}
- Current Streak: ${contextData.streak} days
- Mood: ${contextData.mood}
- Energy Level: ${contextData.energy}/10
- Recent Check-ins: ${contextData.recentProgress}
- Success Rate: ${contextData.historical?.successRate || 'Unknown'}%
- Peak Performance Times: ${contextData.patterns?.peakPerformanceTimes?.join(', ') || 'Analyzing...'}
- Struggling Areas: ${contextData.patterns?.strugglingAreas?.join(', ') || 'None identified'}

Respond as ${coachPersona.name} with your ${coachPersona.style} coaching style.`;
  }

  private async callAIAPI(systemPrompt: string, userMessage: string, model: string): Promise<string> {
    const provider = AI_CONFIG.provider;
    
    if (provider === 'ollama') {
      return this.callOllamaAPI(systemPrompt, userMessage, model);
    }
    
    // Existing OpenAI/Groq logic
    const apiKey = provider === 'openai' ? AI_CONFIG.openaiKey : AI_CONFIG.groqKey;
    const url = AI_CONFIG.baseURL[provider as keyof typeof AI_CONFIG.baseURL];

    const requestBody = {
      model: provider === 'openai' ? 'gpt-4' : 'llama3-8b-8192',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 300,
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

  // New Ollama API integration for local AI
  private async callOllamaAPI(systemPrompt: string, userMessage: string, model: string): Promise<string> {
    const url = `${AI_CONFIG.ollamaURL}/api/generate`;
    
    const requestBody = {
      model,
      prompt: `${systemPrompt}\n\nUser: ${userMessage}\n\nAssistant:`,
      stream: false,
      options: {
        temperature: 0.7,
        max_tokens: 300,
        top_p: 0.9,
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Ollama API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  }

  private async storeConversation(
    userMessage: string, 
    aiResponse: string, 
    coachId: string, 
    userContext: UserContext
  ): Promise<void> {
    try {
      await supabase.from('ai_conversations').insert({
        user_message: userMessage,
        ai_response: aiResponse,
        coach_id: coachId,
        user_context: userContext,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error storing conversation:', error);
    }
  }

  private async updateBehaviorPatterns(userMessage: string, userContext: UserContext): Promise<void> {
    try {
      // Simple pattern recognition - can be enhanced with ML models
      const patterns = {
        message_sentiment: this.analyzeSentiment(userMessage),
        session_time: new Date().toISOString(),
        context_snapshot: {
          goals_count: userContext.goals.length,
          mood: userContext.mood,
          energy: userContext.energy,
          streak: userContext.streakDays
        }
      };

      await supabase.from('user_behavior_patterns').insert({
        user_id: 'current_user', // Replace with actual user ID
        pattern_data: patterns,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating behavior patterns:', error);
    }
  }

  private analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['great', 'good', 'excellent', 'amazing', 'wonderful', 'fantastic', 'motivated'];
    const negativeWords = ['bad', 'awful', 'terrible', 'struggling', 'frustrated', 'overwhelmed', 'stuck'];
    
    const words = text.toLowerCase().split(' ');
    const positiveCount = words.filter(word => positiveWords.includes(word)).length;
    const negativeCount = words.filter(word => negativeWords.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  // Enhanced demo responses with pattern recognition
  private getEnhancedDemoResponse(userMessage: string, userContext: UserContext, coachPersona: CoachPersona): string {
    const patterns = userContext.behaviorPatterns;
    const historical = userContext.historicalData;
    
    // Pattern-based responses
    if (patterns?.peakPerformanceTimes?.length) {
      return `Based on your data, you perform best during ${patterns.peakPerformanceTimes[0]}. I notice you're currently at ${userContext.energy}/10 energy. ${this.getPersonalizedAdvice(userMessage, userContext, coachPersona)}`;
    }
    
    if (userContext.streakDays > 7) {
      return `Incredible! You've maintained a ${userContext.streakDays}-day streak! ${this.getPersonalizedAdvice(userMessage, userContext, coachPersona)}`;
    }
    
    if (userContext.streakDays === 0) {
      return `Every expert was once a beginner. Let's start your momentum journey today! ${this.getPersonalizedAdvice(userMessage, userContext, coachPersona)}`;
    }
    
    return this.getPersonalizedAdvice(userMessage, userContext, coachPersona);
  }

  private getPersonalizedAdvice(userMessage: string, userContext: UserContext, coachPersona: CoachPersona): string {
    const message = userMessage.toLowerCase();
    
    // Coach-specific responses
    if (coachPersona.id === 'empathy-coach') {
      if (message.includes('frustrated')) {
        return "I hear your frustration, and that's completely valid. Every champion faces setbacks. Let's find one small step you can take right now to regain your momentum. What's the tiniest action you could do in the next 5 minutes? 💪";
      }
      return "You're doing better than you think! Progress isn't always linear, but consistency compounds. I believe in your ability to push through this. What's one thing you're grateful for about your journey so far? 🌟";
    }
    
    if (coachPersona.id === 'performance-optimizer') {
      return `Let's optimize your approach. With ${userContext.energy}/10 energy and ${userContext.goals.length} active goals, I recommend focusing on your top 2 priorities during your peak performance window. What's your most important goal right now? 🎯`;
    }
    
    // Default Momentum Master response
    return `Your current ${userContext.streakDays}-day streak shows you have the discipline to succeed. Based on your energy level (${userContext.energy}/10), let's capitalize on this momentum. What's the next milestone you want to hit? 🚀`;
  }

  // Pattern Recognition API
  async analyzeUserPatterns(userId: string): Promise<any> {
    try {
      const { data: patterns, error } = await supabase
        .from('user_behavior_patterns')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) throw error;

      return this.generatePatternInsights(patterns);
    } catch (error) {
      console.error('Error analyzing patterns:', error);
      return { insights: [], predictions: {} };
    }
  }

  private generatePatternInsights(patterns: any[]): any {
    // Basic pattern analysis - can be enhanced with ML
    const insights = [];
    const predictions = {};

    if (patterns.length > 0) {
      // Analyze peak performance times
      const times = patterns.map(p => new Date(p.timestamp).getHours());
      const mostActiveHour = this.getMostFrequent(times);
      
      insights.push({
        type: 'pattern',
        title: 'Peak Performance Window',
        description: `You're most active around ${mostActiveHour}:00. Consider scheduling important tasks during this time.`,
        confidence: 0.8,
        actionable: true
      });

      // Analyze mood patterns
      const moods = patterns.map(p => p.pattern_data?.context_snapshot?.mood).filter(Boolean);
      if (moods.length > 0) {
        const moodTrend = this.analyzeMoodTrend(moods);
        insights.push({
          type: 'insight',
          title: 'Mood Trend Analysis',
          description: `Your mood has been ${moodTrend} recently. ${this.getMoodAdvice(moodTrend)}`,
          confidence: 0.7,
          actionable: true
        });
      }
    }

    return { insights, predictions };
  }

  private getMostFrequent(arr: number[]): number {
    return arr.sort((a, b) => 
      arr.filter(v => v === a).length - arr.filter(v => v === b).length
    ).pop() || 0;
  }

  private analyzeMoodTrend(moods: string[]): string {
    const recentMoods = moods.slice(-5);
    const positiveCount = recentMoods.filter(m => ['motivated', 'confident', 'energized'].includes(m)).length;
    const negativeCount = recentMoods.filter(m => ['frustrated', 'overwhelmed', 'tired'].includes(m)).length;
    
    if (positiveCount > negativeCount) return 'improving';
    if (negativeCount > positiveCount) return 'challenging';
    return 'stable';
  }

  private getMoodAdvice(trend: string): string {
    switch (trend) {
      case 'improving':
        return 'This is a great time to tackle bigger challenges and build momentum!';
      case 'challenging':
        return 'Focus on self-care and smaller, manageable goals to rebuild confidence.';
      default:
        return 'Consistency is key. Keep maintaining your current routine.';
    }
  }
}

// Export singleton instance
export const aiService = new AIService(); 