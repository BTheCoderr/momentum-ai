import React, { useState } from 'react';
import { Crown, Zap, Brain, TrendingUp, Users, Shield, Star, Check, X, Sparkles, Target, Calendar, BarChart3 } from 'lucide-react';

interface PremiumFeaturesProps {
  currentPlan: 'free' | 'pro' | 'enterprise';
  onUpgrade: (plan: string) => void;
}

export default function PremiumFeatures({ currentPlan, onUpgrade }: PremiumFeaturesProps) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');

  interface PlanType {
    name: string;
    price: { monthly: number; yearly: number };
    description: string;
    features: string[];
    limitations?: string[];
    popular?: boolean;
  }

  const plans: Record<string, PlanType> = {
    free: {
      name: 'Free',
      price: { monthly: 0, yearly: 0 },
      description: 'Perfect for getting started',
      features: [
        'Up to 3 active goals',
        'Basic AI coaching',
        'Daily check-ins',
        'Community access',
        'Basic analytics',
        'Mobile app access'
      ],
      limitations: [
        'Limited AI suggestions',
        'Basic integrations only',
        'No advanced analytics',
        'No priority support'
      ]
    },
    pro: {
      name: 'Pro',
      price: { monthly: 19, yearly: 190 },
      description: 'For serious goal achievers',
      features: [
        'Unlimited goals',
        'Advanced AI coaching',
        'Predictive analytics',
        'Custom goal templates',
        'Priority integrations',
        'Advanced insights',
        'Habit stacking AI',
        'Progress forecasting',
        'Custom reminders',
        'Export data',
        'Priority support',
        'Early access features'
      ],
      popular: true
    },
    enterprise: {
      name: 'Enterprise',
      price: { monthly: 49, yearly: 490 },
      description: 'For teams and organizations',
      features: [
        'Everything in Pro',
        'Team management',
        'Admin dashboard',
        'Custom branding',
        'SSO integration',
        'Advanced security',
        'API access',
        'Custom integrations',
        'Dedicated support',
        'Training sessions',
        'SLA guarantee',
        'White-label options'
      ]
    }
  };

  const premiumFeatures = [
    {
      icon: Brain,
      title: 'Advanced AI Coaching',
      description: 'Get personalized strategies based on psychology and behavioral science',
      proOnly: true,
      demo: 'AI analyzes your patterns and suggests optimal habit timing'
    },
    {
      icon: TrendingUp,
      title: 'Predictive Analytics',
      description: 'See your success probability and get early warnings about potential setbacks',
      proOnly: true,
      demo: '87% chance of success this week, risk factors detected'
    },
    {
      icon: Target,
      title: 'Smart Goal Stacking',
      description: 'AI suggests complementary habits that compound your success',
      proOnly: true,
      demo: 'Morning routine + evening reflection = 34% higher success rate'
    },
    {
      icon: Calendar,
      title: 'Intelligent Scheduling',
      description: 'Automatically schedule habits based on your energy patterns and calendar',
      proOnly: true,
      demo: 'Best time for deep work: Tuesday 2-4 PM (92% focus score)'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Deep insights into your patterns, trends, and optimization opportunities',
      proOnly: true,
      demo: 'Weekly reports, trend analysis, and performance forecasting'
    },
    {
      icon: Users,
      title: 'Team Features',
      description: 'Collaborate with teams, share goals, and track group progress',
      enterpriseOnly: true,
      demo: 'Team dashboards, shared accountability, and group challenges'
    }
  ];

  const getFeatureAccess = (feature: any) => {
    if (feature.enterpriseOnly) {
      return currentPlan === 'enterprise' ? 'full' : 'locked';
    }
    if (feature.proOnly) {
      return currentPlan === 'free' ? 'locked' : 'full';
    }
    return 'full';
  };

  const savings = Math.round(((plans.pro.price.monthly * 12) - plans.pro.price.yearly) / (plans.pro.price.monthly * 12) * 100);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Crown className="w-8 h-8 text-yellow-500" />
          <h2 className="text-3xl font-bold text-gray-900">Unlock Your Full Potential</h2>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Upgrade to Pro and get advanced AI coaching, predictive analytics, and unlimited goals to achieve more than ever before.
        </p>
      </div>

      {/* Current Plan Status */}
      {currentPlan !== 'free' && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-center space-x-3">
            <Crown className="w-8 h-8 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold text-green-900">
                You're on the {plans[currentPlan].name} Plan
              </h3>
              <p className="text-green-700">
                Enjoying premium features! Your next billing date is January 15, 2024.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Billing Toggle */}
      <div className="flex items-center justify-center space-x-4">
        <span className={`font-medium ${selectedPlan === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
          Monthly
        </span>
        <button
          onClick={() => setSelectedPlan(selectedPlan === 'monthly' ? 'yearly' : 'monthly')}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            selectedPlan === 'yearly' ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              selectedPlan === 'yearly' ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <span className={`font-medium ${selectedPlan === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
          Yearly
        </span>
        {selectedPlan === 'yearly' && (
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm font-medium">
            Save {savings}%
          </span>
        )}
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {Object.entries(plans).map(([planKey, plan]) => (
          <div
            key={planKey}
            className={`rounded-2xl p-8 border-2 transition-all ${
              plan.popular
                ? 'border-blue-500 bg-gradient-to-b from-blue-50 to-white shadow-xl scale-105'
                : 'border-gray-200 bg-white hover:border-gray-300'
            } ${currentPlan === planKey ? 'ring-2 ring-green-500' : ''}`}
          >
            {plan.popular && (
              <div className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium text-center mb-4">
                Most Popular
              </div>
            )}
            
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <p className="text-gray-600 mb-4">{plan.description}</p>
              
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">
                  ${plan.price[selectedPlan]}
                </span>
                {plan.price[selectedPlan] > 0 && (
                  <span className="text-gray-600">
                    /{selectedPlan === 'monthly' ? 'month' : 'year'}
                  </span>
                )}
              </div>
              
              {selectedPlan === 'yearly' && plan.price.yearly > 0 && (
                <p className="text-sm text-green-600">
                  ${plan.price.monthly}/month billed annually
                </p>
              )}
            </div>

            <div className="space-y-3 mb-8">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
              
              {plan.limitations && (
                <>
                  <div className="border-t border-gray-200 my-4"></div>
                  {plan.limitations.map((limitation: string, index: number) => (
                    <div key={index} className="flex items-center space-x-3">
                      <X className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-500">{limitation}</span>
                    </div>
                  ))}
                </>
              )}
            </div>

            <button
              onClick={() => onUpgrade(planKey)}
              disabled={currentPlan === planKey}
              className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                currentPlan === planKey
                  ? 'bg-green-100 text-green-700 cursor-not-allowed'
                  : plan.popular
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            >
              {currentPlan === planKey ? 'Current Plan' : 
               planKey === 'free' ? 'Downgrade' : 'Upgrade Now'}
            </button>
          </div>
        ))}
      </div>

      {/* Premium Features Showcase */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium Features</h3>
          <p className="text-gray-600">See what you unlock with Pro and Enterprise plans</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {premiumFeatures.map((feature, index) => {
            const Icon = feature.icon;
            const access = getFeatureAccess(feature);
            
            return (
              <div
                key={index}
                className={`p-6 rounded-xl border-2 transition-all ${
                  access === 'locked'
                    ? 'border-gray-200 bg-gray-50 opacity-75'
                    : 'border-blue-200 bg-blue-50 hover:shadow-md'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    access === 'locked' ? 'bg-gray-200' : 'bg-blue-100'
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      access === 'locked' ? 'text-gray-400' : 'text-blue-600'
                    }`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className={`font-semibold ${
                        access === 'locked' ? 'text-gray-500' : 'text-gray-900'
                      }`}>
                        {feature.title}
                      </h4>
                      {access === 'locked' && (
                        <Crown className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    
                    <p className={`text-sm mb-3 ${
                      access === 'locked' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {feature.description}
                    </p>
                    
                    <div className={`text-xs p-2 rounded-lg ${
                      access === 'locked' 
                        ? 'bg-gray-100 text-gray-500' 
                        : 'bg-white text-blue-700'
                    }`}>
                      <strong>Example:</strong> {feature.demo}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Money-Back Guarantee */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
        <div className="flex items-center space-x-4">
          <Shield className="w-12 h-12 text-green-600" />
          <div>
            <h3 className="text-lg font-semibold text-green-900">30-Day Money-Back Guarantee</h3>
            <p className="text-green-700">
              Try Pro risk-free. If you're not completely satisfied, we'll refund your money within 30 days.
            </p>
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-1 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className="w-5 h-5 text-yellow-400 fill-current" />
          ))}
          <span className="ml-2 text-gray-600">4.9/5 from 2,847 users</span>
        </div>
        <p className="text-gray-600">
          "Momentum AI Pro helped me achieve more in 3 months than I did all last year. The AI coaching is incredible!" 
          <span className="font-medium">- Sarah Chen, Pro User</span>
        </p>
      </div>
    </div>
  );
} 