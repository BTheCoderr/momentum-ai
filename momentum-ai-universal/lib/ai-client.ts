import { supabase } from './supabase';
import { API_CONFIG } from './config';
import universalStorage from './storage';

interface AIResponse {
  message: string;
  context_used?: boolean;
  confidence?: number;
}

interface BehaviorData {
  user_id: string;
  action_type: string;
  metadata: Record<string, any>;
}

interface DriftPrediction {
  drift_probability: number;
  risk_level: 'low' | 'medium' | 'high';
  interventions: Array<{
    type: string;
    message: string;
    urgency: string;
  }>;
  confidence: number;
}

interface Insight {
  id: string;
  type: 'pattern' | 'encouragement' | 'suggestion' | 'reflection';
  title: string;
  content: string;
  confidence: number;
  actionable: boolean;
}

interface FuturePlan {
  strategies: Array<{
    id: string;
    title: string;
    description: string;
    success_probability: number;
    timeframe: number;
  }>;
  timeline: Array<{
    date: string;
    milestone: string;
    actions: string[];
  }>;
  success_probability: number;
  recommended_actions: Array<{
    action: string;
    priority: 'high' | 'medium' | 'low';
    estimated_impact: number;
  }>;
}

export interface InsightResult {
  patterns: string[];
  suggestions: string[];
  mood_analysis: string;
  behavior_trends: string[];
  recommendations: string[];
}

export interface CoachingResponse {
  response: string;
  coaching_type: string;
  context_used: string[];
  recommendations: string[];
  follow_up_actions: string[];
  confidence: number;
  timestamp: string;
}

export class AIClient {
  private baseURL: string;
  private apiKey: string;
  private userId: string | null = null;

  constructor() {
    this.baseURL = 'https://api.groq.com/openai/v1'; // Using Groq as default
    this.apiKey = process.env.GROQ_API_KEY || 'gsk_your_api_key_here';
    this.initializeUserId();
  }

  private async initializeUserId() {
    try {
      // Get current user from Supabase
      const { data: { user } } = await supabase.auth.getUser();
      this.userId = user?.id || null;
      
      // Fallback to stored demo user
      if (!this.userId) {
        this.userId = await universalStorage.getItem('userId') || 'demo-user';
      }
    } catch (error) {
      console.error('Error initializing user ID:', error);
      this.userId = 'demo-user';
    }
  }

