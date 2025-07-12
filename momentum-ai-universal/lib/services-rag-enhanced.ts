/**
 * RAG-Enhanced Services
 * Drop-in replacements for existing services that add RAG capabilities
 */

import { getContextualReply, trackUserInteraction, getUserInsights, RAGIntegration } from './rag-client';
import universalStorage from './storage';
import { supabase } from './supabase';
import { Goal } from './supabase';
import { PatternRecognitionEngine, PatternInsight } from './pattern-engine';

/**
 * Enhanced Message Service with RAG
 * Replace your existing messageServices.sendMessage with this
 */
export const enhancedMessageServices = {
  async sendMessage(message: string): Promise<string> {
    try {
      const userId = await universalStorage.getItem('userId') || 'demo-user';
      
      // 🚀 Get RAG-powered response with user context
      const response = await getContextualReply(userId, message, 'general');
      
      // Track this interaction for future context
      await trackUserInteraction(userId, 'checkin', message);
      
      return response;
      
    } catch (error) {
      console.error('Enhanced message service error:', error);
      
      // Fallback to contextual response
      return this.getContextualFallback(message);
    }
  },

  getContextualFallback(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('motivation') || lowerMessage.includes('motivated')) {
      return "I understand that motivation can be challenging sometimes. Remember that motivation gets you started, but habit keeps you going. What's one small action you could take right now to move forward? 💪";
    }
    
    if (lowerMessage.includes('stuck') || lowerMessage.includes('overwhelmed')) {
      return "Feeling stuck is completely normal and actually a sign you're pushing yourself to grow! Let's break this down into smaller steps. What's the very next action you could take, even if it's tiny? 🎯";
    }
    
    if (lowerMessage.includes('goal') || lowerMessage.includes('target')) {
      return "Goals are dreams with deadlines! I love that you're focused on achieving something meaningful. What specific outcome would make you feel most proud at the end of this week? 🌟";
    }
    
    return "I'm here to support you on your journey! What specific challenge are you facing today? 🌟";
  }
};

interface CheckInData {
  mood: number;
  energy: number;
  stress: number;
  notes?: string;
  goals_progress?: any;
  date?: string;
  created_at?: string;
}

interface DatabaseCheckin {
  id: string;
  user_id: string;
  mood: number;
  energy: number;
  stress: number;
  notes: string;
  date: string;
  created_at: string;
  goals_progress: Record<string, any>;
}

interface InsightResponse {
  total_data_points: number;
  patterns: string[];
  insights: string[];
  recommendations: string[];
}

interface PatternAnalysis {
  total_data_points: number;
  patterns: Record<string, any>;
  insights: string[];
  recommendations: string[];
}

interface PersonalizedInsights {
  total_data_points: number;
  key_insights: string[];
  personalized_recommendations: string[];
  pattern_analysis: Record<string, any>;
  coaching_message: string;
  behavioral_insights?: PatternInsight[];
  predictions?: {
    nextWeek: string;
    confidence: number;
  };
}

/**
 * Enhanced Check-in Service with RAG
 * Automatically tracks check-ins for future context
 */
