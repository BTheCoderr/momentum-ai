/**
 * RAG Client - Connects React Native app to the RAG service
 * This is the bridge between your app and the powerful RAG system
 */

interface RAGChatResponse {
  response: string;
  context_used: string[];
  confidence: number;
  coaching_type: string;
  recommendations: string[];
  follow_up_actions: string[];
  timestamp: string;
}

interface UserInteraction {
  userId: string;
  interactionType: string;
  content: string;
  metadata?: Record<string, any>;
}

interface PatternAnalysis {
  userId: string;
  patterns: Record<string, any>;
  insights: string[];
  recommendations: string[];
  total_data_points: number;
}

class RAGClient {
  private baseUrl: string;
  private fallbackEnabled: boolean;
  private networkEnabled: boolean;

  constructor(baseUrl: string = 'http://localhost:8000', fallbackEnabled: boolean = true, networkEnabled: boolean = false) {
    this.baseUrl = baseUrl;
    this.fallbackEnabled = fallbackEnabled;
    this.networkEnabled = networkEnabled; // Disable network calls by default
  }

  /**
   * Enable network calls to AI service
   */
  enableNetwork() {
    this.networkEnabled = true;
  }

  /**
   * Disable network calls to AI service
   */
  disableNetwork() {
    this.networkEnabled = false;
  }

