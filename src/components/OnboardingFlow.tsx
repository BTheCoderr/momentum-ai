import React, { useState, useEffect } from 'react';
import { CheckCircle, ArrowRight, ArrowLeft, X, Target, Brain, Users, Calendar, BarChart3, Zap } from 'lucide-react';
import { onboardingManager, ONBOARDING_STEPS, type OnboardingStep } from '@/lib/onboarding';
import { analytics, trackUserJourney } from '@/lib/analytics';

interface OnboardingFlowProps {
  userId?: string;
  onComplete: () => void;
  onSkip: () => void;
}

export default function OnboardingFlow({ userId = 'demo-user', onComplete, onSkip }: OnboardingFlowProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Initialize onboarding for user
    onboardingManager.initializeUser(userId);
    trackUserJourney.signup('product_hunt', userId);
  }, [userId]);

  const currentStep = ONBOARDING_STEPS[currentStepIndex];
  const progress = ((currentStepIndex + 1) / ONBOARDING_STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep) {
      const newCompleted = new Set(completedSteps);
      newCompleted.add(currentStep.id);
      setCompletedSteps(newCompleted);
      
      onboardingManager.completeStep(userId, currentStep.id);
      analytics.track('onboarding_step_completed', { stepId: currentStep.id }, userId);
    }

    if (currentStepIndex < ONBOARDING_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleComplete = () => {
    analytics.track('onboarding_completed', { 
      stepsCompleted: completedSteps.size,
      totalSteps: ONBOARDING_STEPS.length 
    }, userId);
    trackUserJourney.firstGoal(userId);
    setIsVisible(false);
    onComplete();
  };

  const handleSkip = () => {
    onboardingManager.skipOnboarding(userId);
    analytics.track('onboarding_skipped', { 
      currentStep: currentStepIndex,
      stepsCompleted: completedSteps.size 
    }, userId);
    setIsVisible(false);
    onSkip();
  };

  const getStepIcon = (stepId: string) => {
    const icons = {
      welcome: Target,
      'first-goal': Target,
      'ai-coach': Brain,
      'check-in': CheckCircle,
      'accountability-pods': Users,
      integrations: Calendar,
      insights: BarChart3
    };
    return icons[stepId as keyof typeof icons] || Target;
  };

  const renderStepContent = (step: OnboardingStep) => {
    const Icon = getStepIcon(step.id);
    
    switch (step.id) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto">
              <Target className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Momentum AI! 🎯</h2>
              <p className="text-lg text-gray-600 mb-6">
                Your AI accountability agent is here to help you achieve your goals with personalized coaching, 
                peer accountability, and smart insights.
              </p>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-blue-800 font-medium">
                  ✨ You're one of our first 100 beta users! Your feedback will shape the future of goal achievement.
                </p>
              </div>
            </div>
          </div>
        );

      case 'first-goal':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Your First Goal</h2>
              <p className="text-gray-600 mb-6">
                Unlike other apps, we focus on the emotional "why" behind your goals for lasting motivation.
              </p>
            </div>
            
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Example Goal Setup:</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700"><strong>Goal:</strong> Write 500 words daily</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-700"><strong>Why:</strong> "I want to share my stories with the world"</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700"><strong>Frequency:</strong> Daily habit</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'ai-coach':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Meet Your AI Coach</h2>
              <p className="text-gray-600 mb-6">
                Your AI learns your patterns and provides contextual coaching based on your mood, progress, and goals.
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
              <h3 className="font-semibold text-purple-900 mb-4">AI Coaching Examples:</h3>
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">When you're struggling:</p>
                  <p className="text-purple-800 italic">"I notice you're 73% more successful at 9 AM. Want to reschedule your writing time?"</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">When you're on a streak:</p>
                  <p className="text-purple-800 italic">"Amazing! 12 days straight. Your consistency is building real momentum toward your dream."</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'check-in':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Daily Check-ins</h2>
              <p className="text-gray-600 mb-6">
                Our 4-step check-in process takes just 2 minutes but creates lasting accountability.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">📋</div>
                <h4 className="font-semibold text-blue-900">1. Track Habits</h4>
                <p className="text-sm text-blue-700">Mark completed goals</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">😊</div>
                <h4 className="font-semibold text-purple-900">2. Rate Mood</h4>
                <p className="text-sm text-purple-700">1-10 scale with context</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">💭</div>
                <h4 className="font-semibold text-green-900">3. Reflect</h4>
                <p className="text-sm text-green-700">Quick notes & thoughts</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">🤖</div>
                <h4 className="font-semibold text-orange-900">4. AI Insights</h4>
                <p className="text-sm text-orange-700">Personalized coaching</p>
              </div>
            </div>
          </div>
        );

      case 'accountability-pods':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Accountability Pods</h2>
              <p className="text-gray-600 mb-6">
                Join tiny 5-person groups for peer accountability. Real humans keeping you motivated!
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-4">Available Pods:</h3>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">✍️</span>
                    <div>
                      <div className="font-medium">Morning Writers</div>
                      <div className="text-sm text-gray-600">4/5 members</div>
                    </div>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Active</span>
                </div>
                <div className="bg-white rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">💪</span>
                    <div>
                      <div className="font-medium">Early Birds Fitness</div>
                      <div className="text-sm text-gray-600">3/5 members</div>
                    </div>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Join</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <Icon className="w-8 h-8 text-gray-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h2>
              <p className="text-gray-600">{step.description}</p>
            </div>
          </div>
        );
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Momentum AI Setup</h1>
            </div>
            <button 
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Step {currentStepIndex + 1} of {ONBOARDING_STEPS.length}</span>
              <span className="text-blue-600 font-medium">{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStep && renderStepContent(currentStep)}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStepIndex === 0}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              currentStepIndex === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex space-x-3">
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Skip Setup
            </button>
            <button
              onClick={handleNext}
              className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              <span>{currentStepIndex === ONBOARDING_STEPS.length - 1 ? 'Get Started' : 'Next'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 