export const enhancedCheckinServices = {
  async submitCheckin(checkinData: CheckInData): Promise<{ data: DatabaseCheckin | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) {
        throw new Error('No authenticated user found');
      }

      // Format check-in for database
      const formattedCheckin = {
        user_id: user.id,
        mood: checkinData.mood,
        energy: checkinData.energy,
        stress: checkinData.stress,
        notes: checkinData.notes || '',
        date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        goals_progress: checkinData.goals_progress || {}
      };

      // Insert into database
      const { data, error } = await supabase
        .from('checkins')
        .insert(formattedCheckin)
        .select()
        .single();

      if (error) throw error;

      // Format check-in for RAG context
      const content = `Daily check-in: Mood ${checkinData.mood}/10, Energy ${checkinData.energy}/10, Stress ${checkinData.stress}/10. ${checkinData.notes || 'No additional notes.'}`;
      
      // Track in RAG system for future context
      await trackUserInteraction(user.id, 'checkin', content, {
        ...formattedCheckin,
        type: 'daily_checkin'
      });

      return { data, error: null };

    } catch (error) {
      console.error('Enhanced check-in service error:', error);
      return { data: null, error };
    }
  },

  async getCheckinInsights(userId?: string): Promise<{ data: CheckInData[]; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const actualUserId = userId || user?.id;

      if (!actualUserId) {
        throw new Error('No user ID provided');
      }

      // Get recent check-ins from database
      const { data: checkinsData, error: checkinsError } = await supabase
        .from('checkins')
        .select('*')
        .eq('user_id', actualUserId)
        .order('created_at', { ascending: false })
        .limit(30);

      if (checkinsError) throw checkinsError;

      // Format check-ins
      const formattedCheckins = (checkinsData as DatabaseCheckin[] || []).map(checkin => ({
        id: checkin.id,
        mood: checkin.mood,
        energy: checkin.energy,
        stress: checkin.stress,
        date: checkin.date,
        dayOfWeek: new Date(checkin.created_at).toLocaleDateString('en-US', { weekday: 'long' }),
        timeOfDay: getTimeOfDay(new Date(checkin.created_at)),
        notes: checkin.notes,
        productivity: calculateProductivity(checkin)
      }));

      return { data: formattedCheckins, error: null };

    } catch (error) {
      console.error('Error getting check-in insights:', error);
      return { data: [], error };
    }
  }
};

/**
 * Enhanced Goal Service with RAG
 * Tracks goals and provides AI-powered recommendations
 */
export const enhancedGoalServices = {
  async createGoal(goalData: {
    title: string;
    description: string;
    category: string;
    target_date: string;
    priority?: string;
  }): Promise<boolean> {
    try {
      const userId = await universalStorage.getItem('userId') || 'demo-user';
      
      // Format goal for RAG context
      const content = `New goal: "${goalData.title}" - ${goalData.description}. Category: ${goalData.category}. Target date: ${goalData.target_date}`;
      
      // Track in RAG system
      await trackUserInteraction(userId, 'goal', content, {
        category: goalData.category,
        priority: goalData.priority || 'medium',
        target_date: goalData.target_date,
        created_date: new Date().toISOString()
      });
      
      console.log('✅ Goal tracked in RAG system');
      return true;
      
    } catch (error) {
      console.error('Enhanced goal service error:', error);
      return false;
    }
  },

  async getGoalCoaching(goalTitle: string): Promise<string> {
    try {
      const userId = await universalStorage.getItem('userId') || 'demo-user';
      
      // Get AI coaching specific to this goal
      const response = await getContextualReply(
        userId, 
        `I need help with my goal: ${goalTitle}. Can you provide specific advice?`,
        'planning'
      );
      
      return response;
      
    } catch (error) {
      console.error('Error getting goal coaching:', error);
      return `Great goal! Here are some tips for "${goalTitle}": Break it into smaller steps, set deadlines, and celebrate progress along the way. You've got this! 🎯`;
    }
  },

  async updateGoalProgress(goalId: string, progress: number, notes?: string): Promise<boolean> {
    try {
      const userId = await universalStorage.getItem('userId') || 'demo-user';
      
      // Track progress update
      const content = `Goal progress update: ${progress}% complete. ${notes || 'No additional notes.'}`;
      
      await trackUserInteraction(userId, 'achievement', content, {
        goal_id: goalId,
        progress_percentage: progress,
        update_date: new Date().toISOString()
      });
      
      return true;
      
    } catch (error) {
      console.error('Error updating goal progress:', error);
      return false;
    }
  }
};

/**
 * Enhanced AI Insights Service
 * Provides personalized insights using RAG and advanced pattern recognition
 */