  private async makeRequest(endpoint: string, data?: any, method: 'GET' | 'POST' = 'POST') {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const options: RequestInit = {
        method,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        ...(data && { body: JSON.stringify(data) }),
      };

      console.log(`🤖 AI Request: ${method} ${url}`);
      
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('🤖 AI Response:', result);
      
      return result;
    } catch (error) {
      console.error('AI Client Error:', error);
      throw error;
    }
  }

  /**
   * Smart Coaching - Context-aware AI coach with personalized responses
   */
  async getSmartCoachResponse(message: string, context?: any): Promise<AIResponse> {
    try {
      await this.initializeUserId();
      
      // Try to get real AI response first
      const response = await this.getSmartCoaching(this.userId || 'demo', message);
      
      return {
        message: response.response,
        context_used: response.context_used.length > 0,
        confidence: response.confidence
      };
    } catch (error) {
      console.error('Smart coach error:', error);
      
      // Fallback to enhanced local responses
      return this.getFallbackCoachResponse(message);
    }
  }

  /**
   * AI Coach Chat - New implementation with personality
   */
  async getSmartCoaching(userId: string, message: string, coachingType: string = 'general'): Promise<CoachingResponse> {
    try {
      // Get user context and coach personality
      const [userContext, personality] = await Promise.all([
        this.getUserContext(),
        this.getCoachPersonality(userId)
      ]);

      // Simple fallback response for now (replace with real LLM later)
      return {
        response: this.generateCoachingResponse(message, personality, userContext),
        coaching_type: coachingType,
        context_used: userContext ? ['goals', 'recent_checkins', 'personality'] : [],
        recommendations: this.generateRecommendations(message, personality),
        follow_up_actions: this.generateFollowUpActions(message),
        confidence: 0.8,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating coaching response:', error);
      return this.getFallbackCoachingResponse(message, coachingType);
    }
  }

  private generateCoachingResponse(message: string, personality: any, context: any): string {
    const style = personality?.primaryStyle || 'encouraging';
    const userName = 'there'; // Could get from context later

    // Generate contextual response based on style
    if (message.toLowerCase().includes('motivated') || message.toLowerCase().includes('motivation')) {
      if (style === 'strict') {
        return `Listen ${userName}, motivation comes and goes. What matters is discipline and consistency. What specific action will you take in the next hour?`;
      } else if (style === 'motivational') {
        return `${userName}, you've got this! 🔥 Motivation isn't something you wait for - it's something you CREATE through action! What's one powerful step you can take right now?`;
      } else {
        return `I understand ${userName}. Some days motivation feels harder to find, and that's completely normal. Remember your goals and why they matter to you. What's one small step you could take today?`;
      }
    }

    if (message.toLowerCase().includes('stuck') || message.toLowerCase().includes('overwhelmed')) {
      if (style === 'analytical') {
        return `Let's break this down systematically. What's the primary challenge you're facing? We can tackle it step by step.`;
      } else {
        return `Feeling stuck is part of the journey, ${userName}. Every successful person has been where you are. What's one tiny action that might help you move forward?`;
      }
    }

    // Default response based on style
    const responses: Record<string, string> = {
      encouraging: `That's a great message, ${userName}! I can see you're putting in effort. Remember, every small step counts toward your bigger goals. What would feel like a win for you today?`,
      strict: `Good. Now let's focus on what matters. What specific action will you commit to taking today? No excuses, just results.`,
      motivational: `YES! I love that energy! You're capable of amazing things ${userName}! What's your next power move going to be? 💪`,
      analytical: `Interesting perspective. Based on your goals and patterns, here's what I recommend focusing on next...`,
      friendly: `Hey ${userName}! Thanks for sharing that with me. I'm here to help you however I can. What's on your mind today?`,
      wise: `I hear you, ${userName}. Sometimes the most profound growth comes from the simplest moments of awareness. What is this situation teaching you?`
    };

    return responses[style] || responses.encouraging;
  }

  private generateRecommendations(message: string, personality: any): string[] {
    const baseRecommendations = [
      'Complete today\'s check-in to track your progress',
      'Review your main goal and adjust if needed',
      'Take a small action toward your biggest priority'
    ];

    if (message.toLowerCase().includes('stress') || message.toLowerCase().includes('overwhelmed')) {
      return [
        'Take 5 deep breaths to center yourself',
        'Break your current task into smaller steps',
        'Consider what you can delegate or postpone'
      ];
    }

    return baseRecommendations;
  }

  private generateFollowUpActions(message: string): string[] {
    return [
      'Set a specific time for your next task',
      'Plan tomorrow\'s top 3 priorities',
      'Schedule a brief reflection at end of day'
    ];
  }

  private async getCoachPersonality(userId: string): Promise<any> {
    try {
      const cached = await universalStorage.getItem('coachPersonality');
      if (cached) {
        return JSON.parse(cached);
      }
      
      return {
        primaryStyle: 'encouraging',
        communicationPreferences: {
          formality: 40,
          directness: 50,
          enthusiasm: 70,
          supportiveness: 80,
        },
        responseLength: 'balanced',
        useEmojis: true,
        useHumor: false,
      };
    } catch (error) {
      console.error('Error getting coach personality:', error);
      return { primaryStyle: 'encouraging' };
    }
  }

  private getFallbackCoachingResponse(message: string, coachingType: string): CoachingResponse {
    return {
      response: "I hear you! It sounds like you're working hard on your goals. Remember, progress isn't always linear - every small step counts. What's one small action you could take today to move forward?",
      coaching_type: coachingType,
      context_used: [],
      recommendations: ['Take one small action today', 'Celebrate your progress so far', 'Stay consistent with daily habits'],
      follow_up_actions: ['Complete today\'s check-in', 'Review your main goal', 'Plan tomorrow\'s priorities'],
      confidence: 0.8,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Generate AI insights from user context
   */
  async generateInsights(userContext: any): Promise<InsightResult> {
    try {
      const context = userContext || await this.getUserContext();
      
      return {
        patterns: this.extractPatterns(context),
        suggestions: this.generateSuggestions(context),
        mood_analysis: this.analyzeMood(context),
        behavior_trends: this.getBehaviorTrends(context),
        recommendations: this.getRecommendations(context)
      };
    } catch (error) {
      console.error('Error generating insights:', error);
      return {
        patterns: ['Building consistent daily habits'],
        suggestions: ['Continue with daily check-ins', 'Set small, achievable goals'],
        mood_analysis: 'Keep tracking your mood to see patterns over time',
        behavior_trends: ['Developing positive momentum'],
        recommendations: ['Stay consistent with your routine']
      };
    }
  }

  private extractPatterns(context: any): string[] {
    const patterns = [];
    
    if (context?.recent_checkins && context.recent_checkins.length > 0) {
      // Analyze check-in patterns
      const avgMood = context.recent_checkins.reduce((sum: number, c: any) => sum + (c.mood || 3), 0) / context.recent_checkins.length;
      if (avgMood > 3.5) {
        patterns.push('You tend to maintain positive mood levels consistently');
      }
      
      const morningCheckins = context.recent_checkins.filter((c: any) => {
        const hour = new Date(c.date || c.created_at).getHours();
        return hour < 12;
      });
      
      if (morningCheckins.length > context.recent_checkins.length * 0.6) {
        patterns.push('You are most active and engaged in the morning hours');
      }
    }

    if (context?.goals && context.goals.length > 0) {
      patterns.push(`You focus on ${context.goals.length} main goal areas currently`);
    }

    return patterns.length > 0 ? patterns : ['Building consistent daily habits and routines'];
  }

  private generateSuggestions(context: any): string[] {
    const suggestions = [];
    
    if (context?.recent_checkins && context.recent_checkins.length > 0) {
      const avgEnergy = context.recent_checkins.reduce((sum: number, c: any) => sum + (c.energy || 3), 0) / context.recent_checkins.length;
      
      if (avgEnergy < 3) {
        suggestions.push('Consider scheduling more rest and recovery time');
        suggestions.push('Try a short walk or light exercise to boost energy');
      } else {
        suggestions.push('Use your high energy periods for your most important tasks');
      }
    }

    suggestions.push('Set aside 10 minutes daily for reflection and planning');
    suggestions.push('Break larger goals into smaller, actionable daily steps');

    return suggestions;
  }

  private analyzeMood(context: any): string {
    if (!context?.recent_checkins || context.recent_checkins.length === 0) {
      return 'Not enough data for mood analysis. Continue daily check-ins for insights.';
    }

    const avgMood = context.recent_checkins.reduce((sum: number, c: any) => sum + (c.mood || 3), 0) / context.recent_checkins.length;
    
    if (avgMood >= 4) {
      return 'Your mood has been consistently positive with good emotional stability.';
    } else if (avgMood >= 3) {
      return 'Your mood has been steady with some fluctuations - this is completely normal.';
    } else {
      return 'Your mood shows some lower periods. Consider what activities or situations boost your wellbeing.';
    }
  }

  private getBehaviorTrends(context: any): string[] {
    const trends = [];
    
    if (context?.stats?.current_streak > 3) {
      trends.push(`Strong consistency with ${context.stats.current_streak}-day check-in streak`);
    }
    
    if (context?.recent_checkins && context.recent_checkins.length > 0) {
      trends.push('Regular engagement with self-reflection and goal tracking');
    }

    return trends.length > 0 ? trends : ['Developing positive momentum and habits'];
  }

  private getRecommendations(context: any): string[] {
    return [
      'Continue daily check-ins to build self-awareness',
      'Set one specific daily goal each morning',
      'Review progress weekly and adjust strategies as needed',
      'Celebrate small wins to maintain motivation'
    ];
  }

  private getFallbackInsights(): Insight[] {
    return [
      {
        id: 'fallback-1',
        title: 'Keep Going!',
        content: 'You\'re making great progress. Consistency is key to building lasting habits.',
        type: 'encouragement',
        confidence: 0.8,
        actionable: false
      },
      {
        id: 'fallback-2',
        title: 'Daily Reflection',
        content: 'Take a moment to reflect on what went well today and what you can improve tomorrow.',
        type: 'reflection',
        confidence: 0.7,
        actionable: true
      }
    ];
  }

  /**
   * Behavior Tracking - Real-time pattern recognition and user behavior tracking
   */
  async trackBehavior(activityType: string, data: Record<string, any>): Promise<boolean> {
    try {
      await this.initializeUserId();
      
      const behaviorData: BehaviorData = {
        user_id: this.userId!,
        action_type: activityType,  // Updated to match backend
        metadata: data  // Updated to match backend
      };

      const response = await this.makeRequest(API_CONFIG.ENDPOINTS.BEHAVIOR_TRACK, behaviorData);
      
      console.log(`📊 Behavior tracked: ${activityType}`, response);
      return response.success === true;
    } catch (error) {
      console.error('Behavior tracking error:', error);
      return false;
    }
  }

  /**
   * Drift Prediction - Proactive intervention when users lose momentum
   */
  async predictDrift(timeframe: number = 7): Promise<DriftPrediction | null> {
    try {
      await this.initializeUserId();
      
      const response = await this.makeRequest(API_CONFIG.ENDPOINTS.DRIFT_PREDICT, {
        user_id: this.userId,
        timeframe_days: timeframe
      });

      return {
        drift_probability: response.drift_probability || 0,
        risk_level: response.risk_level || 'low',
        interventions: response.interventions || [],
        confidence: response.confidence || 0.5
      };
    } catch (error) {
      console.error('Drift prediction error:', error);
      return null;
    }
  }

  /**
   * Advanced Insights - AI-powered pattern analysis and recommendations
   */
  async getAdvancedInsights(dataTypes: string[] = ['checkins', 'goals', 'messages']): Promise<Insight[]> {
    try {
      await this.initializeUserId();
      
      const response = await this.makeRequest(API_CONFIG.ENDPOINTS.INSIGHTS, {
        user_id: this.userId,
        days_back: 30
      });

      // Convert backend response to our expected format
      const insights: Insight[] = [];
      
      if (response.behavior_analysis) {
        insights.push({
          id: 'behavior_analysis',
          type: 'pattern' as const,
          title: 'Behavior Analysis',
          content: response.behavior_analysis,
          confidence: 0.8,
          actionable: true
        });
      }
      
      if (response.insights && Array.isArray(response.insights)) {
        response.insights.forEach((insight: any, index: number) => {
          insights.push({
            id: `insight_${index}`,
            type: 'suggestion' as const,
            title: insight.title || 'Insight',
            content: insight.content || insight,
            confidence: insight.confidence || 0.7,
            actionable: insight.actionable || true
          });
        });
      }

      return insights.length > 0 ? insights : this.getFallbackInsights();
    } catch (error) {
      console.error('Advanced insights error:', error);
      return this.getFallbackInsights();
    }
  }

  /**
   * Future Planning - Generate AI-powered strategic plans and predictions
   */
  async createFuturePlan(goals: Array<{title: string; category: string}>, timeframe: number = 30): Promise<FuturePlan | null> {
    try {
      await this.initializeUserId();
      
      // Convert goals to the format expected by backend
      const goal = goals.length > 0 ? goals[0].title : "Achieve personal growth";
      
      const response = await this.makeRequest(API_CONFIG.ENDPOINTS.FUTURE_PLAN, {
        user_id: this.userId,
        goal,
        timeframe_days: timeframe,
        context: { goals, original_goals: goals }
      });

      // Convert backend response to our expected format
      const milestones = response.milestones || [];
      const timeline = milestones.map((milestone: any) => ({
        date: `Day ${milestone.day}`,
        milestone: milestone.target,
        actions: [milestone.target]
      }));

      return {
        strategies: [{
          id: 'main_strategy',
          title: goal,
          description: `Achieve your goal: ${goal}`,
          success_probability: response.success_probability || 0.7,
          timeframe: timeframe
        }],
        timeline,
        success_probability: response.success_probability || 0.7,
        recommended_actions: (response.recommendations || []).map((rec: string, index: number) => ({
          action: rec,
          priority: 'medium' as const,
          estimated_impact: 0.7
        }))
      };
    } catch (error) {
      console.error('Future planning error:', error);
      return null;
    }
  }

  /**
   * Enhanced Analytics - Track AI interactions and performance
   */
  async trackAIInteraction(interactionType: string, metadata: Record<string, any> = {}) {
    try {
      await this.trackBehavior('ai_interaction', {
        interaction_type: interactionType,
        ...metadata,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('AI interaction tracking error:', error);
    }
  }

  /**
   * Real-time Coaching Context - Get user context for personalized coaching
   */
  async getUserContext(): Promise<Record<string, any>> {
    try {
      await this.initializeUserId();
      
      // Get user's recent activity
      const [goals, checkins, messages] = await Promise.all([
        this.getRecentGoals(),
        this.getRecentCheckins(),
        this.getRecentMessages()
      ]);

      return {
        goals,
        checkins,
        messages,
        user_id: this.userId,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting user context:', error);
      return {};
    }
  }

  /**
   * Proactive Intervention - Generate interventions based on user patterns
   */
  async generateInterventions(riskLevel: 'low' | 'medium' | 'high'): Promise<Array<{type: string; message: string; urgency: string}>> {
    const interventions = {
      low: [
        {
          type: 'encouragement',
          message: 'You\'re doing great! Keep up the momentum! 🚀',
          urgency: 'low'
        }
      ],
      medium: [
        {
          type: 'check_in_reminder',
          message: 'It\'s been a while since your last check-in. How are you feeling today?',
          urgency: 'medium'
        },
        {
          type: 'goal_refocus',
          message: 'Let\'s revisit your goals and make sure they\'re still aligned with your priorities.',
          urgency: 'medium'
        }
      ],
      high: [
        {
          type: 'personal_coach',
          message: 'I noticed you might be losing momentum. Let\'s have a one-on-one session to get back on track! 💪',
          urgency: 'high'
        },
        {
          type: 'goal_adjustment',
          message: 'Sometimes we need to adjust our goals. Would you like to explore what\'s working and what isn\'t?',
          urgency: 'high'
        }
      ]
    };

    return interventions[riskLevel] || interventions.low;
  }

  // Private helper methods
  private getFallbackCoachResponse(message: string): AIResponse {
    const fallbackResponses = [
      "I'm here to support you on your journey! What specific challenge are you facing?",
      "Every step forward is progress. What would make the biggest difference for you today?",
      "You've got this! Let's break down what you're working on into manageable pieces.",
      "I believe in your ability to overcome challenges. What's the first small step you can take?",
      "Progress isn't always linear. What's working well for you right now?",
      "Your consistency shows real commitment. How can we build on that momentum?",
      "Sometimes the best insights come from reflection. What have you learned recently?",
      "You're stronger than you think. What would you tell a friend in your situation?",
      "Change takes time and patience. What's one thing you're grateful for today?",
      "Your future self will thank you for the effort you're putting in now. Keep going! 💪"
    ];

    return {
      message: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
      context_used: false,
      confidence: 0.6
    };
  }

  private async getRecentGoals() {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', this.userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting recent goals:', error);
      return [];
    }
  }

  private async getRecentCheckins() {
    try {
      const { data, error } = await supabase
        .from('checkins')
        .select('*')
        .eq('user_id', this.userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting recent checkins:', error);
      return [];
    }
  }

  private async getRecentMessages() {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', this.userId)
        .order('timestamp', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting recent messages:', error);
      return [];
    }
  }

  async getInsights(userId: string, context?: string): Promise<Insight[]> {
    try {
      const insights = await this.getAdvancedInsights();
      return insights.length > 0 ? insights : this.getFallbackInsights();
    } catch (error) {
      console.error('Error getting insights:', error);
      return this.getFallbackInsights();
    }
  }

}

// Create and export singleton instance
export const aiClient = new AIClient();

// Export types for use in components
export type { AIResponse, BehaviorData, DriftPrediction, Insight, FuturePlan }; 