import { supabase } from './supabase';
import universalStorage from './storage';

export interface PatternInsight {
  id: string;
  title: string;
  description: string;
  confidence: number;
  category: 'mood' | 'energy' | 'productivity' | 'behavioral' | 'temporal' | 'correlation' | 'prediction';
  actionable: boolean;
  recommendations: string[];
  metadata?: Record<string, any>;
}

export interface BehaviorPattern {
  type: string;
  frequency: number;
  timeOfDay: string[];
  dayOfWeek: string[];
  correlation: number;
  description: string;
  confidence: number;
  relatedMetrics: string[];
}

interface TimeSeriesPoint {
  value: number;
  timestamp: Date;
}

interface Correlation {
  metric1: string;
  metric2: string;
  coefficient: number;
  confidence: number;
  description: string;
}

export class PatternRecognitionEngine {
  
  /**
   * Analyze user check-ins to extract meaningful patterns
   */
  static async analyzeUserPatterns(userId?: string): Promise<PatternInsight[]> {
    try {
      const checkins = await this.getRecentCheckins(userId);
      
      if (checkins.length < 3) {
        return [{
          id: 'insufficient_data',
          title: 'Building Your Pattern Profile',
          description: 'Keep checking in daily to unlock personalized insights about your habits and trends.',
          confidence: 1.0,
          category: 'behavioral',
          actionable: true,
          recommendations: ['Complete daily check-ins for 7 days', 'Be consistent with timing', 'Add detailed reflections']
        }];
      }

      const insights: PatternInsight[] = [];

      // Core Pattern Analysis
      const moodInsights = await this.analyzeMoodPatterns(checkins);
      const energyInsights = await this.analyzeEnergyPatterns(checkins);
      const temporalInsights = await this.analyzeTemporalPatterns(checkins);
      const productivityInsights = await this.analyzeProductivityPatterns(checkins);

      insights.push(...moodInsights, ...energyInsights, ...temporalInsights, ...productivityInsights);

      // Advanced Analysis
      const correlationInsights = await this.analyzeCorrelations(checkins);
      const timeSeriesInsights = await this.analyzeTimeSeries(checkins);
      const behavioralClusters = await this.analyzeBehavioralClusters(checkins);
      const predictions = await this.generatePredictions(checkins);

      insights.push(...correlationInsights, ...timeSeriesInsights, ...behavioralClusters, ...predictions);

      // Sort by confidence and limit to most relevant
      return this.prioritizeInsights(insights);
      
    } catch (error) {
      console.error('Error analyzing patterns:', error);
      return this.getFallbackInsights();
    }
  }

  /**
   * Generate smart suggestions based on patterns
   */
  static async generateSmartSuggestions(userId?: string): Promise<string[]> {
    try {
      const patterns = await this.analyzeUserPatterns(userId);
      const suggestions: string[] = [];

      for (const pattern of patterns) {
        if (pattern.actionable && pattern.confidence > 0.6) {
          suggestions.push(...pattern.recommendations);
        }
      }

      // Add time-aware suggestions
      const now = new Date();
      const hour = now.getHours();
      
      if (hour < 10) {
        suggestions.push('🌅 Morning energy boost: Try a 5-minute walk or stretching routine');
      } else if (hour < 14) {
        suggestions.push('⚡ Midday momentum: Tackle your most important task now');
      } else if (hour < 18) {
        suggestions.push('🎯 Afternoon focus: Time for deep work or planning');
      } else {
        suggestions.push('🌙 Evening reflection: Review your wins and plan tomorrow');
      }

      return suggestions.slice(0, 5); // Return top 5 suggestions
      
    } catch (error) {
      console.error('Error generating suggestions:', error);
      return [
        'Complete your daily check-in to track progress',
        'Set one specific goal for today',
        'Take breaks every 90 minutes',
        'Celebrate small wins along the way'
      ];
    }
  }

