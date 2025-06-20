import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nsgqhhbqpyvonirlfluv.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zZ3FoaGJxcHl2b25pcmxmbHV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NTY1NTgsImV4cCI6MjA2NTMzMjU1OH0.twGF9Y6clrRtJg_4S1OWHA1vhhYpKzn3ZpFJPGJbmEo'
);

export interface UserEvent {
  id: string;
  user_id: string;
  event_type: string;
  timestamp: string;
  mood: string;
  progress: number;
  meta: {
    energy_level?: number;
    time_of_day?: string;
    challenges?: string;
    wins?: string;
    device?: string;
    goal_progress?: Record<string, number>;
  };
}

export interface BehaviorPattern {
  pattern_type: string;
  confidence: number;
  description: string;
  trend: 'improving' | 'declining' | 'stable';
  risk_level: 'low' | 'medium' | 'high';
  suggested_interventions: string[];
  data_points: number;
}

export interface UserInsight {
  type: 'pattern' | 'prediction' | 'intervention' | 'celebration';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  urgency: 'low' | 'medium' | 'high';
  suggested_actions: string[];
  data_source: string;
}

export class AIPatternAnalyzer {
  private userId: string;
  private events: UserEvent[] = [];
  
  constructor(userId: string) {
    this.userId = userId;
  }

