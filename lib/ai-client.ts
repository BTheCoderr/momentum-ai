import { useState, useEffect, useCallback } from 'react';

// AI Service Client for Pattern Recognition
export interface UserBehavior {
  user_id: string;
  timestamp: string;
  action_type: string;
  goal_id?: string;
  progress_delta?: number;
  sentiment_score?: number;
  session_duration?: number;
}

export interface RiskPrediction {
  user_id: string;
  risk_score: number;
  predicted_drift_date?: string;
  intervention_recommendations: string[];
  confidence: number;
}

export interface UserInsights {
  user_id: string;
  total_actions: number;
  date_range: {
    start: string;
    end: string;
  };
  activity_patterns: {
    hourly: Record<string, number>;
    daily: Record<string, number>;
  };
  current_streak: number;
  features: {
    avg_daily_engagement: number;
    engagement_consistency: number;
    progress_trend: number;
    days_since_last_action: number;
    avg_session_duration: number;
    sentiment_trend: number;
    total_actions: number;
  };
}

class AIClient {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8001';
  }

  /**
   * Track user behavior for pattern analysis
   */
  async trackBehavior(behavior: UserBehavior): Promise<{ status: string; behavior_id: number }> {
    const response = await fetch(`${this.baseURL}/api/track-behavior`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...behavior,
        timestamp: new Date(behavior.timestamp).toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to track behavior: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Predict if user will drift from their goals
   */
  async predictDrift(userId: string, daysAhead: number = 7): Promise<RiskPrediction> {
    const response = await fetch(`${this.baseURL}/api/predict-drift/${userId}?days_ahead=${daysAhead}`);

    if (!response.ok) {
      throw new Error(`Failed to predict drift: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get comprehensive behavioral insights for a user
   */
  async getUserInsights(userId: string): Promise<UserInsights> {
    const response = await fetch(`${this.baseURL}/api/user-insights/${userId}`);

    if (!response.ok) {
      throw new Error(`Failed to get user insights: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Track various user actions automatically
   */
  async trackGoalUpdate(userId: string, goalId: string, progressDelta: number): Promise<void> {
    await this.trackBehavior({
      user_id: userId,
      timestamp: new Date().toISOString(),
      action_type: 'goal_update',
      goal_id: goalId,
      progress_delta: progressDelta,
    });
  }

  async trackChatInteraction(userId: string, sessionDuration: number, sentimentScore: number): Promise<void> {
    await this.trackBehavior({
      user_id: userId,
      timestamp: new Date().toISOString(),
      action_type: 'chat',
      session_duration: sessionDuration,
      sentiment_score: sentimentScore,
    });
  }

  async trackDailyCheckin(userId: string): Promise<void> {
    await this.trackBehavior({
      user_id: userId,
      timestamp: new Date().toISOString(),
      action_type: 'checkin',
    });
  }

  async trackAppOpen(userId: string): Promise<void> {
    await this.trackBehavior({
      user_id: userId,
      timestamp: new Date().toISOString(),
      action_type: 'app_open',
    });
  }
}

export const aiClient = new AIClient();

// React hook for using AI predictions
export function useAIPredictions(userId: string | null) {
  const [prediction, setPrediction] = useState<RiskPrediction | null>(null);
  const [insights, setInsights] = useState<UserInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrediction = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const [predictionData, insightsData] = await Promise.all([
        aiClient.predictDrift(userId),
        aiClient.getUserInsights(userId),
      ]);

      setPrediction(predictionData);
      setInsights(insightsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch AI predictions');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPrediction();
  }, [fetchPrediction]);

  return {
    prediction,
    insights,
    loading,
    error,
    refresh: fetchPrediction,
  };
}

// Helper to analyze sentiment from text
export async function analyzeSentiment(text: string): Promise<number> {
  // Simple sentiment analysis - in production, use a proper NLP service
  const positiveWords = ['good', 'great', 'awesome', 'excellent', 'amazing', 'love', 'happy', 'excited'];
  const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'sad', 'frustrated', 'difficult', 'hard'];

  const words = text.toLowerCase().split(/\s+/);
  let score = 0.5; // neutral baseline

  words.forEach(word => {
    if (positiveWords.includes(word)) score += 0.1;
    if (negativeWords.includes(word)) score -= 0.1;
  });

  return Math.max(0, Math.min(1, score)); // clamp between 0 and 1
} 