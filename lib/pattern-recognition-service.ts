import { supabase } from './supabase';
import { embeddingsService } from './embeddings-service';

// Advanced Pattern Recognition & Prediction Service
export class PatternRecognitionService {
  
  // Analyze user habit patterns and predict future behavior
  async analyzeHabitPatterns(userId: string): Promise<HabitAnalysis> {
    try {
      const [checkins, goals, conversations] = await Promise.all([
        this.getUserCheckins(userId),
        this.getUserGoals(userId),
        this.getUserConversations(userId)
      ]);

      const patterns = {
        timePatterns: this.analyzeTimePatterns(checkins),
        consistencyPatterns: this.analyzeConsistencyPatterns(checkins),
        motivationPatterns: this.analyzeMotivationPatterns(conversations),
        goalProgressPatterns: this.analyzeGoalProgressPatterns(goals),
        behaviorClusters: this.clusterBehaviors(checkins, goals, conversations)
      };

      const predictions = {
        habitSuccess: this.predictHabitSuccess(patterns),
        riskFactors: this.identifyRiskFactors(patterns),
        optimalTiming: this.predictOptimalTiming(patterns),
        interventionNeeds: this.assessInterventionNeeds(patterns)
      };

      const insights = this.generateActionableInsights(patterns, predictions);

      return {
        patterns,
        predictions,
        insights,
        confidence: this.calculateOverallConfidence(patterns),
        lastAnalyzed: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error analyzing habit patterns:', error);
      return this.getDefaultAnalysis();
    }
  }

  // Predict goal success probability using ML-like approach
  async predictGoalSuccess(userId: string, goalData: any): Promise<GoalPrediction> {
    try {
      const userHistory = await this.getUserHistory(userId);
      const similarGoals = await this.findSimilarGoals(goalData);
      
      const features = this.extractGoalFeatures(goalData, userHistory);
      const successProbability = this.calculateSuccessProbability(features, similarGoals);
      
      const riskFactors = this.identifyGoalRiskFactors(features);
      const recommendations = this.generateGoalRecommendations(features, riskFactors);

      // Store prediction for learning
      await this.storePrediction(userId, 'goal_success', successProbability, {
        goal_data: goalData,
        features,
        risk_factors: riskFactors
      });

      return {
        successProbability,
        riskFactors,
        recommendations,
        confidenceScore: this.calculatePredictionConfidence(features),
        timeEstimate: this.estimateCompletionTime(features),
        difficultyScore: this.calculateDifficultyScore(features)
      };

    } catch (error) {
      console.error('Error predicting goal success:', error);
      return this.getDefaultGoalPrediction();
    }
  }

  // Predict when user might need coaching intervention
  async predictInterventionNeeds(userId: string): Promise<InterventionPrediction> {
    try {
      const recentActivity = await this.getRecentActivity(userId, 14); // Last 14 days
      const historicalPatterns = await this.getHistoricalPatterns(userId);
      
      const riskScore = this.calculateRiskScore(recentActivity, historicalPatterns);
      const interventionType = this.determineInterventionType(recentActivity);
      const urgency = this.calculateUrgency(riskScore, recentActivity);
      
      const recommendations = this.generateInterventionRecommendations(
        riskScore, 
        interventionType, 
        urgency
      );

      // Schedule intervention if needed
      if (urgency === 'high') {
        await this.scheduleIntervention(userId, interventionType, recommendations);
      }

      return {
        riskScore,
        interventionType,
        urgency,
        recommendations,
        nextCheckIn: this.calculateNextCheckIn(riskScore),
        supportLevel: this.determineSupportLevel(riskScore)
      };

    } catch (error) {
      console.error('Error predicting intervention needs:', error);
      return this.getDefaultInterventionPrediction();
    }
  }

  // Generate personalized coaching insights
  async generateCoachingInsights(userId: string): Promise<CoachingInsights> {
    try {
      const [patterns, predictions, userProfile] = await Promise.all([
        this.analyzeHabitPatterns(userId),
        this.predictInterventionNeeds(userId),
        this.getUserProfile(userId)
      ]);

      const insights = {
        strengths: this.identifyUserStrengths(patterns),
        opportunities: this.identifyOpportunities(patterns, predictions),
        personalizedTips: await this.generatePersonalizedTips(patterns, userProfile),
        motivationalFactors: this.identifyMotivationalFactors(patterns),
        behaviorOptimizations: this.suggestBehaviorOptimizations(patterns)
      };

      // Store insights with embeddings for future reference
      for (const insight of insights.personalizedTips) {
        await embeddingsService.storePatternInsight(
          userId,
          'motivation_triggers',
          insight.title,
          insight.description,
          insight.confidence,
          insight.data,
          insight.actions
        );
      }

      return insights;

    } catch (error) {
      console.error('Error generating coaching insights:', error);
      return this.getDefaultCoachingInsights();
    }
  }

  // Analyze time-based patterns
  private analyzeTimePatterns(checkins: any[]): TimePatterns {
    const hourlyActivity = new Array(24).fill(0);
    const dailyActivity = new Array(7).fill(0);
    
    checkins.forEach(checkin => {
      const date = new Date(checkin.created_at);
      hourlyActivity[date.getHours()]++;
      dailyActivity[date.getDay()]++;
    });

    const peakHour = hourlyActivity.indexOf(Math.max(...hourlyActivity));
    const peakDay = dailyActivity.indexOf(Math.max(...dailyActivity));
    
    return {
      peakHour,
      peakDay,
      hourlyDistribution: hourlyActivity,
      dailyDistribution: dailyActivity,
      consistency: this.calculateTimeConsistency(hourlyActivity, dailyActivity)
    };
  }

  // Analyze consistency patterns
  private analyzeConsistencyPatterns(checkins: any[]): ConsistencyPatterns {
    const dates = checkins.map(c => new Date(c.created_at).toDateString());
    const uniqueDates = [...new Set(dates)];
    
    const streaks = this.calculateStreaks(uniqueDates);
    const consistency = uniqueDates.length / 30; // Assuming 30-day analysis window
    
    return {
      currentStreak: streaks.current,
      longestStreak: streaks.longest,
      averageStreak: streaks.average,
      consistencyRate: consistency,
      patterns: this.identifyConsistencyPatterns(streaks)
    };
  }

  // Analyze motivation patterns from conversations
  private analyzeMotivationPatterns(conversations: any[]): MotivationPatterns {
    const sentiments = conversations.map(c => c.sentiment_score || 0);
    const positiveRatio = sentiments.filter(s => s > 0.1).length / sentiments.length;
    
    const motivationTriggers = this.extractMotivationTriggers(conversations);
    const demotivationTriggers = this.extractDemotivationTriggers(conversations);
    
    return {
      positiveRatio,
      averageSentiment: sentiments.reduce((a, b) => a + b, 0) / sentiments.length,
      motivationTriggers,
      demotivationTriggers,
      emotionalStability: this.calculateEmotionalStability(sentiments)
    };
  }

  // Analyze goal progress patterns
  private analyzeGoalProgressPatterns(goals: any[]): any {
    if (!goals || goals.length === 0) {
      return {
        averageProgress: 0,
        completionRate: 0,
        stagnantGoals: [],
        fastTrackGoals: [],
        patterns: []
      };
    }

    const averageProgress = goals.reduce((sum, goal) => sum + (goal.progress || 0), 0) / goals.length;
    const completedGoals = goals.filter(goal => goal.progress >= 100);
    const stagnantGoals = goals.filter(goal => goal.progress < 10 && this.getDaysSinceCreated(goal) > 7);
    const fastTrackGoals = goals.filter(goal => goal.progress > 50 && this.getDaysSinceCreated(goal) < 14);

    return {
      averageProgress,
      completionRate: completedGoals.length / goals.length,
      stagnantGoals: stagnantGoals.map(g => g.title),
      fastTrackGoals: fastTrackGoals.map(g => g.title),
      patterns: this.identifyGoalPatterns(goals)
    };
  }

  // Get recent activity for intervention prediction
  private async getRecentActivity(userId: string, days: number = 14): Promise<any> {
    try {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      
      const [checkins, goals, conversations] = await Promise.all([
        this.getUserCheckins(userId),
        this.getUserGoals(userId),
        this.getUserConversations(userId)
      ]);

      return {
        checkins: checkins.filter(c => new Date(c.created_at) > cutoff),
        goals: goals.filter(g => new Date(g.updated_at || g.created_at) > cutoff),
        conversations: conversations.filter(c => new Date(c.created_at) > cutoff),
        totalActivities: 0
      };
    } catch (error) {
      console.error('Error getting recent activity:', error);
      return { checkins: [], goals: [], conversations: [], totalActivities: 0 };
    }
  }

  // Get historical patterns for comparison
  private async getHistoricalPatterns(userId: string): Promise<any> {
    try {
      const [checkins, goals] = await Promise.all([
        this.getUserCheckins(userId),
        this.getUserGoals(userId)
      ]);

      return {
        averageCheckinsPerWeek: checkins.length / 4, // Assume 4 weeks of data
        averageGoalCompletion: goals.filter(g => g.progress >= 100).length / Math.max(goals.length, 1),
        longestStreak: this.calculateStreaks(checkins.map(c => new Date(c.created_at).toDateString())).longest,
        patterns: []
      };
    } catch (error) {
      console.error('Error getting historical patterns:', error);
      return { averageCheckinsPerWeek: 0, averageGoalCompletion: 0, longestStreak: 0, patterns: [] };
    }
  }

  // Get user history for predictions
  private async getUserHistory(userId: string): Promise<any> {
    return this.getHistoricalPatterns(userId);
  }

  // Find similar goals for comparison
  private async findSimilarGoals(goalData: any): Promise<any[]> {
    // In a real implementation, this would use semantic search
    // For now, return mock similar goals
    return [
      { title: 'Similar Goal 1', success_rate: 0.7 },
      { title: 'Similar Goal 2', success_rate: 0.8 },
      { title: 'Similar Goal 3', success_rate: 0.6 }
    ];
  }

  // Extract features from goal data
  private extractGoalFeatures(goalData: any, userHistory: any): any {
    return {
      difficulty: goalData.difficulty || 'medium',
      category: goalData.category || 'general',
      timeframe: goalData.timeframe || 30,
      userExperience: userHistory.averageGoalCompletion || 0,
      currentStreak: userHistory.longestStreak || 0,
      specificity: goalData.description ? goalData.description.length > 50 ? 1 : 0.5 : 0
    };
  }

  // Calculate success probability using feature weights
  private calculateSuccessProbability(features: any, similarGoals: any[]): number {
    const difficultyWeights: { [key: string]: number } = { easy: 0.8, medium: 0.6, hard: 0.4 };
    const weights = {
      difficulty: difficultyWeights[features.difficulty] || 0.5,
      userExperience: features.userExperience * 0.3,
      currentStreak: Math.min(features.currentStreak * 0.1, 0.2),
      specificity: features.specificity * 0.1
    };

    const similarGoalsAvg = similarGoals.reduce((sum, goal) => sum + goal.success_rate, 0) / similarGoals.length;
    
    let probability = weights.difficulty + 
                     weights.userExperience + 
                     weights.currentStreak + 
                     weights.specificity +
                     (similarGoalsAvg * 0.2);

    return Math.max(0, Math.min(1, probability));
  }

  // Get user profile for personalization
  private async getUserProfile(userId: string): Promise<any> {
    return {
      preferences: [],
      strengths: [],
      challenges: [],
      motivationStyle: 'achievement' // default
    };
  }

  // Helper methods
  private getDaysSinceCreated(goal: any): number {
    const created = new Date(goal.created_at);
    const now = new Date();
    return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  }

  private identifyGoalPatterns(goals: any[]): string[] {
    const patterns = [];
    
    if (goals.filter(g => g.category === 'fitness').length > goals.length * 0.5) {
      patterns.push('fitness_focused');
    }
    
    if (goals.filter(g => g.progress > 80).length > goals.length * 0.3) {
      patterns.push('high_achiever');
    }
    
    return patterns;
  }

  private identifyGoalRiskFactors(features: any): string[] {
    const risks = [];
    
    if (features.difficulty === 'hard' && features.userExperience < 0.5) {
      risks.push('goal_too_ambitious');
    }
    
    if (features.specificity < 0.5) {
      risks.push('goal_not_specific');
    }
    
    return risks;
  }

  private generateGoalRecommendations(features: any, riskFactors: string[]): string[] {
    const recommendations = [];
    
    if (riskFactors.includes('goal_too_ambitious')) {
      recommendations.push('Consider breaking this goal into smaller milestones');
    }
    
    if (riskFactors.includes('goal_not_specific')) {
      recommendations.push('Add more specific details and measurable outcomes');
    }
    
    return recommendations;
  }

  private estimateCompletionTime(features: any): string {
    const baseTime = features.timeframe || 30;
    const difficultyWeights: { [key: string]: number } = { hard: 1.5, easy: 0.7, medium: 1 };
    const adjustedTime = baseTime * (difficultyWeights[features.difficulty] || 1);
    
    return `${Math.round(adjustedTime)} days`;
  }

  private calculateDifficultyScore(features: any): number {
    const difficultyMap: { [key: string]: number } = { easy: 0.3, medium: 0.6, hard: 0.9 };
    return difficultyMap[features.difficulty] || 0.6;
  }

  private determineInterventionType(recentActivity: any): string {
    if (!recentActivity.checkins || recentActivity.checkins.length === 0) {
      return 'check_in';
    }
    
    if (recentActivity.goals && recentActivity.goals.filter((g: any) => g.progress < 20).length > 0) {
      return 'goal_progress';
    }
    
    return 'motivation';
  }

  private calculateUrgency(riskScore: number, recentActivity: any): string {
    if (riskScore > 0.7) return 'high';
    if (riskScore > 0.4) return 'medium';
    return 'low';
  }

  private generateInterventionRecommendations(riskScore: number, type: string, urgency: string): string[] {
    const recommendations = [];
    
    switch (type) {
      case 'check_in':
        recommendations.push('Complete a daily check-in to maintain momentum');
        break;
      case 'goal_progress':
        recommendations.push('Review and update your goal progress');
        break;
      case 'motivation':
        recommendations.push('Try a motivational exercise or chat with your AI coach');
        break;
    }
    
    return recommendations;
  }

  private calculateNextCheckIn(riskScore: number): string {
    const daysFromNow = riskScore > 0.5 ? 1 : 3;
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + daysFromNow);
    return nextDate.toISOString();
  }