  /**
   * 🎯 Get contextual AI response based on user history
   * This is the main method for chat interactions
   */
  async getContextualReply(
    userId: string, 
    message: string, 
    coachingType: string = 'general'
  ): Promise<RAGChatResponse> {
    try {
      // If network is disabled, return fallback response immediately
      if (!this.networkEnabled) {
        return this.getFallbackResponse(message, coachingType);
      }

      const response = await fetch(`${this.baseUrl}/contextual-reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          message,
          coaching_type: coachingType
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to get reply: ${response.status}`);
      }

      const data: RAGChatResponse = await response.json();
      return data;

    } catch (error) {
      console.error('❌ Failed to get contextual reply:', error);
      
      // Return fallback response
      if (this.fallbackEnabled) {
        return this.getFallbackResponse(message, coachingType);
      }
      
      throw error;
    }
  }

  /**
   * 📝 Add user interaction to the vector store
   * Call this for check-ins, goals, reflections, etc.
   */
  async addUserInteraction(interaction: UserInteraction): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/user-interaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(interaction),
      });

      if (!response.ok) {
        throw new Error(`Failed to add interaction: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Added interaction:', result.message);
      return true;

    } catch (error) {
      console.error('❌ Failed to add interaction:', error);
      return false;
    }
  }

  /**
   * 📊 Get user pattern analysis
   * Great for insights/analytics screens
   */
  async getUserPatterns(userId: string): Promise<PatternAnalysis | null> {
    try {
      // If network is disabled, return fallback data immediately
      if (!this.networkEnabled) {
        return {
          userId,
          patterns: {
            mood_trend: "Building baseline - continue daily check-ins",
            energy_pattern: "Establishing routine - more data needed",
            productivity_peaks: "Tracking in progress"
          },
          insights: [
            "Keep logging daily check-ins to unlock personalized insights",
            "Your consistency is building a valuable data foundation",
            "Patterns will emerge after 7+ days of consistent tracking"
          ],
          recommendations: [
            "Complete daily check-ins for better insights",
            "Be specific in your reflection notes",
            "Track activities that affect your mood and energy"
          ],
          total_data_points: 0
        };
      }

      const response = await fetch(`${this.baseUrl}/user-patterns/${userId}`);

      if (!response.ok) {
        throw new Error(`Failed to get patterns: ${response.status}`);
      }

      const data: PatternAnalysis = await response.json();
      return data;

    } catch (error) {
      console.error('❌ Failed to get patterns:', error);
      
      // Return fallback data instead of null
      if (this.fallbackEnabled) {
        return {
          userId,
          patterns: {
            mood_trend: "Building baseline - continue daily check-ins",
            energy_pattern: "Establishing routine - more data needed"
          },
          insights: [
            "Keep logging daily check-ins to unlock personalized insights",
            "Your consistency is building a valuable data foundation"
          ],
          recommendations: [
            "Complete daily check-ins for better insights",
            "Be specific in your reflection notes"
          ],
          total_data_points: 0
        };
      }
      
      return null;
    }
  }

  /**
   * 🔍 Get user context (for debugging)
   */
  async getUserContext(userId: string, query: string = 'general context'): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/user-context/${userId}?query=${encodeURIComponent(query)}`);

      if (!response.ok) {
        throw new Error(`Failed to get context: ${response.status}`);
      }

      return await response.json();

    } catch (error) {
      console.error('❌ Failed to get context:', error);
      return null;
    }
  }

  /**
   * 📈 Get system statistics
   */
  async getSystemStats(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/system-stats`);

      if (!response.ok) {
        throw new Error(`Failed to get stats: ${response.status}`);
      }

      return await response.json();

    } catch (error) {
      console.error('❌ Failed to get stats:', error);
      return null;
    }
  }

  /**
   * 🔄 Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * 🛡️ Fallback response when RAG service is unavailable
   */
  private getFallbackResponse(message: string, coachingType: string): RAGChatResponse {
    const fallbackResponses = {
      motivation: "I believe in your ability to overcome any challenge! Every expert was once a beginner. What's one small step you can take right now to move forward? 💪",
      planning: "Great planning mindset! Let's break this down into manageable steps. What's the most important outcome you want to achieve? 🎯",
      reflection: "Self-reflection is such a powerful tool for growth! What you're sharing shows real self-awareness. What patterns are you noticing? 🌟",
      general: "I'm here to support you on your journey! What specific challenge are you facing today?"
    };

    return {
      response: fallbackResponses[coachingType as keyof typeof fallbackResponses] || fallbackResponses.general,
      context_used: [],
      confidence: 0.6,
      coaching_type: coachingType,
      recommendations: ["Take one small action", "Stay consistent", "Reflect on progress"],
      follow_up_actions: ["Set a micro-goal", "Check in later", "Celebrate small wins"],
      timestamp: new Date().toISOString()
    };
  }
}

// Create singleton instance
export const ragClient = new RAGClient();

// Export types for use in components
export type { RAGChatResponse, UserInteraction, PatternAnalysis };

// Utility functions for easy integration

/**
 * 🎯 Quick function to get AI coaching response
 * Use this in your chat components
 */
export async function getContextualReply(
  userId: string, 
  message: string, 
  coachingType: string = 'general'
): Promise<string> {
  try {
    const response = await ragClient.getContextualReply(userId, message, coachingType);
    return response.response;
  } catch (error) {
    console.error('Error getting contextual reply:', error);
    return "I'm here to help! Tell me more about what's on your mind.";
  }
}

/**
 * 📝 Quick function to track user interactions
 * Use this for check-ins, goals, reflections
 */
export async function trackUserInteraction(
  userId: string,
  type: 'checkin' | 'goal' | 'reflection' | 'mood' | 'activity' | 'achievement',
  content: string,
  metadata?: Record<string, any>
): Promise<boolean> {
  return await ragClient.addUserInteraction({
    userId,
    interactionType: type,
    content,
    metadata
  });
}

/**
 * 📊 Quick function to get user insights
 * Use this in analytics/insights screens
 */
export async function getUserInsights(userId: string): Promise<PatternAnalysis | null> {
  return await ragClient.getUserPatterns(userId);
}

/**
 * 🔧 Integration helpers for existing services
 */
export const RAGIntegration = {
  /**
   * Enhance existing chat service with RAG
   */
  async enhanceChat(userId: string, message: string): Promise<string> {
    // First try RAG system
    try {
      const response = await ragClient.getContextualReply(userId, message);
      
      // Track the interaction for future context
      await trackUserInteraction(userId, 'checkin', message);
      
      return response.response;
    } catch (error) {
      // Fall back to existing chat service
      const { messageServices } = await import('./services');
      return await messageServices.sendMessage(message);
    }
  },

  /**
   * Enhance check-in service with RAG
   */
  async enhanceCheckin(userId: string, checkinData: any): Promise<void> {
    const content = `Check-in: ${checkinData.mood}/10 mood, ${checkinData.energy}/10 energy. ${checkinData.notes || ''}`;
    
    await trackUserInteraction(userId, 'checkin', content, {
      mood: checkinData.mood,
      energy: checkinData.energy,
      date: new Date().toISOString()
    });
  },

  /**
   * Enhance goal service with RAG
   */
  async enhanceGoal(userId: string, goalData: any): Promise<void> {
    const content = `Goal: ${goalData.title} - ${goalData.description}. Target: ${goalData.target_date}`;
    
    await trackUserInteraction(userId, 'goal', content, {
      category: goalData.category,
      priority: goalData.priority,
      target_date: goalData.target_date
    });
  }
};

export default ragClient; 