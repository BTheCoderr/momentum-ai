import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: number;
  sessionId: string;
  userId?: string;
}

export interface UserProperties {
  userId: string;
  signupDate: string;
  totalSessions: number;
  totalCheckIns: number;
  totalGoals: number;
  currentStreak: number;
  maxStreak: number;
  averageSessionDuration: number;
  lastActiveDate: string;
  preferredCoach: string;
  notificationsEnabled: boolean;
  premiumUser: boolean;
  appVersion: string;
  platform: string;
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private sessionId: string;
  private userId: string | null = null;
  private sessionStartTime: number;
  private events: AnalyticsEvent[] = [];
  private userProperties: Partial<UserProperties> = {};

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = Date.now();
    this.initializeAnalytics();
  }

  private async initializeAnalytics() {
    try {
      // Load user ID if exists
      const storedUserId = await AsyncStorage.getItem('userId');
      if (storedUserId) {
        this.userId = storedUserId;
      }

      // Load user properties
      const storedProperties = await AsyncStorage.getItem('userProperties');
      if (storedProperties) {
        this.userProperties = JSON.parse(storedProperties);
      }

      // Update session count
      await this.incrementSessionCount();
      
      // Track app launch
      this.track('app_launched', {
        platform: Platform.OS,
        version: this.userProperties.appVersion || '1.0.0',
        sessionId: this.sessionId,
      });
    } catch (error) {
      console.error('Error initializing analytics:', error);
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async setUserId(userId: string) {
    this.userId = userId;
    await AsyncStorage.setItem('userId', userId);
    
    // Update user properties
    await this.updateUserProperties({ userId });
    
    this.track('user_identified', { userId });
  }

  async updateUserProperties(properties: Partial<UserProperties>) {
    this.userProperties = { ...this.userProperties, ...properties };
    await AsyncStorage.setItem('userProperties', JSON.stringify(this.userProperties));
  }

  private async incrementSessionCount() {
    const currentCount = this.userProperties.totalSessions || 0;
    await this.updateUserProperties({ 
      totalSessions: currentCount + 1,
      lastActiveDate: new Date().toISOString(),
    });
  }

  track(eventName: string, properties?: Record<string, any>) {
    const event: AnalyticsEvent = {
      name: eventName,
      properties: {
        ...properties,
        userId: this.userId,
        sessionId: this.sessionId,
        platform: Platform.OS,
        timestamp: Date.now(),
      },
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId || undefined,
    };

    this.events.push(event);
    this.saveEventsToStorage();
    
    // In a real app, you'd send this to your analytics service
    console.log('📊 Analytics Event:', eventName, properties);
  }

  private async saveEventsToStorage() {
    try {
      // Keep only last 100 events in storage to prevent bloat
      const eventsToStore = this.events.slice(-100);
      await AsyncStorage.setItem('analyticsEvents', JSON.stringify(eventsToStore));
    } catch (error) {
      console.error('Error saving analytics events:', error);
    }
  }

  // Screen tracking
  trackScreen(screenName: string, properties?: Record<string, any>) {
    this.track('screen_viewed', {
      screen_name: screenName,
      ...properties,
    });
  }

  // User engagement events
  trackCheckIn(mood: number, energy: number, stress: number) {
    this.track('check_in_completed', {
      mood,
      energy,
      stress,
      overall_score: (mood + energy + (6 - stress)) / 3,
    });
  }

  trackGoalCreated(goalType: string, category: string) {
    this.track('goal_created', {
      goal_type: goalType,
      category,
    });
  }

  trackGoalCompleted(goalId: string, daysToComplete: number) {
    this.track('goal_completed', {
      goal_id: goalId,
      days_to_complete: daysToComplete,
    });
  }

  trackAIInteraction(coachType: string, messageCount: number, sessionDuration: number) {
    this.track('ai_interaction', {
      coach_type: coachType,
      message_count: messageCount,
      session_duration: sessionDuration,
    });
  }

  trackStreakMilestone(streakCount: number) {
    this.track('streak_milestone', {
      streak_count: streakCount,
      is_personal_best: streakCount > (this.userProperties.maxStreak || 0),
    });
  }

  trackReflectionCompleted(wordCount: number, timeSpent: number) {
    this.track('reflection_completed', {
      word_count: wordCount,
      time_spent: timeSpent,
    });
  }

  trackFeatureUsage(featureName: string, context?: string) {
    this.track('feature_used', {
      feature_name: featureName,
      context,
    });
  }

  trackError(errorType: string, errorMessage: string, context?: string) {
    this.track('error_occurred', {
      error_type: errorType,
      error_message: errorMessage,
      context,
    });
  }

  trackPremiumFeatureAttempt(featureName: string, isPremiumUser: boolean) {
    this.track('premium_feature_attempt', {
      feature_name: featureName,
      is_premium_user: isPremiumUser,
      action: isPremiumUser ? 'accessed' : 'blocked',
    });
  }

  trackOnboardingStep(stepNumber: number, stepName: string, completed: boolean) {
    this.track('onboarding_step', {
      step_number: stepNumber,
      step_name: stepName,
      completed,
    });
  }

  trackAppRating(rating: number, feedback?: string) {
    this.track('app_rated', {
      rating,
      feedback: feedback || null,
    });
  }

  trackShareAction(contentType: string, platform: string) {
    this.track('content_shared', {
      content_type: contentType,
      platform,
    });
  }

  // Session management
  async endSession() {
    const sessionDuration = Date.now() - this.sessionStartTime;
    
    this.track('session_ended', {
      session_duration: sessionDuration,
      events_in_session: this.events.filter(e => e.sessionId === this.sessionId).length,
    });

    // Update average session duration
    const currentAvg = this.userProperties.averageSessionDuration || 0;
    const sessionCount = this.userProperties.totalSessions || 1;
    const newAvg = ((currentAvg * (sessionCount - 1)) + sessionDuration) / sessionCount;
    
    await this.updateUserProperties({
      averageSessionDuration: newAvg,
    });
  }

  // Data export for debugging or analysis
  async exportAnalyticsData() {
    return {
      events: this.events,
      userProperties: this.userProperties,
      currentSession: {
        sessionId: this.sessionId,
        startTime: this.sessionStartTime,
        duration: Date.now() - this.sessionStartTime,
      },
    };
  }

  // Privacy compliance
  async clearAllData() {
    this.events = [];
    this.userProperties = {};
    this.userId = null;
    
    await AsyncStorage.multiRemove([
      'analyticsEvents',
      'userProperties',
      'userId',
    ]);
  }

  // Get insights for the user (gamification)
  async getUserInsights() {
    const totalEvents = this.events.length;
    const checkInEvents = this.events.filter(e => e.name === 'check_in_completed');
    const goalEvents = this.events.filter(e => e.name === 'goal_created');
    const aiInteractions = this.events.filter(e => e.name === 'ai_interaction');
    
    return {
      totalActivity: totalEvents,
      checkInsCompleted: checkInEvents.length,
      goalsCreated: goalEvents.length,
      aiChatSessions: aiInteractions.length,
      averageSessionDuration: this.userProperties.averageSessionDuration || 0,
      mostUsedFeatures: this.getMostUsedFeatures(),
      engagementScore: this.calculateEngagementScore(),
    };
  }

  private getMostUsedFeatures() {
    const featureUsage: Record<string, number> = {};
    
    this.events.forEach(event => {
      if (event.name === 'feature_used' && event.properties?.feature_name) {
        const feature = event.properties.feature_name;
        featureUsage[feature] = (featureUsage[feature] || 0) + 1;
      }
    });

    return Object.entries(featureUsage)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([feature, count]) => ({ feature, count }));
  }

  private calculateEngagementScore(): number {
    const sessionCount = this.userProperties.totalSessions || 0;
    const checkInCount = this.userProperties.totalCheckIns || 0;
    const goalCount = this.userProperties.totalGoals || 0;
    const currentStreak = this.userProperties.currentStreak || 0;
    const avgSessionDuration = this.userProperties.averageSessionDuration || 0;

    // Weighted scoring system
    const sessionScore = Math.min(sessionCount * 2, 50);
    const checkInScore = Math.min(checkInCount * 3, 60);
    const goalScore = Math.min(goalCount * 5, 40);
    const streakScore = Math.min(currentStreak * 4, 80);
    const durationScore = Math.min((avgSessionDuration / 60000) * 2, 20); // Convert to minutes

    return Math.round(sessionScore + checkInScore + goalScore + streakScore + durationScore);
  }
}

// Export singleton instance
export const analytics = AnalyticsService.getInstance();

// Convenience functions
export const trackEvent = (name: string, properties?: Record<string, any>) => 
  analytics.track(name, properties);

export const trackScreen = (screenName: string, properties?: Record<string, any>) => 
  analytics.trackScreen(screenName, properties);

export const setUserId = (userId: string) => analytics.setUserId(userId);
export const updateUserProperties = (properties: Partial<UserProperties>) => 
  analytics.updateUserProperties(properties); 