export const enhancedInsightsServices = {
  async getPersonalizedInsights(userId?: string): Promise<PersonalizedInsights> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const actualUserId = userId || user?.id;

      if (!actualUserId) {
        throw new Error('No user ID provided');
      }

      // Try to get insights from RAG, but handle gracefully if unavailable
      let insights: PatternAnalysis | null = null;
      try {
        insights = await getUserInsights(actualUserId);
      } catch (error) {
        console.log('RAG service unavailable, using fallback insights');
        insights = null;
      }
      
      // Get enhanced pattern analysis (this should work offline)
      let patternInsights: PatternInsight[] = [];
      try {
        patternInsights = await PatternRecognitionEngine.analyzeUserPatterns(actualUserId);
      } catch (error) {
        console.log('Pattern analysis unavailable, using fallback');
        patternInsights = [];
      }
      
      if (!insights) {
        // Return enhanced fallback with local pattern analysis
        return {
          key_insights: patternInsights.length > 0 
            ? patternInsights.slice(0, 3).map(p => p.description || 'Building your pattern profile')
            : [
                "Start tracking your check-ins and goals to get personalized insights!",
                "Your first week of check-ins will reveal your patterns",
                "Add some goals to see how they align with your daily energy"
              ],
          personalized_recommendations: patternInsights.length > 0
            ? patternInsights
                .filter(p => p.actionable)
                .slice(0, 3)
                .flatMap(p => p.recommendations || [])
            : [
                "Complete your first check-in",
                "Set a meaningful goal", 
                "Track your progress daily"
              ],
          pattern_analysis: {
            mood_trends: "Building baseline - continue daily check-ins",
            energy_patterns: "Establishing routine - more data needed",
            behavioral_clusters: "Tracking in progress"
          },
          coaching_message: "I'm learning about your patterns! Keep checking in daily to unlock personalized insights.",
          total_data_points: 0,
          behavioral_insights: patternInsights.slice(0, 5)
        };
      }
      
      // Convert PatternAnalysis to InsightResponse for coaching message
      const insightResponse: InsightResponse = {
        total_data_points: insights.total_data_points || 0,
        patterns: insights.patterns ? Object.values(insights.patterns).map(p => p?.toString() || '') : [],
        insights: insights.insights || [],
        recommendations: insights.recommendations || []
      };
      
      // Get next week's predictions
      const predictions = patternInsights
        .find(p => p.category === 'prediction')
        ?.metadata?.predictions || {
          summary: 'Need more data for predictions',
          confidence: 0.5
        };

      return {
        key_insights: insights.insights || [],
        personalized_recommendations: insights.recommendations || [],
        pattern_analysis: insights.patterns || {},
        coaching_message: this.generateCoachingMessage(insightResponse),
        total_data_points: insights.total_data_points || 0,
        behavioral_insights: patternInsights,
        predictions: {
          nextWeek: predictions.summary || 'Need more data for predictions',
          confidence: predictions.confidence || 0.5
        }
      };
      
    } catch (error) {
      console.error('Error getting personalized insights:', error);
      
      // Return basic fallback
      return {
        key_insights: [
          "Start tracking your check-ins and goals to get personalized insights!",
          "Your first week of check-ins will reveal your patterns",
          "Add some goals to see how they align with your daily energy"
        ],
        personalized_recommendations: [
          "Complete your first check-in",
          "Set a meaningful goal",
          "Track your progress daily"
        ],
        pattern_analysis: {},
        coaching_message: "I'm here to help you build momentum! Let's start with a check-in.",
        total_data_points: 0,
        behavioral_insights: []
      };
    }
  },

  /**
 * Generate coaching message from insights
 */
  generateCoachingMessage(insightResponse: InsightResponse): string {
    if (insightResponse.total_data_points === 0) {
      return "I'm here to help you build momentum! Let's start with a check-in.";
    }

    const messages = [
      "Your patterns show great potential for growth! 🌟",
      "I see some interesting trends in your data. Keep it up! 💪",
      "Your consistency is paying off - let's build on this momentum! 🚀",
      "You're developing some powerful habits. Stay focused! 🎯",
      "Your journey is unique and valuable. Keep tracking! 📈"
    ];

    return messages[Math.floor(Math.random() * messages.length)];
  },

  async getCoachingMessage(userId: string, insights: InsightResponse): Promise<string> {
    try {
      // Create a coaching prompt based on insights
      const prompt = `Based on ${insights.total_data_points} data points, here's what I notice:
      
Patterns: ${insights.patterns.join(', ')}
Key Insights: ${insights.insights.join(', ')}

What specific coaching advice would help this person maintain momentum and achieve their goals?`;
      
      const response = await getContextualReply(userId, prompt, 'motivation');
      return response || "Keep pushing forward! Every step counts toward your goals. 🌟";
      
    } catch (error) {
      console.error('Error getting coaching message:', error);
      return "You're making great progress! Keep focusing on consistency and celebrating your wins. Every step forward matters! 🌟";
    }
  }
};

