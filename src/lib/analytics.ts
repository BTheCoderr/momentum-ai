// Analytics and user tracking for scaling insights

export interface UserEvent {
  userId?: string;
  event: string;
  properties?: Record<string, any>;
  timestamp: Date;
}

export interface AppMetrics {
  dailyActiveUsers: number;
  goalCompletionRate: number;
  averageSessionTime: number;
  retentionRate: number;
  churnRate: number;
}

class Analytics {
  private events: UserEvent[] = [];

  // Track user actions for product insights
  track(event: string, properties?: Record<string, any>, userId?: string) {
    const userEvent: UserEvent = {
      userId,
      event,
      properties,
      timestamp: new Date()
    };

    this.events.push(userEvent);

    // In production, send to analytics service
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(userEvent);
    }

    console.log('📊 Analytics:', userEvent);
  }

  // Key events to track for growth
  trackGoalCreated(goalType: string, userId?: string) {
    this.track('goal_created', { goalType }, userId);
  }

  trackCheckInCompleted(completionRate: number, userId?: string) {
    this.track('checkin_completed', { completionRate }, userId);
  }

  trackAIInteraction(messageType: string, userId?: string) {
    this.track('ai_interaction', { messageType }, userId);
  }

  trackFeatureUsed(feature: string, userId?: string) {
    this.track('feature_used', { feature }, userId);
  }

  trackUserRetention(daysActive: number, userId?: string) {
    this.track('user_retention', { daysActive }, userId);
  }

  // Get insights for scaling decisions
  getMetrics(): AppMetrics {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentEvents = this.events.filter(e => e.timestamp > oneDayAgo);
    const weeklyEvents = this.events.filter(e => e.timestamp > oneWeekAgo);

    const dailyActiveUsers = new Set(
      recentEvents.map(e => e.userId).filter(Boolean)
    ).size;

    const goalCompletions = recentEvents.filter(e => 
      e.event === 'checkin_completed'
    );
    const goalCompletionRate = goalCompletions.length > 0 
      ? goalCompletions.reduce((sum, e) => sum + (e.properties?.completionRate || 0), 0) / goalCompletions.length
      : 0;

    return {
      dailyActiveUsers,
      goalCompletionRate,
      averageSessionTime: 0, // Calculate from session events
      retentionRate: 0, // Calculate from user return events
      churnRate: 0 // Calculate from inactive users
    };
  }

  private async sendToAnalytics(event: UserEvent) {
    // Integration with analytics services
    try {
      // Example: Send to Vercel Analytics, Mixpanel, or PostHog
      if (typeof window !== 'undefined' && (window as any).va) {
        (window as any).va('track', event.event, event.properties);
      }
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }

  // Export data for analysis
  exportEvents() {
    return this.events;
  }

  // Clear old events to prevent memory issues
  cleanup() {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    this.events = this.events.filter(e => e.timestamp > oneMonthAgo);
  }
}

export const analytics = new Analytics();

// Helper functions for common tracking
export const trackPageView = (page: string, userId?: string) => {
  analytics.track('page_view', { page }, userId);
};

export const trackButtonClick = (button: string, userId?: string) => {
  analytics.track('button_click', { button }, userId);
};

export const trackError = (error: string, context?: string, userId?: string) => {
  analytics.track('error', { error, context }, userId);
};

// User journey tracking
export const trackUserJourney = {
  signup: (method: string, userId?: string) => 
    analytics.track('user_signup', { method }, userId),
  
  firstGoal: (userId?: string) => 
    analytics.track('first_goal_created', {}, userId),
  
  firstCheckIn: (userId?: string) => 
    analytics.track('first_checkin', {}, userId),
  
  weeklyActive: (userId?: string) => 
    analytics.track('weekly_active_user', {}, userId),
  
  monthlyActive: (userId?: string) => 
    analytics.track('monthly_active_user', {}, userId)
};

export default analytics; 