  async loadUserData(days: number = 30): Promise<void> {
    const { data, error } = await supabase
      .from('user_events')
      .select('*')
      .eq('user_id', this.userId)
      .gte('timestamp', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('timestamp', { ascending: false });

    if (error) throw error;
    this.events = data || [];
  }

  // Analyze daily check-in patterns
  analyzeDailyPatterns(): BehaviorPattern[] {
    const patterns: BehaviorPattern[] = [];
    
    // Time-of-day patterns
    const timePattern = this.analyzeTimeOfDayPatterns();
    if (timePattern) patterns.push(timePattern);
    
    // Mood patterns
    const moodPattern = this.analyzeMoodPatterns();
    if (moodPattern) patterns.push(moodPattern);
    
    // Energy patterns
    const energyPattern = this.analyzeEnergyPatterns();
    if (energyPattern) patterns.push(energyPattern);
    
    // Consistency patterns
    const consistencyPattern = this.analyzeConsistencyPatterns();
    if (consistencyPattern) patterns.push(consistencyPattern);
    
    return patterns;
  }

  private analyzeTimeOfDayPatterns(): BehaviorPattern | null {
    const timeData = this.events
      .filter(e => e.meta?.time_of_day)
      .reduce((acc, event) => {
        const time = event.meta.time_of_day!;
        if (!acc[time]) acc[time] = { count: 0, avgProgress: 0, totalProgress: 0 };
        acc[time].count++;
        acc[time].totalProgress += event.progress || 0;
        acc[time].avgProgress = acc[time].totalProgress / acc[time].count;
        return acc;
      }, {} as Record<string, { count: number; avgProgress: number; totalProgress: number }>);

    if (Object.keys(timeData).length < 2) return null;

    const bestTime = Object.entries(timeData)
      .sort(([,a], [,b]) => b.avgProgress - a.avgProgress)[0];
    
    const [timeOfDay, stats] = bestTime;
    const confidence = Math.min(0.9, stats.count / 10); // Higher confidence with more data points
    
    return {
      pattern_type: 'time_optimization',
      confidence,
      description: `You perform ${stats.avgProgress.toFixed(0)}% better during ${timeOfDay} sessions. Consider scheduling important tasks during this time.`,
      trend: stats.avgProgress > 70 ? 'improving' : 'stable',
      risk_level: 'low',
      suggested_interventions: [
        `Block your calendar for ${timeOfDay} focus time`,
        `Schedule your most challenging goals during ${timeOfDay}`,
        `Set up automatic reminders for ${timeOfDay} check-ins`
      ],
      data_points: stats.count
    };
  }

  private analyzeMoodPatterns(): BehaviorPattern | null {
    const moodData = this.events
      .filter(e => e.mood)
      .reduce((acc, event) => {
        const mood = event.mood;
        if (!acc[mood]) acc[mood] = { count: 0, avgProgress: 0, totalProgress: 0 };
        acc[mood].count++;
        acc[mood].totalProgress += event.progress || 0;
        acc[mood].avgProgress = acc[mood].totalProgress / acc[mood].count;
        return acc;
      }, {} as Record<string, { count: number; avgProgress: number; totalProgress: number }>);

    if (Object.keys(moodData).length < 2) return null;

    // Identify mood-progress correlations
    const moodEntries = Object.entries(moodData);
    const negativeMoods = ['tired', 'frustrated', 'down'];
    const negativeCount = moodEntries
      .filter(([mood]) => negativeMoods.includes(mood))
      .reduce((sum, [, data]) => sum + data.count, 0);

    const totalCount = moodEntries.reduce((sum, [, data]) => sum + data.count, 0);
    const negativeRatio = negativeCount / totalCount;

    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    
    if (negativeRatio > 0.4) {
      riskLevel = 'high';
      trend = 'declining';
    } else if (negativeRatio > 0.2) {
      riskLevel = 'medium';
    }

    return {
      pattern_type: 'mood_correlation',
      confidence: Math.min(0.9, totalCount / 15),
      description: `Your mood impacts your progress. ${negativeRatio > 0.3 ? 'High frequency of negative moods detected.' : 'Generally positive mood patterns observed.'}`,
      trend,
      risk_level: riskLevel,
      suggested_interventions: negativeRatio > 0.3 ? [
        'Consider mood-boosting activities before check-ins',
        'Practice gratitude journaling',
        'Schedule easier tasks on low-mood days',
        'Consider speaking with a counselor if patterns persist'
      ] : [
        'Continue your positive mood practices',
        'Document what contributes to your good moods',
        'Share your positive strategies with others'
      ],
      data_points: totalCount
    };
  }

  private analyzeEnergyPatterns(): BehaviorPattern | null {
    const energyData = this.events
      .filter(e => e.meta?.energy_level)
      .map(e => ({
        energy: e.meta.energy_level!,
        progress: e.progress || 0,
        date: new Date(e.timestamp)
      }));

    if (energyData.length < 5) return null;

    const avgEnergy = energyData.reduce((sum, d) => sum + d.energy, 0) / energyData.length;
    const energyProgressCorrelation = this.calculateCorrelation(
      energyData.map(d => d.energy),
      energyData.map(d => d.progress)
    );

    const recentEnergy = energyData.slice(0, 7).reduce((sum, d) => sum + d.energy, 0) / Math.min(7, energyData.length);
    const trend = recentEnergy > avgEnergy ? 'improving' : recentEnergy < avgEnergy - 1 ? 'declining' : 'stable';

    return {
      pattern_type: 'energy_optimization',
      confidence: Math.min(0.9, energyData.length / 20),
      description: `Your energy levels ${energyProgressCorrelation > 0.3 ? 'strongly correlate' : 'moderately correlate'} with your progress. Average energy: ${avgEnergy.toFixed(1)}/10.`,
      trend,
      risk_level: avgEnergy < 4 ? 'high' : avgEnergy < 6 ? 'medium' : 'low',
      suggested_interventions: avgEnergy < 5 ? [
        'Prioritize sleep quality and duration',
        'Consider your nutrition and hydration',
        'Schedule regular exercise or movement',
        'Evaluate your workload and stress levels'
      ] : [
        'Maintain your current energy management practices',
        'Consider tracking what boosts your energy',
        'Share your energy optimization strategies'
      ],
      data_points: energyData.length
    };
  }

  private analyzeConsistencyPatterns(): BehaviorPattern | null {
    if (this.events.length < 7) return null;

    const dailyCheckIns = this.events.filter(e => e.event_type === 'daily_check_in');
    const last30Days = 30;
    const expectedCheckIns = Math.min(last30Days, Math.floor((Date.now() - new Date(dailyCheckIns[dailyCheckIns.length - 1]?.timestamp || Date.now()).getTime()) / (1000 * 60 * 60 * 24)));
    
    const consistencyRate = dailyCheckIns.length / expectedCheckIns;
    const recentConsistency = dailyCheckIns.slice(0, 7).length / 7;

    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    let trend: 'improving' | 'declining' | 'stable' = 'stable';

    if (consistencyRate < 0.3) {
      riskLevel = 'high';
      trend = 'declining';
    } else if (consistencyRate < 0.6) {
      riskLevel = 'medium';
    }

    if (recentConsistency > consistencyRate + 0.2) {
      trend = 'improving';
    } else if (recentConsistency < consistencyRate - 0.2) {
      trend = 'declining';
    }

    return {
      pattern_type: 'consistency_tracking',
      confidence: 0.95,
      description: `Your check-in consistency is ${(consistencyRate * 100).toFixed(0)}%. Recent week: ${(recentConsistency * 100).toFixed(0)}%.`,
      trend,
      risk_level: riskLevel,
      suggested_interventions: consistencyRate < 0.5 ? [
        'Set up daily reminders at your optimal time',
        'Lower the barrier: create a 2-minute check-in version',
        'Find an accountability partner',
        'Celebrate small wins to build momentum'
      ] : [
        'Maintain your current routine',
        'Consider helping others build consistency',
        'Document what makes you consistent'
      ],
      data_points: dailyCheckIns.length
    };
  }

  // Predict goal abandonment risk
  predictGoalAbandonmentRisk(): UserInsight[] {
    const insights: UserInsight[] = [];
    const patterns = this.analyzeDailyPatterns();
    
    // High-risk patterns
    const highRiskPatterns = patterns.filter(p => p.risk_level === 'high');
    if (highRiskPatterns.length > 0) {
      insights.push({
        type: 'prediction',
        title: 'Goal Abandonment Risk Detected',
        description: `${highRiskPatterns.length} high-risk patterns detected. ${highRiskPatterns.map(p => p.description).join(' ')}`,
        confidence: Math.max(...highRiskPatterns.map(p => p.confidence)),
        actionable: true,
        urgency: 'high',
        suggested_actions: highRiskPatterns.flatMap(p => p.suggested_interventions).slice(0, 3),
        data_source: 'behavioral_analysis'
      });
    }

    // Declining trends
    const decliningPatterns = patterns.filter(p => p.trend === 'declining');
    if (decliningPatterns.length > 0) {
      insights.push({
        type: 'intervention',
        title: 'Performance Decline Detected',
        description: `Your ${decliningPatterns.map(p => p.pattern_type).join(' and ')} showing declining trends.`,
        confidence: Math.max(...decliningPatterns.map(p => p.confidence)),
        actionable: true,
        urgency: 'medium',
        suggested_actions: decliningPatterns.flatMap(p => p.suggested_interventions).slice(0, 3),
        data_source: 'trend_analysis'
      });
    }

    // Positive patterns to celebrate
    const improvingPatterns = patterns.filter(p => p.trend === 'improving');
    if (improvingPatterns.length > 0) {
      insights.push({
        type: 'celebration',
        title: 'Positive Momentum Detected',
        description: `Your ${improvingPatterns.map(p => p.pattern_type).join(' and ')} are improving!`,
        confidence: Math.max(...improvingPatterns.map(p => p.confidence)),
        actionable: true,
        urgency: 'low',
        suggested_actions: [
          'Document what\'s working well',
          'Consider sharing your success strategies',
          'Maintain your current positive practices'
        ],
        data_source: 'success_analysis'
      });
    }

    return insights;
  }

  // Generate personalized interventions
  generateInterventions(): UserInsight[] {
    const patterns = this.analyzeDailyPatterns();
    const interventions: UserInsight[] = [];

    // Time-based interventions
    const timePattern = patterns.find(p => p.pattern_type === 'time_optimization');
    if (timePattern && timePattern.confidence > 0.6) {
      interventions.push({
        type: 'intervention',
        title: 'Optimize Your Schedule',
        description: timePattern.description,
        confidence: timePattern.confidence,
        actionable: true,
        urgency: 'medium',
        suggested_actions: timePattern.suggested_interventions,
        data_source: 'time_analysis'
      });
    }

    // Energy-based interventions
    const energyPattern = patterns.find(p => p.pattern_type === 'energy_optimization');
    if (energyPattern && energyPattern.risk_level !== 'low') {
      interventions.push({
        type: 'intervention',
        title: 'Energy Management',
        description: energyPattern.description,
        confidence: energyPattern.confidence,
        actionable: true,
        urgency: energyPattern.risk_level === 'high' ? 'high' : 'medium',
        suggested_actions: energyPattern.suggested_interventions,
        data_source: 'energy_analysis'
      });
    }

    return interventions;
  }

  // Utility function to calculate correlation
  private calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0;
    
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  }