/**
 * Enhanced Reflection Service
 * Tracks reflections and provides AI-powered insights
 */
export const enhancedReflectionServices = {
  async submitReflection(reflectionData: {
    content: string;
    mood?: number;
    insights?: string[];
    goals_mentioned?: string[];
  }): Promise<boolean> {
    try {
      const userId = await universalStorage.getItem('userId') || 'demo-user';
      
      // Track reflection in RAG system
      await trackUserInteraction(userId, 'reflection', reflectionData.content, {
        mood: reflectionData.mood,
        insights: reflectionData.insights,
        goals_mentioned: reflectionData.goals_mentioned,
        date: new Date().toISOString()
      });
      
      console.log('✅ Reflection tracked in RAG system');
      return true;
      
    } catch (error) {
      console.error('Enhanced reflection service error:', error);
      return false;
    }
  },

  async getReflectionPrompt(): Promise<string> {
    try {
      const userId = await universalStorage.getItem('userId') || 'demo-user';
      
      // Get AI-generated reflection prompt based on user's context
      const response = await getContextualReply(
        userId,
        'Can you give me a thoughtful reflection prompt based on my recent progress and goals?',
        'reflection'
      );
      
      return response;
      
    } catch (error) {
      const defaultPrompts = [
        "What's one thing you learned about yourself this week?",
        "How did you handle challenges today, and what would you do differently?",
        "What are you most grateful for in your current journey?",
        "What patterns do you notice in your motivation levels?",
        "How are you progressing toward your most important goal?"
      ];
      
      return defaultPrompts[Math.floor(Math.random() * defaultPrompts.length)];
    }
  }
};

// Helper functions
function getTimeOfDay(date: Date): string {
  const hour = date.getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

function calculateProductivity(checkin: DatabaseCheckin): number {
  // Simple productivity score based on mood and energy
  const base = (checkin.mood + checkin.energy) / 2;
  const stressImpact = Math.max(0, 1 - (checkin.stress / 10));
  return Math.min(Math.max(base * stressImpact, 1), 5);
}

/**
 * 🔧 Easy Migration Helper
 * Use this to gradually upgrade your existing services
 */
export const RAGMigrationHelper = {
  /**
   * Replace your existing messageServices.sendMessage calls with this
   */
  async upgradeMessageService(message: string): Promise<string> {
    return await enhancedMessageServices.sendMessage(message);
  },

  /**
   * Replace your existing check-in submissions with this
   */
  async upgradeCheckinService(checkinData: any): Promise<boolean> {
    const result = await enhancedCheckinServices.submitCheckin(checkinData);
    return result.data !== null && result.error === null;
  },

  /**
   * Replace your existing goal creation with this
   */
  async upgradeGoalService(goalData: any): Promise<boolean> {
    return await enhancedGoalServices.createGoal(goalData);
  },

  /**
   * Add this to your insights screen
   */
  async upgradeInsightsService(userId?: string): Promise<any> {
    return await enhancedInsightsServices.getPersonalizedInsights(userId);
  }
};

// Export everything for easy importing
export {
  enhancedMessageServices as messageServices,
  enhancedCheckinServices as checkinServices,
  enhancedGoalServices as goalServices,
  enhancedInsightsServices as insightsServices,
  enhancedReflectionServices as reflectionServices
}; 