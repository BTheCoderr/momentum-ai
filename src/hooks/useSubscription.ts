import { useSession } from 'next-auth/react';
import { SUBSCRIPTION_TIERS, type SubscriptionTier, type TierFeatures } from '@/config/subscription-tiers';

export function useSubscription() {
  const { data: session } = useSession();
  const userTier = (session?.user as any)?.subscriptionTier || 'FREE';

  const tierFeatures = SUBSCRIPTION_TIERS[userTier as SubscriptionTier];

  const canAccessFeature = (feature: keyof TierFeatures) => {
    if (!tierFeatures) return false;
    const value = tierFeatures[feature];
    if (typeof value === 'number') {
      return value === -1 || value > 0; // -1 means unlimited
    }
    return value;
  };

  const getFeatureLimit = (feature: keyof TierFeatures) => {
    if (!tierFeatures) return 0;
    const value = tierFeatures[feature];
    if (typeof value !== 'number') return 0;
    return value === -1 ? Infinity : value;
  };

  const checkGoalLimit = (currentGoalCount: number) => {
    const maxGoals = getFeatureLimit('maxGoals');
    return currentGoalCount < maxGoals;
  };

  const checkDailyCheckInLimit = (todaysCheckIns: number) => {
    const maxCheckIns = getFeatureLimit('aiCheckInsPerDay');
    return todaysCheckIns < maxCheckIns;
  };

  return {
    userTier,
    tierFeatures,
    canAccessFeature,
    getFeatureLimit,
    checkGoalLimit,
    checkDailyCheckInLimit,
  };
} 