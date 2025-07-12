import { ragClient } from './rag-client';
import { supabase } from './supabase';

export interface AIResponse {
  text: string;
  confidence: number;
  context_used?: string[];
  metadata?: Record<string, any>;
}

export interface CoachingResponse extends AIResponse {
  coaching_type: string;
  recommendations: string[];
  follow_up_actions: string[];
}

export class AIService {
  private static instance: AIService;
  private isInitialized: boolean = false;

  private constructor() {}

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Check RAG service health
      const isHealthy = await ragClient.healthCheck();
      console.log('RAG service health check:', isHealthy ? '✅' : '❌');

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize AI service:', error);
      // Continue with degraded service
      this.isInitialized = true;
    }
  }

  async getCoachingResponse(userId: string, message: string, type: string = 'general'): Promise<CoachingResponse> {
    try {
      const response = await ragClient.getContextualReply(userId, message, type);
      return response;
    } catch (error) {
      console.error('Error getting coaching response:', error);
      return {
        text: "I'm here to help! What's on your mind?",
        confidence: 0.5,
        coaching_type: type,
        recommendations: [],
        follow_up_actions: []
      };
    }
  }

  async getWeeklySummary(userId: string): Promise<string> {
    try {
      // Get user's check-ins for the past week
      const { data: checkins, error } = await supabase
        .from('checkins')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!checkins?.length) {
        return "No check-ins found for the past week. Start sharing your daily progress to get personalized insights!";
      }

      // Generate summary using RAG
      try {
        const summary = await ragClient.getContextualReply(
          userId,
          "Generate a weekly summary based on the user's check-ins",
          'summary'
        );
        return summary.response;
      } catch (error) {
        console.error('Error generating RAG summary:', error);
        // Fallback to simple summary
        return this.generateSimpleSummary(checkins);
      }
    } catch (error) {
      console.error('Error getting weekly summary:', error);
      return "Unable to generate summary at the moment. Please try again later.";
    }
  }

  private generateSimpleSummary(checkins: any[]): string {
    const avgMood = checkins.reduce((sum, c) => sum + (c.mood || 0), 0) / checkins.length;
    const avgEnergy = checkins.reduce((sum, c) => sum + (c.energy || 0), 0) / checkins.length;
    
    return `This week's summary:
- Average mood: ${avgMood.toFixed(1)}/10
- Average energy: ${avgEnergy.toFixed(1)}/10
- Total check-ins: ${checkins.length}`;
  }

  async getCoachPreview(prompt: string): Promise<string> {
    try {
      const response = await ragClient.getContextualReply('preview', prompt, 'preview');
      return response.response;
    } catch (error) {
      console.error('Error getting coach preview:', error);
      return "I'd be happy to help you with that! Let me know what's on your mind.";
    }
  }
}

export const aiService = AIService.getInstance(); 