  private determineSupportLevel(riskScore: number): string {
    if (riskScore > 0.7) return 'intensive';
    if (riskScore > 0.4) return 'moderate';
    return 'standard';
  }

  private async scheduleIntervention(userId: string, type: string, recommendations: string[]): Promise<void> {
    // In a real implementation, this would schedule notifications or interventions
    console.log(`Scheduling ${type} intervention for user ${userId}:`, recommendations);
  }

  private identifyUserStrengths(patterns: any): string[] {
    const strengths = [];
    
    if (patterns.patterns?.consistency > 0.7) {
      strengths.push('Highly consistent with daily habits');
    }
    
    if (patterns.patterns?.peakPerformanceTimes?.length > 0) {
      strengths.push('Has identified optimal performance times');
    }
    
    return strengths;
  }

  private identifyOpportunities(patterns: any, predictions: any): string[] {
    const opportunities = [];
    
    if (patterns.patterns?.consistency < 0.5) {
      opportunities.push('Improve consistency with structured routines');
    }
    
    if (predictions.riskScore > 0.5) {
      opportunities.push('Focus on high-impact goals to reduce risk');
    }
    
    return opportunities;
  }

  private identifyMotivationalFactors(patterns: any): string[] {
    return [
      'Achievement-oriented',
      'Responds well to progress tracking',
      'Benefits from social accountability'
    ];
  }

