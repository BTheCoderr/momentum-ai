import React, { useState } from 'react';
import { Crown, Lock, Star, Check, X, Zap, Heart, Target, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'ai' | 'insights' | 'goals' | 'analytics';
  isPremium: boolean;
}

interface PremiumFeatureManagerProps {
  feature: string;
  children: React.ReactNode;
  fallbackMessage?: string;
  showUpgrade?: boolean;
  onUpgrade?: () => void;
}

const PREMIUM_FEATURES: PremiumFeature[] = [
  {
    id: 'unlimited-insights',
    name: 'Unlimited Insights',
    description: 'Get unlimited personalized insights and coaching',
    icon: <Star className="w-5 h-5" />,
    category: 'insights',
    isPremium: true
  },
  {
    id: 'advanced-analytics',
    name: 'Advanced Analytics',
    description: 'Deep analytics and progress tracking',
    icon: <TrendingUp className="w-5 h-5" />,
    category: 'analytics',
    isPremium: true
  },
  {
    id: 'ai-coach',
    name: 'AI Life Coach',
    description: 'Personal AI coach available 24/7',
    icon: <Heart className="w-5 h-5" />,
    category: 'ai',
    isPremium: true
  },
  {
    id: 'goal-templates',
    name: 'Goal Templates',
    description: 'Pre-built goal templates and frameworks',
    icon: <Target className="w-5 h-5" />,
    category: 'goals',
    isPremium: true
  },
  {
    id: 'voice-input',
    name: 'Voice Input',
    description: 'Speak instead of typing throughout the app',
    icon: <Zap className="w-5 h-5" />,
    category: 'ai',
    isPremium: false // Voice input is now free!
  },
  {
    id: 'basic-goals',
    name: 'Goal Tracking',
    description: 'Track up to 3 goals with basic progress',
    icon: <Target className="w-5 h-5" />,
    category: 'goals',
    isPremium: false
  },
  {
    id: 'daily-checkin',
    name: 'Daily Check-ins',
    description: 'Daily mood and progress check-ins',
    icon: <Check className="w-5 h-5" />,
    category: 'insights',
    isPremium: false
  }
];

// Mock user subscription status
const useUserSubscription = () => {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const upgradeToPremium = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsPremium(true);
    setIsLoading(false);
    
    // Show success message
    const event = new CustomEvent('showToast', {
      detail: { message: 'Welcome to Premium! 🎉', type: 'success' }
    });
    window.dispatchEvent(event);
  };

  return { isPremium, isLoading, upgradeToPremium };
};

export default function PremiumFeatureManager({
  feature,
  children,
  fallbackMessage,
  showUpgrade = true,
  onUpgrade
}: PremiumFeatureManagerProps) {
  const { isPremium, isLoading, upgradeToPremium } = useUserSubscription();
  const [showPaywall, setShowPaywall] = useState(false);

  const featureConfig = PREMIUM_FEATURES.find(f => f.id === feature);
  const isFeaturePremium = featureConfig?.isPremium ?? false;

  // If feature is not premium or user has premium, show the feature
  if (!isFeaturePremium || isPremium) {
    return <>{children}</>;
  }

  // Show premium gate
  const handleUpgradeClick = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      setShowPaywall(true);
    }
  };

  return (
    <>
      <div className="relative">
        {/* Blurred content */}
        <div className="filter blur-sm pointer-events-none opacity-50">
          {children}
        </div>

        {/* Premium overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm">
          <div className="text-center p-6 max-w-sm">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {featureConfig?.name || 'Premium Feature'}
            </h3>
            
            <p className="text-gray-600 mb-4">
              {fallbackMessage || featureConfig?.description || 'This feature requires a premium subscription'}
            </p>

            {showUpgrade && (
              <button
                onClick={handleUpgradeClick}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-yellow-500 hover:to-orange-600 transition-all duration-200 shadow-lg"
              >
                <Crown className="w-4 h-4 inline mr-2" />
                Upgrade to Premium
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Premium Paywall Modal */}
      <AnimatePresence>
        {showPaywall && (
          <PremiumPaywallModal
            isOpen={showPaywall}
            onClose={() => setShowPaywall(false)}
            onUpgrade={upgradeToPremium}
            isLoading={isLoading}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// Premium Paywall Modal Component
function PremiumPaywallModal({
  isOpen,
  onClose,
  onUpgrade,
  isLoading
}: {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  isLoading: boolean;
}) {
  const premiumFeatures = PREMIUM_FEATURES.filter(f => f.isPremium);
  const freeFeatures = PREMIUM_FEATURES.filter(f => !f.isPremium);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Momentum AI Premium</h2>
                <p className="text-sm text-gray-600">Unlock your full potential</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* Pricing */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-2xl p-6 mb-4">
              <div className="text-3xl font-bold mb-2">$9.99/month</div>
              <div className="text-yellow-100">First 7 days free</div>
            </div>
            <p className="text-gray-600">
              Join thousands of users who've transformed their lives with Premium
            </p>
          </div>

          {/* Features Comparison */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Premium Features</h3>
              <div className="space-y-3">
                {premiumFeatures.map((feature) => (
                  <div key={feature.id} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{feature.name}</div>
                      <div className="text-sm text-gray-600">{feature.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Always Free</h3>
              <div className="space-y-3">
                {freeFeatures.map((feature) => (
                  <div key={feature.id} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{feature.name}</div>
                      <div className="text-sm text-gray-600">{feature.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8 space-y-3">
            <button
              onClick={onUpgrade}
              disabled={isLoading}
              className={`
                w-full py-4 px-6 rounded-xl font-semibold text-white text-lg
                ${isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600'
                }
                transition-all duration-200 shadow-lg
              `}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Upgrading...</span>
                </div>
              ) : (
                <>
                  <Crown className="w-5 h-5 inline mr-2" />
                  Start Free Trial
                </>
              )}
            </button>
            
            <button
              onClick={onClose}
              className="w-full py-3 px-6 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Maybe later
            </button>
          </div>

          {/* Trust indicators */}
          <div className="mt-6 text-center text-xs text-gray-500">
            <p>✓ Cancel anytime ✓ 30-day money-back guarantee ✓ Secure payments</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Utility function to check if a feature is premium
export const isPremiumFeature = (featureId: string): boolean => {
  const feature = PREMIUM_FEATURES.find(f => f.id === featureId);
  return feature?.isPremium ?? false;
};

// Utility function to get feature info
export const getFeatureInfo = (featureId: string): PremiumFeature | undefined => {
  return PREMIUM_FEATURES.find(f => f.id === featureId);
}; 