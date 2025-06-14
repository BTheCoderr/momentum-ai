// User onboarding system for test users

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: string;
  completed: boolean;
  optional: boolean;
}

export interface UserOnboarding {
  userId: string;
  currentStep: number;
  steps: OnboardingStep[];
  completedAt?: Date;
  skippedAt?: Date;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Momentum AI! 🎯',
    description: 'Your AI accountability agent is here to help you achieve your goals',
    component: 'WelcomeStep',
    completed: false,
    optional: false
  },
  {
    id: 'first-goal',
    title: 'Create Your First Goal',
    description: 'Set up a meaningful goal with emotional context',
    component: 'GoalCreationStep',
    completed: false,
    optional: false
  },
  {
    id: 'ai-coach',
    title: 'Meet Your AI Coach',
    description: 'Learn how AI provides personalized guidance',
    component: 'AICoachStep',
    completed: false,
    optional: false
  },
  {
    id: 'check-in',
    title: 'Daily Check-ins',
    description: 'Experience the 4-step check-in process',
    component: 'CheckInStep',
    completed: false,
    optional: false
  },
  {
    id: 'accountability-pods',
    title: 'Join an Accountability Pod',
    description: 'Connect with peers for mutual support',
    component: 'PodsStep',
    completed: false,
    optional: true
  },
  {
    id: 'integrations',
    title: 'Connect Your Tools',
    description: 'Link calendar, wearables, and productivity apps',
    component: 'IntegrationsStep',
    completed: false,
    optional: true
  },
  {
    id: 'insights',
    title: 'Personal Insights',
    description: 'Discover your productivity patterns',
    component: 'InsightsStep',
    completed: false,
    optional: true
  }
];

class OnboardingManager {
  private onboardingData: Map<string, UserOnboarding> = new Map();

  // Initialize onboarding for new user
  initializeUser(userId: string): UserOnboarding {
    const userOnboarding: UserOnboarding = {
      userId,
      currentStep: 0,
      steps: [...ONBOARDING_STEPS]
    };

    this.onboardingData.set(userId, userOnboarding);
    return userOnboarding;
  }

  // Get user's onboarding progress
  getUserOnboarding(userId: string): UserOnboarding | null {
    return this.onboardingData.get(userId) || null;
  }

  // Mark step as completed
  completeStep(userId: string, stepId: string): boolean {
    const userOnboarding = this.onboardingData.get(userId);
    if (!userOnboarding) return false;

    const stepIndex = userOnboarding.steps.findIndex(s => s.id === stepId);
    if (stepIndex === -1) return false;

    userOnboarding.steps[stepIndex].completed = true;
    
    // Move to next incomplete step
    const nextIncompleteStep = userOnboarding.steps.findIndex(
      (s, index) => index > stepIndex && !s.completed && !s.optional
    );
    
    if (nextIncompleteStep !== -1) {
      userOnboarding.currentStep = nextIncompleteStep;
    } else {
      // All required steps completed
      userOnboarding.completedAt = new Date();
    }

    this.onboardingData.set(userId, userOnboarding);
    return true;
  }

  // Skip onboarding
  skipOnboarding(userId: string): boolean {
    const userOnboarding = this.onboardingData.get(userId);
    if (!userOnboarding) return false;

    userOnboarding.skippedAt = new Date();
    this.onboardingData.set(userId, userOnboarding);
    return true;
  }

  // Check if user has completed onboarding
  isOnboardingComplete(userId: string): boolean {
    const userOnboarding = this.onboardingData.get(userId);
    if (!userOnboarding) return false;

    return !!userOnboarding.completedAt || !!userOnboarding.skippedAt;
  }

  // Get current step for user
  getCurrentStep(userId: string): OnboardingStep | null {
    const userOnboarding = this.onboardingData.get(userId);
    if (!userOnboarding) return null;

    return userOnboarding.steps[userOnboarding.currentStep] || null;
  }

  // Get onboarding progress percentage
  getProgress(userId: string): number {
    const userOnboarding = this.onboardingData.get(userId);
    if (!userOnboarding) return 0;

    const requiredSteps = userOnboarding.steps.filter(s => !s.optional);
    const completedRequired = requiredSteps.filter(s => s.completed);
    
    return Math.round((completedRequired.length / requiredSteps.length) * 100);
  }

  // Analytics for onboarding optimization
  getOnboardingAnalytics() {
    const allUsers = Array.from(this.onboardingData.values());
    
    return {
      totalUsers: allUsers.length,
      completedUsers: allUsers.filter(u => u.completedAt).length,
      skippedUsers: allUsers.filter(u => u.skippedAt).length,
      averageProgress: allUsers.reduce((sum, u) => 
        sum + this.getProgress(u.userId), 0) / allUsers.length,
      stepCompletionRates: ONBOARDING_STEPS.map(step => ({
        stepId: step.id,
        completionRate: allUsers.filter(u => 
          u.steps.find(s => s.id === step.id)?.completed
        ).length / allUsers.length
      }))
    };
  }
}

export const onboardingManager = new OnboardingManager();

// Helper functions for test user management
export const testUserHelpers = {
  // Create demo data for new test users
  createDemoData: (userId: string) => {
    return {
      goals: [
        {
          id: 'demo-1',
          title: 'Write 500 words daily',
          description: 'Build a consistent writing habit',
          category: 'creativity',
          frequency: 'daily',
          emotionalWhy: 'I want to share my stories with the world',
          progress: 65,
          streakCount: 12
        }
      ],
      messages: [
        {
          id: 'demo-msg-1',
          content: 'Welcome to Momentum AI! I\'m here to help you achieve your goals. What would you like to work on today?',
          role: 'assistant',
          timestamp: new Date()
        }
      ]
    };
  },

  // Generate test user invitation codes
  generateInviteCode: (): string => {
    return 'MOMENTUM-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  },

  // Track test user feedback
  collectFeedback: (userId: string, feedback: {
    rating: number;
    comments: string;
    features: string[];
    improvements: string[];
  }) => {
    // Store feedback for product improvement
    console.log('📝 Test User Feedback:', { userId, ...feedback });
    
    // In production, send to feedback collection service
    if (process.env.NODE_ENV === 'production') {
      // Send to Typeform, Airtable, or custom feedback API
    }
  }
};

export default onboardingManager; 