  // Get comprehensive analysis
  async getComprehensiveAnalysis(): Promise<{
    patterns: BehaviorPattern[];
    insights: UserInsight[];
    riskAssessment: {
      overall_risk: 'low' | 'medium' | 'high';
      risk_factors: string[];
      protective_factors: string[];
    };
  }> {
    await this.loadUserData();
    
    const patterns = this.analyzeDailyPatterns();
    const riskInsights = this.predictGoalAbandonmentRisk();
    const interventions = this.generateInterventions();
    const insights = [...riskInsights, ...interventions];

    // Calculate overall risk
    const highRiskCount = patterns.filter(p => p.risk_level === 'high').length;
    const mediumRiskCount = patterns.filter(p => p.risk_level === 'medium').length;
    
    let overallRisk: 'low' | 'medium' | 'high' = 'low';
    if (highRiskCount > 0) overallRisk = 'high';
    else if (mediumRiskCount > 1) overallRisk = 'medium';

    const riskFactors = patterns
      .filter(p => p.risk_level !== 'low')
      .map(p => p.description);

    const protectiveFactors = patterns
      .filter(p => p.trend === 'improving' || p.risk_level === 'low')
      .map(p => p.description);

    return {
      patterns,
      insights,
      riskAssessment: {
        overall_risk: overallRisk,
        risk_factors: riskFactors,
        protective_factors: protectiveFactors
      }
    };
  }
}

// Utility functions for external use
export async function analyzeUserPatterns(userId: string): Promise<BehaviorPattern[]> {
  const analyzer = new AIPatternAnalyzer(userId);
  await analyzer.loadUserData();
  return analyzer.analyzeDailyPatterns();
}

export async function predictUserRisk(userId: string): Promise<UserInsight[]> {
  const analyzer = new AIPatternAnalyzer(userId);
  await analyzer.loadUserData();
  return analyzer.predictGoalAbandonmentRisk();
}

export async function generateUserInterventions(userId: string): Promise<UserInsight[]> {
  const analyzer = new AIPatternAnalyzer(userId);
  await analyzer.loadUserData();
  return analyzer.generateInterventions();
} 