  private static async getRecentCheckins(userId?: string) {
    try {
      const { data, error } = await supabase
        .from('checkins')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) throw error;
      return data || [];
      
    } catch (error) {
      console.error('Error fetching checkins:', error);
      return [];
    }
  }

  private static async analyzeMoodPatterns(checkins: any[]): Promise<PatternInsight[]> {
    const insights: PatternInsight[] = [];
    const moods = checkins.map(c => c.mood).filter(m => m !== undefined);
    
    if (moods.length === 0) return insights;

    const avgMood = moods.reduce((sum, mood) => sum + mood, 0) / moods.length;
    const moodTrend = this.calculateTrend(moods);
    const moodVariability = this.calculateVariability(moods);
    const weekdayMoods = this.groupByWeekday(checkins, 'mood');
    const timeOfDayMoods = this.groupByTimeOfDay(checkins, 'mood');

    // Analyze overall mood level
    if (avgMood >= 4) {
      insights.push({
        id: 'positive_mood',
        title: 'Consistently Positive Mood',
        description: `Your average mood is ${avgMood.toFixed(1)}/5, showing strong emotional well-being.`,
        confidence: 0.8,
        category: 'mood',
        actionable: true,
        recommendations: [
          'Continue current positive habits',
          'Share what works with others',
          'Plan for challenging days'
        ],
        metadata: { avgMood, moodTrend, moodVariability }
      });
    } else if (avgMood <= 2.5) {
      insights.push({
        id: 'low_mood_pattern',
        title: 'Mood Support Needed',
        description: `Your mood has been averaging ${avgMood.toFixed(1)}/5. Let's find ways to boost your well-being.`,
        confidence: 0.9,
        category: 'mood',
        actionable: true,
        recommendations: [
          'Consider talking to someone you trust',
          'Try a daily gratitude practice',
          'Schedule enjoyable activities',
          'Review sleep and exercise habits'
        ],
        metadata: { avgMood, moodTrend, moodVariability }
      });
    }

    // Analyze mood trends
    if (moodTrend > 0.1) {
      insights.push({
        id: 'improving_mood',
        title: 'Mood is Improving! 📈',
        description: 'Your mood shows a positive upward trend. Keep building on this momentum!',
        confidence: 0.7,
        category: 'mood',
        actionable: true,
        recommendations: [
          'Keep doing what you\'re doing',
          'Note what activities boost your mood',
          'Plan to maintain this momentum'
        ],
        metadata: { moodTrend, timeOfDayMoods, weekdayMoods }
      });
    } else if (moodTrend < -0.1) {
      insights.push({
        id: 'declining_mood',
        title: 'Mood Trend Alert',
        description: 'I\'ve noticed a slight downward trend in your mood. Let\'s work on this together.',
        confidence: 0.75,
        category: 'mood',
        actionable: true,
        recommendations: [
          'Review recent changes or stressors',
          'Focus on self-care activities',
          'Consider talking to a supportive friend',
          'Try mood-boosting activities'
        ],
        metadata: { moodTrend, timeOfDayMoods, weekdayMoods }
      });
    }

    // Analyze mood variability
    if (moodVariability > 1.5) {
      insights.push({
        id: 'mood_variability',
        title: 'Mood Fluctuations Detected',
        description: 'Your mood shows significant variations. Understanding these patterns can help stabilize your well-being.',
        confidence: 0.8,
        category: 'mood',
        actionable: true,
        recommendations: [
          'Track mood triggers',
          'Establish consistent routines',
          'Practice stress management',
          'Consider mood stabilizing activities'
        ],
        metadata: { moodVariability, timeOfDayMoods, weekdayMoods }
      });
    }

    return insights;
  }

  private static async analyzeEnergyPatterns(checkins: any[]): Promise<PatternInsight[]> {
    const insights: PatternInsight[] = [];
    const energyLevels = checkins.map(c => c.energy).filter(e => e !== undefined);
    
    if (energyLevels.length === 0) return insights;

    const avgEnergy = energyLevels.reduce((sum, energy) => sum + energy, 0) / energyLevels.length;

    if (avgEnergy >= 4) {
      insights.push({
        id: 'high_energy',
        title: 'High Energy Levels ⚡',
        description: `You maintain excellent energy levels (${avgEnergy.toFixed(1)}/5). Use this to tackle important goals!`,
        confidence: 0.8,
        category: 'energy',
        actionable: true,
        recommendations: ['Schedule demanding tasks during peak energy', 'Share your energy strategies', 'Plan challenging projects']
      });
    } else if (avgEnergy <= 2.5) {
      insights.push({
        id: 'low_energy_pattern',
        title: 'Energy Optimization Needed',
        description: `Your energy averages ${avgEnergy.toFixed(1)}/5. Let's boost your vitality!`,
        confidence: 0.9,
        category: 'energy',
        actionable: true,
        recommendations: ['Review sleep quality and duration', 'Consider nutrition and hydration', 'Add short movement breaks', 'Manage stress levels']
      });
    }

    return insights;
  }

  private static async analyzeTemporalPatterns(checkins: any[]): Promise<PatternInsight[]> {
    const insights: PatternInsight[] = [];
    
    // Analyze check-in timing
    const checkInTimes = checkins.map(c => {
      const date = new Date(c.date || c.created_at);
      return date.getHours();
    });

    const avgCheckInTime = checkInTimes.reduce((sum, hour) => sum + hour, 0) / checkInTimes.length;

    if (avgCheckInTime < 10) {
      insights.push({
        id: 'morning_person',
        title: 'You\'re a Morning Person! 🌅',
        description: 'You consistently check in early, showing great morning discipline.',
        confidence: 0.8,
        category: 'temporal',
        actionable: true,
        recommendations: ['Schedule important tasks in the morning', 'Protect your morning routine', 'Use early hours for deep work']
      });
    } else if (avgCheckInTime > 18) {
      insights.push({
        id: 'evening_person',
        title: 'Evening Reflection Habit 🌙',
        description: 'You prefer evening check-ins, showing good end-of-day reflection.',
        confidence: 0.8,
        category: 'temporal',
        actionable: true,
        recommendations: ['Use evenings for planning next day', 'Create calming evening routine', 'Process the day\'s experiences']
      });
    }

    return insights;
  }

  private static async analyzeProductivityPatterns(checkins: any[]): Promise<PatternInsight[]> {
    const insights: PatternInsight[] = [];
    
    // Analyze wins and achievements
    const winsData = checkins.filter(c => c.wins && c.wins.trim().length > 0);
    const winRate = winsData.length / checkins.length;

    if (winRate > 0.7) {
      insights.push({
        id: 'high_achievement',
        title: 'High Achievement Rate 🏆',
        description: `You record wins in ${(winRate * 100).toFixed(0)}% of your check-ins. Excellent progress tracking!`,
        confidence: 0.9,
        category: 'productivity',
        actionable: true,
        recommendations: ['Continue celebrating wins', 'Set progressively bigger goals', 'Share your success strategies']
      });
    } else if (winRate < 0.3) {
      insights.push({
        id: 'wins_opportunity',
        title: 'More Wins to Celebrate',
        description: 'Consider recording more daily wins to boost motivation and track progress.',
        confidence: 0.7,
        category: 'productivity',
        actionable: true,
        recommendations: ['Look for small daily accomplishments', 'Count learning as wins', 'Celebrate effort, not just results']
      });
    }

    return insights;
  }

  private static async analyzeCorrelations(checkins: any[]): Promise<PatternInsight[]> {
    const insights: PatternInsight[] = [];
    
    // Analyze mood-energy correlation
    const moodEnergyPairs = checkins
      .filter(c => c.mood !== undefined && c.energy !== undefined)
      .map(c => ({ mood: c.mood, energy: c.energy }));

    if (moodEnergyPairs.length > 3) {
      const correlation = this.calculateCorrelation(
        moodEnergyPairs.map(p => p.mood),
        moodEnergyPairs.map(p => p.energy)
      );

      if (correlation > 0.7) {
        insights.push({
          id: 'mood_energy_link',
          title: 'Strong Mood-Energy Connection',
          description: 'Your mood and energy levels are closely linked. Boosting one helps the other!',
          confidence: 0.8,
          category: 'behavioral',
          actionable: true,
          recommendations: ['Focus on activities that boost both mood and energy', 'Use energy management for mood regulation', 'Plan mood-boosting activities']
        });
      }
    }

    return insights;
  }

  private static async analyzeTimeSeries(checkins: any[]): Promise<PatternInsight[]> {
    const insights: PatternInsight[] = [];
    
    // Convert check-ins to time series format
    const moodSeries = checkins.map(c => ({
      value: c.mood,
      timestamp: new Date(c.date || c.created_at)
    }));

    const energySeries = checkins.map(c => ({
      value: c.energy,
      timestamp: new Date(c.date || c.created_at)
    }));

    // Detect cycles and patterns
    const moodCycles = this.detectCycles(moodSeries);
    const energyCycles = this.detectCycles(energySeries);

    if (moodCycles.weekly) {
      insights.push({
        id: 'weekly_mood_cycle',
        title: 'Weekly Mood Pattern Detected',
        description: 'Your mood follows a weekly cycle. Understanding this can help you plan and prepare.',
        confidence: 0.75,
        category: 'temporal',
        actionable: true,
        recommendations: [
          'Plan uplifting activities for typically lower days',
          'Take advantage of your naturally better days',
          'Prepare support strategies for predicted dips'
        ],
        metadata: { moodCycles }
      });
    }

    if (energyCycles.weekly) {
      insights.push({
        id: 'weekly_energy_cycle',
        title: 'Weekly Energy Pattern Found',
        description: 'Your energy levels follow a predictable weekly pattern.',
        confidence: 0.75,
        category: 'temporal',
        actionable: true,
        recommendations: [
          'Schedule demanding tasks during high-energy periods',
          'Plan rest and recovery during low-energy times',
          'Maintain consistent sleep schedule'
        ],
        metadata: { energyCycles }
      });
    }

    return insights;
  }

  private static async analyzeBehavioralClusters(checkins: any[]): Promise<PatternInsight[]> {
    const insights: PatternInsight[] = [];
    
    // Group similar behaviors and patterns
    const clusters = this.clusterBehaviors(checkins);
    
    clusters.forEach(cluster => {
      if (cluster.confidence > 0.7) {
        insights.push({
          id: `cluster_${cluster.type}`,
          title: `${cluster.type} Pattern Identified`,
          description: cluster.description,
          confidence: cluster.confidence,
          category: 'behavioral',
          actionable: true,
          recommendations: this.generateClusterRecommendations(cluster),
          metadata: { cluster }
        });
      }
    });

    return insights;
  }

  private static async generatePredictions(checkins: any[]): Promise<PatternInsight[]> {
    const insights: PatternInsight[] = [];
    
    // Generate predictions for next week
    const predictions = this.predictNextWeek(checkins);
    
    if (predictions.confidence > 0.7) {
      insights.push({
        id: 'next_week_prediction',
        title: 'Next Week\'s Forecast',
        description: `Based on your patterns, here's what to expect next week: ${predictions.summary}`,
        confidence: predictions.confidence,
        category: 'prediction',
        actionable: true,
        recommendations: [
          'Prepare for predicted challenges',
          'Take advantage of optimal times',
          'Plan around energy forecasts'
        ],
        metadata: { predictions }
      });
    }

    return insights;
  }

  // Helper functions for advanced analysis
  private static calculateVariability(values: number[]): number {
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - avg, 2));
    return Math.sqrt(squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length);
  }

  private static groupByWeekday(checkins: any[], metric: string): Record<string, number> {
    const weekdays: Record<string, number[]> = {
      'Sunday': [], 'Monday': [], 'Tuesday': [], 'Wednesday': [],
      'Thursday': [], 'Friday': [], 'Saturday': []
    };

    checkins.forEach(checkin => {
      const date = new Date(checkin.date || checkin.created_at);
      const day = date.toLocaleDateString('en-US', { weekday: 'long' });
      if (checkin[metric] !== undefined) {
        weekdays[day].push(checkin[metric]);
      }
    });

    return Object.fromEntries(
      Object.entries(weekdays).map(([day, values]) => [
        day,
        values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0
      ])
    );
  }

  private static groupByTimeOfDay(checkins: any[], metric: string): Record<string, number> {
    const timeSlots: Record<string, number[]> = {
      'morning': [], 'afternoon': [], 'evening': [], 'night': []
    };

    checkins.forEach(checkin => {
      const date = new Date(checkin.date || checkin.created_at);
      const hour = date.getHours();
      let timeSlot = 'night';
      if (hour >= 5 && hour < 12) timeSlot = 'morning';
      else if (hour >= 12 && hour < 17) timeSlot = 'afternoon';
      else if (hour >= 17 && hour < 22) timeSlot = 'evening';

      if (checkin[metric] !== undefined) {
        timeSlots[timeSlot].push(checkin[metric]);
      }
    });

    return Object.fromEntries(
      Object.entries(timeSlots).map(([slot, values]) => [
        slot,
        values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0
      ])
    );
  }

  private static detectCycles(series: TimeSeriesPoint[]): Record<string, boolean> {
    // Simple cycle detection for demo
    return {
      daily: this.hasDailyCycle(series),
      weekly: this.hasWeeklyCycle(series),
      monthly: this.hasMonthlyCycle(series)
    };
  }

  private static hasDailyCycle(series: TimeSeriesPoint[]): boolean {
    // Implement daily cycle detection
    return false; // Placeholder
  }

  private static hasWeeklyCycle(series: TimeSeriesPoint[]): boolean {
    if (series.length < 14) return false; // Need at least 2 weeks of data
    
    // Group by day of week and check for patterns
    const dayAverages = this.groupByWeekday(
      series.map(point => ({
        date: point.timestamp,
        value: point.value
      })),
      'value'
    );

    // Calculate variance between days
    const values = Object.values(dayAverages);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;

    return variance > 0.5; // Threshold for considering it a cycle
  }

  private static hasMonthlyCycle(series: TimeSeriesPoint[]): boolean {
    // Implement monthly cycle detection
    return false; // Placeholder
  }

  private static clusterBehaviors(checkins: any[]): BehaviorPattern[] {
    const patterns: BehaviorPattern[] = [];
    
    // Analyze morning vs evening patterns
    const morningCheckins = checkins.filter(c => {
      const hour = new Date(c.date || c.created_at).getHours();
      return hour >= 5 && hour < 12;
    });

    const eveningCheckins = checkins.filter(c => {
      const hour = new Date(c.date || c.created_at).getHours();
      return hour >= 17 && hour < 22;
    });

    if (morningCheckins.length > checkins.length * 0.6) {
      patterns.push({
        type: 'Morning Person',
        frequency: morningCheckins.length / checkins.length,
        timeOfDay: ['morning'],
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        correlation: 0.8,
        description: 'Strong preference for morning activities and check-ins',
        confidence: 0.85,
        relatedMetrics: ['energy', 'productivity']
      });
    }

    if (eveningCheckins.length > checkins.length * 0.6) {
      patterns.push({
        type: 'Evening Person',
        frequency: eveningCheckins.length / checkins.length,
        timeOfDay: ['evening'],
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        correlation: 0.8,
        description: 'Strong preference for evening activities and check-ins',
        confidence: 0.85,
        relatedMetrics: ['mood', 'stress']
      });
    }

    return patterns;
  }

  private static generateClusterRecommendations(cluster: BehaviorPattern): string[] {
    const recommendations: string[] = [];
    
    switch (cluster.type) {
      case 'Morning Person':
        recommendations.push(
          'Schedule important tasks in the morning',
          'Protect your morning routine',
          'Use early hours for deep work',
          'Plan evening wind-down routine'
        );
        break;
      case 'Evening Person':
        recommendations.push(
          'Schedule creative work in the evening',
          'Use mornings for planning and light tasks',
          'Optimize your evening energy',
          'Create a productive night routine'
        );
        break;
      default:
        recommendations.push(
          'Build consistent daily routines',
          'Track your most productive hours',
          'Align activities with your natural rhythm'
        );
    }

    return recommendations;
  }

  private static predictNextWeek(checkins: any[]): { summary: string; confidence: number } {
    if (checkins.length < 14) {
      return {
        summary: 'Need more data for accurate predictions',
        confidence: 0.5
      };
    }

    // Analyze patterns to predict next week
    const weekdayMoods = this.groupByWeekday(checkins, 'mood');
    const weekdayEnergy = this.groupByWeekday(checkins, 'energy');

    let summary = 'Based on your patterns: ';
    let confidence = 0.7;

    // Find best and worst days
    const bestMoodDay = Object.entries(weekdayMoods)
      .reduce((a, b) => a[1] > b[1] ? a : b)[0];
    const lowestEnergyDay = Object.entries(weekdayEnergy)
      .reduce((a, b) => a[1] < b[1] ? a : b)[0];

    summary += `Expect higher mood on ${bestMoodDay} and lower energy on ${lowestEnergyDay}. `;

    return { summary, confidence };
  }

  private static prioritizeInsights(insights: PatternInsight[]): PatternInsight[] {
    // Sort by confidence and relevance
    return insights
      .sort((a, b) => {
        // Prioritize actionable insights
        if (a.actionable && !b.actionable) return -1;
        if (!a.actionable && b.actionable) return 1;
        
        // Then sort by confidence
        return b.confidence - a.confidence;
      })
      .slice(0, 8); // Limit to top 8 most relevant insights
  }

  private static calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    const recent = values.slice(0, Math.floor(values.length / 2));
    const older = values.slice(Math.floor(values.length / 2));
    
    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length;
    
    return recentAvg - olderAvg;
  }

  private static calculateCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
    const sumY2 = y.reduce((sum, val) => sum + val * val, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  private static getFallbackInsights(): PatternInsight[] {
    return [
      {
        id: 'building_habits',
        title: 'Building Strong Habits 💪',
        description: 'You\'re developing a consistent check-in routine. This self-awareness is the foundation of growth!',
        confidence: 0.8,
        category: 'behavioral',
        actionable: true,
        recommendations: ['Continue daily check-ins', 'Set specific daily goals', 'Track progress weekly']
      },
      {
        id: 'mindful_tracking',
        title: 'Mindful Self-Tracking',
        description: 'Your commitment to tracking shows dedication to personal growth and self-improvement.',
        confidence: 0.9,
        category: 'behavioral',
        actionable: true,
        recommendations: ['Use insights to guide decisions', 'Share learnings with others', 'Adjust strategies based on patterns']
      }
    ];
  }
}

export default PatternRecognitionEngine; 