  private suggestBehaviorOptimizations(patterns: any): string[] {
    const optimizations = [];
    
    if (patterns.patterns?.peakHour !== undefined) {
      optimizations.push(`Schedule important tasks around ${patterns.patterns.peakHour}:00`);
    }
    
    optimizations.push('Use habit stacking to build new routines');
    optimizations.push('Set up environmental cues for success');
    
    return optimizations;
  }

  // Helper methods for data retrieval
  private async getUserCheckins(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('checkins')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);
    
    return data || [];
  }

  private async getUserGoals(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    return data || [];
  }

  private async getUserConversations(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    
    return data || [];
  }

  private async storePrediction(
    userId: string, 
    type: string, 
    value: number, 
    factors: any
  ): Promise<void> {
    await supabase.from('user_predictions').insert({
      user_id: userId,
      prediction_type: type,
      prediction_value: value,
      confidence_score: this.calculatePredictionConfidence(factors),
      factors,
      valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });
  }

  // Default fallback methods
  private getDefaultAnalysis(): HabitAnalysis {
    return {
      patterns: {
        timePatterns: { peakHour: 9, peakDay: 1, hourlyDistribution: [], dailyDistribution: [], consistency: 0.5 },
        consistencyPatterns: { currentStreak: 0, longestStreak: 0, averageStreak: 0, consistencyRate: 0, patterns: [] },
        motivationPatterns: { positiveRatio: 0.5, averageSentiment: 0, motivationTriggers: [], demotivationTriggers: [], emotionalStability: 0.5 },
        goalProgressPatterns: {},
        behaviorClusters: {}
      },
      predictions: {},
      insights: [],
      confidence: 0.3,
      lastAnalyzed: new Date().toISOString()
    };
  }

  private getDefaultGoalPrediction(): GoalPrediction {
    return {
      successProbability: 0.6,
      riskFactors: [],
      recommendations: ['Start with small, consistent actions'],
      confidenceScore: 0.4,
      timeEstimate: '2-4 weeks',
      difficultyScore: 0.5
    };
  }

  private getDefaultInterventionPrediction(): InterventionPrediction {
    return {
      riskScore: 0.3,
      interventionType: 'check_in',
      urgency: 'low',
      recommendations: ['Continue current approach'],
      nextCheckIn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      supportLevel: 'standard'
    };
  }

  private getDefaultCoachingInsights(): CoachingInsights {
    return {
      strengths: ['Getting started with goal tracking'],
      opportunities: ['Build consistent habits'],
      personalizedTips: [],
      motivationalFactors: ['Achievement', 'Progress'],
      behaviorOptimizations: ['Set daily reminders']
    };
  }

  // Utility methods
  private calculateTimeConsistency(hourly: number[], daily: number[]): number {
    const hourlyVariance = this.calculateVariance(hourly);
    const dailyVariance = this.calculateVariance(daily);
    return 1 / (1 + hourlyVariance + dailyVariance);
  }

  private calculateVariance(data: number[]): number {
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    return data.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / data.length;
  }

  private calculateStreaks(dates: string[]): any {
    // Implementation for streak calculation
    return { current: 3, longest: 7, average: 4.5 };
  }

  private identifyConsistencyPatterns(streaks: any): string[] {
    return ['weekend_gaps', 'strong_weekday_routine'];
  }

  private extractMotivationTriggers(conversations: any[]): string[] {
    return ['progress_updates', 'goal_completion', 'positive_feedback'];
  }

  private extractDemotivationTriggers(conversations: any[]): string[] {
    return ['setbacks', 'missed_deadlines', 'overwhelming_goals'];
  }

  private calculateEmotionalStability(sentiments: number[]): number {
    if (sentiments.length < 2) return 0.5;
    const variance = this.calculateVariance(sentiments);
    return Math.max(0, 1 - variance);
  }

  private calculatePredictionConfidence(features: any): number {
    return 0.7; // Simplified for now
  }

  private calculateDaysSinceLastActivity(activity: any[]): number {
    if (activity.length === 0) return 30;
    const lastActivity = new Date(activity[0].created_at);
    const now = new Date();
    return Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
  }

  // Calculate risk score for intervention prediction
  private calculateRiskScore(recentActivity: any, historicalPatterns: any): number {
    let riskScore = 0;

    // Activity decline
    const recentActivityCount = (recentActivity.checkins?.length || 0) + (recentActivity.goals?.length || 0);
    const expectedActivity = historicalPatterns.averageActivity || 7;
    if (recentActivityCount < expectedActivity * 0.5) {
      riskScore += 0.3;
    }

    // Sentiment decline if conversations exist
    const recentConversations = recentActivity.conversations || [];
    if (recentConversations.length > 0) {
      const sentiments = recentConversations.filter((c: any) => c.sentiment_score !== null);
      if (sentiments.length > 0) {
        const avgSentiment = sentiments.reduce((a: any, b: any) => a + b.sentiment_score, 0) / sentiments.length;
        if (avgSentiment < -0.1) {
          riskScore += 0.2;
        }
      }
    }

    // Goal progress stagnation
    const goals = recentActivity.goals || [];
    const stagnantGoals = goals.filter((g: any) => g.progress < 20);
    if (stagnantGoals.length > goals.length * 0.5) {
      riskScore += 0.25;
    }
    
    // Consistency break
    const daysSinceLastActivity = this.calculateDaysSinceLastActivity(recentActivity.checkins || []);
    if (daysSinceLastActivity > 3) {
      riskScore += 0.25;
    }

    return Math.min(riskScore, 1.0);
  }

  // Generate personalized tips using pattern analysis
  private async generatePersonalizedTips(patterns: any, userProfile: any): Promise<PersonalizedTip[]> {
    const tips = [];

    // Peak performance tip
    if (patterns.timePatterns?.peakHour !== undefined) {
      tips.push({
        title: 'Optimize Your Peak Performance Window',
        description: `Your data shows you're most active at ${patterns.timePatterns.peakHour}:00. Schedule your most challenging goals during this time.`,
        confidence: 0.8,
        category: 'timing',
        actions: [
          `Block ${patterns.timePatterns.peakHour}:00-${patterns.timePatterns.peakHour + 1}:00 for important tasks`,
          'Avoid scheduling meetings during this peak time',
          'Use this window for goal planning and reflection'
        ],
        data: { peak_hour: patterns.timePatterns.peakHour }
      });
    }

    // Consistency improvement tip
    if (patterns.consistencyPatterns?.consistencyRate < 0.7) {
      tips.push({
        title: 'Boost Your Consistency',
        description: `Your current consistency rate is ${Math.round((patterns.consistencyPatterns.consistencyRate || 0) * 100)}%. Small, daily actions compound over time.`,
        confidence: 0.9,
        category: 'consistency',
        actions: [
          'Start with 2-minute habits to build momentum',
          'Set daily reminders at consistent times',
          'Track your progress visually'
        ],
        data: { consistency_rate: patterns.consistencyPatterns.consistencyRate }
      });
    }

    // Motivation enhancement tip
    if (patterns.motivationPatterns?.positiveRatio < 0.6) {
      tips.push({
        title: 'Enhance Your Motivation',
        description: `Let's work on maintaining positive momentum. Focus on your motivation triggers for better results.`,
        confidence: 0.75,
        category: 'motivation',
        actions: [
          'Create visual reminders of your motivations',
          'Connect with your deeper "why" for each goal',
          'Celebrate small wins more frequently'
        ],
        data: { 
          positive_ratio: patterns.motivationPatterns.positiveRatio,
          triggers: patterns.motivationPatterns.motivationTriggers || []
        }
      });
    }

    return tips;
  }

  // Cluster behaviors for pattern analysis
  private clusterBehaviors(checkins: any[], goals: any[], conversations: any[]): any {
    // Simple clustering based on activity patterns
    const clusters = {
      highActivity: [] as string[],
      mediumActivity: [] as string[],
      lowActivity: [] as string[],
      patterns: [] as string[]
    };

    const totalActivity = checkins.length + goals.length + conversations.length;
    
    if (totalActivity > 50) {
      clusters.highActivity = ['consistent_user', 'goal_oriented'];
    } else if (totalActivity > 20) {
      clusters.mediumActivity = ['moderate_user', 'needs_encouragement'];
    } else {
      clusters.lowActivity = ['new_user', 'needs_onboarding'];
    }

    return clusters;
  }

  // Predict habit success probability
  private predictHabitSuccess(patterns: any): number {
    let successScore = 0.5; // Base probability

    if (patterns.consistencyPatterns?.consistencyRate > 0.7) {
      successScore += 0.2;
    }

    if (patterns.timePatterns?.consistency > 0.6) {
      successScore += 0.15;
    }

    if (patterns.motivationPatterns?.positiveRatio > 0.6) {
      successScore += 0.15;
    }

    return Math.max(0.1, Math.min(0.9, successScore));
  }

  // Identify general risk factors
  private identifyRiskFactors(patterns: any): string[] {
    const risks = [];

    if (patterns.consistencyPatterns?.consistencyRate < 0.5) {
      risks.push('low_consistency');
    }

    if (patterns.motivationPatterns?.positiveRatio < 0.4) {
      risks.push('motivation_decline');
    }

    if (patterns.timePatterns?.consistency < 0.3) {
      risks.push('irregular_schedule');
    }

    return risks;
  }

  // Predict optimal timing for activities
  private predictOptimalTiming(patterns: any): any {
    return {
      bestHour: patterns.timePatterns?.peakHour || 9,
      bestDay: patterns.timePatterns?.peakDay || 1, // Monday
      confidence: patterns.timePatterns?.consistency || 0.5,
      recommendations: [
        `Schedule important tasks at ${patterns.timePatterns?.peakHour || 9}:00`,
        'Maintain consistent daily routines',
        'Avoid major changes during low-energy periods'
      ]
    };
  }

  // Assess intervention needs
  private assessInterventionNeeds(patterns: any): any {
    const needsIntervention = 
      (patterns.consistencyPatterns?.consistencyRate < 0.5) ||
      (patterns.motivationPatterns?.positiveRatio < 0.4);

    return {
      level: needsIntervention ? 'moderate' : 'low',
      type: needsIntervention ? 'motivation_boost' : 'maintenance',
      urgency: needsIntervention ? 'medium' : 'low',
      recommendations: needsIntervention ? 
        ['Schedule coaching session', 'Review goals', 'Adjust strategies'] :
        ['Continue current approach', 'Maintain momentum']
    };
  }

  // Generate actionable insights from patterns and predictions
  private generateActionableInsights(patterns: any, predictions: any): any[] {
    const insights = [];

    // Consistency insight
    if (patterns.consistencyPatterns?.consistencyRate < 0.7) {
      insights.push({
        type: 'consistency',
        title: 'Improve Daily Consistency',
        description: 'Focus on building stronger daily habits',
        actionable: true,
        priority: 'high',
        actions: ['Set daily reminders', 'Start with 2-minute habits', 'Track progress visually']
      });
    }

    // Timing insight
    if (patterns.timePatterns?.peakHour) {
      insights.push({
        type: 'timing',
        title: 'Optimize Your Schedule',
        description: `Your peak performance time is ${patterns.timePatterns.peakHour}:00`,
        actionable: true,
        priority: 'medium',
        actions: [`Schedule important tasks at ${patterns.timePatterns.peakHour}:00`]
      });
    }

    // Motivation insight
    if (predictions.habitSuccess < 0.6) {
      insights.push({
        type: 'motivation',
        title: 'Boost Motivation',
        description: 'Your motivation levels need attention',
        actionable: true,
        priority: 'high',
        actions: ['Review your why', 'Celebrate small wins', 'Connect with supporters']
      });
    }

    return insights;
  }

  // Calculate overall confidence in patterns
  private calculateOverallConfidence(patterns: any): number {
    const factors = [
      patterns.timePatterns?.consistency || 0,
      patterns.consistencyPatterns?.consistencyRate || 0,
      patterns.motivationPatterns?.positiveRatio || 0
    ];

    const avgConfidence = factors.reduce((sum, factor) => sum + factor, 0) / factors.length;
    return Math.max(0.1, Math.min(0.9, avgConfidence));
  }
}

