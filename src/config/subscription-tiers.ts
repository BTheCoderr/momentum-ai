export type SubscriptionTier = 'FREE' | 'PRO' | 'ELITE';

export type TierFeatures = {
  maxGoals: number;
  aiCheckInsPerDay: number;
  advancedAnalytics: boolean;
  communityAccess: 'read' | 'full' | 'vip';
  aiCoachPersonality: boolean;
  predictiveForecasting: boolean;
  prioritySupport: boolean;
  customInterventions: boolean;
};

export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, TierFeatures> = {
  FREE: {
    maxGoals: 2,
    aiCheckInsPerDay: 1,
    advancedAnalytics: false,
    communityAccess: 'read',
    aiCoachPersonality: false,
    predictiveForecasting: false,
    prioritySupport: false,
    customInterventions: false,
  },
  PRO: {
    maxGoals: -1, // unlimited
    aiCheckInsPerDay: -1, // unlimited
    advancedAnalytics: true,
    communityAccess: 'full',
    aiCoachPersonality: false,
    predictiveForecasting: false,
    prioritySupport: true,
    customInterventions: true,
  },
  ELITE: {
    maxGoals: -1, // unlimited
    aiCheckInsPerDay: -1, // unlimited
    advancedAnalytics: true,
    communityAccess: 'vip',
    aiCoachPersonality: true,
    predictiveForecasting: true,
    prioritySupport: true,
    customInterventions: true,
  },
};

export const TIER_PRICES = {
  FREE: 0,
  PRO: 9.99,
  ELITE: 24.99,
};

export const TIER_DESCRIPTIONS = {
  FREE: {
    name: 'Free',
    description: 'Try out Momentum AI and experience the basics of AI-powered goal tracking',
    features: [
      'Track up to 2 goals',
      'Daily AI check-in',
      'Basic progress dashboard',
      'Weekly insights summary',
      'Community read access',
    ],
  },
  PRO: {
    name: 'Pro',
    description: 'Unlock unlimited goals and advanced AI coaching',
    features: [
      'Unlimited goals',
      'Unlimited AI coaching sessions',
      'Advanced analytics & insights',
      'Custom intervention scheduling',
      'Full community access',
      'Priority support',
    ],
  },
  ELITE: {
    name: 'Elite',
    description: 'Get the ultimate AI accountability experience',
    features: [
      'Everything in Pro',
      'Personal AI strategy sessions',
      'Predictive goal forecasting',
      'Custom AI personality',
      '1-on-1 coaching sessions',
      'VIP community access',
    ],
  },
}; 