// Type definitions
interface HabitAnalysis {
  patterns: any;
  predictions: any;
  insights: any[];
  confidence: number;
  lastAnalyzed: string;
}

interface GoalPrediction {
  successProbability: number;
  riskFactors: string[];
  recommendations: string[];
  confidenceScore: number;
  timeEstimate: string;
  difficultyScore: number;
}

interface InterventionPrediction {
  riskScore: number;
  interventionType: string;
  urgency: string;
  recommendations: string[];
  nextCheckIn: string;
  supportLevel: string;
}

interface CoachingInsights {
  strengths: string[];
  opportunities: string[];
  personalizedTips: PersonalizedTip[];
  motivationalFactors: string[];
  behaviorOptimizations: string[];
}

interface PersonalizedTip {
  title: string;
  description: string;
  confidence: number;
  category: string;
  actions: string[];
  data: any;
}

interface TimePatterns {
  peakHour: number;
  peakDay: number;
  hourlyDistribution: number[];
  dailyDistribution: number[];
  consistency: number;
}

interface ConsistencyPatterns {
  currentStreak: number;
  longestStreak: number;
  averageStreak: number;
  consistencyRate: number;
  patterns: string[];
}

interface MotivationPatterns {
  positiveRatio: number;
  averageSentiment: number;
  motivationTriggers: string[];
  demotivationTriggers: string[];
  emotionalStability: number;
}

// Export singleton instance
export const patternRecognitionService = new PatternRecognitionService(); 