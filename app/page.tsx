'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InsightCards, { InsightCategories } from '../src/components/InsightCards';
import StreakCard from '../src/components/StreakCard';
import DailyCheckInModal from '../src/components/DailyCheckInModal';
import OnboardingFlow from '../src/components/OnboardingFlow';
import GoalManager from '../src/components/GoalManager';
import AICoachPanel from '../src/components/AICoachPanel';

export default function HomePage() {
  const [currentView, setCurrentView] = useState<'insights' | 'dashboard' | 'goals' | 'chat' | 'check-in'>('insights');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: '',
    primaryGoal: '',
    isOnboarded: false,
    streak: 0,
    totalCheckIns: 0
  });

  const [streakData] = useState({
    currentStreak: 12,
    longestStreak: 25,
    totalDays: 45,
    weekData: [true, true, false, true, true, true, true], // S M T W T F S
    monthData: Array.from({ length: 30 }, (_, i) => Math.random() > 0.3), // 30 days with 70% completion
    streakType: 'check-in' as const,
    lastActivity: new Date().toISOString(),
    nextMilestone: 14
  });

  const [insights] = useState([
    {
      id: '1',
      text: "Your consistency is building something powerful. Every small action today is an investment in tomorrow's success.",
      type: 'motivation' as const,
      mood: 'focused',
      streak: 12,
      date: new Date().toISOString(),
      userName: 'You',
      category: 'motivation',
      confidence: 0.92,
      actionable: true,
      tags: ['motivation', 'consistency', 'growth']
    },
    {
      id: '2',
      text: "I see you struggle most on Wednesdays. What's different about that day? Understanding this pattern could unlock your week.",
      type: 'reflection' as const,
      mood: 'thoughtful',
      streak: 12,
      date: new Date().toISOString(),
      userName: 'You',
      category: 'reflection',
      confidence: 0.85,
      actionable: true,
      tags: ['reflection', 'patterns', 'self-awareness']
    },
    {
      id: '3',
      text: "You've mastered the basics. Ready for something that will stretch you? Try the 5-minute rule on your hardest task.",
      type: 'challenge' as const,
      mood: 'motivated',
      streak: 12,
      date: new Date().toISOString(),
      userName: 'You',
      category: 'challenge',
      confidence: 0.78,
      actionable: true,
      tags: ['challenge', 'growth', 'productivity']
    }
  ]);

  useEffect(() => {
    // Check if user needs onboarding
    const hasOnboarded = localStorage.getItem('momentum_onboarded');
    if (!hasOnboarded) {
      setShowOnboarding(true);
    } else {
      // Load user profile
      const savedProfile = localStorage.getItem('momentum_profile');
      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
      }
    }
  }, []);

  const handleOnboardingComplete = (profile: any) => {
    setUserProfile({ ...profile, isOnboarded: true });
    localStorage.setItem('momentum_onboarded', 'true');
    localStorage.setItem('momentum_profile', JSON.stringify(profile));
    setShowOnboarding(false);
  };

  const handleCheckInComplete = (checkInData: any) => {
    console.log('Check-in completed:', checkInData);
    setShowCheckInModal(false);
    
    // Update user stats
    setUserProfile(prev => ({
      ...prev,
      totalCheckIns: prev.totalCheckIns + 1,
      streak: prev.streak + 1
    }));

    // Show success feedback
    showToast('Check-in complete! Great job staying consistent! 🎉', 'success');
  };

  const handleInsightAction = (action: string, insight: any) => {
    console.log(`User ${action}ed insight:`, insight);
    
    if (action === 'save') {
      showToast('Insight saved to your collection! 💾', 'success');
    } else if (action === 'share') {
      // Native share if available
      if (navigator.share) {
        navigator.share({
          title: 'My Momentum Insight',
          text: insight.text,
          url: window.location.href
        });
      } else {
        // Fallback to clipboard
        navigator.clipboard.writeText(`${insight.text}\n\n- Shared from Momentum AI`);
        showToast('Insight copied to clipboard! 📋', 'success');
      }
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const event = new CustomEvent('showToast', {
      detail: { message, type }
    });
    window.dispatchEvent(event);
  };

  const renderInsightsView = () => (
    <div className="h-full flex flex-col">
      {/* Categories */}
      <div className="px-4 py-2 bg-gray-900/50 backdrop-blur-sm">
        <InsightCategories onCategorySelect={(category) => console.log('Selected:', category)} />
      </div>
      
      {/* Insights Feed */}
      <div className="flex-1 relative">
        <InsightCards 
          userId="demo-user"
          onInsightAction={handleInsightAction}
        />
      </div>
    </div>
  );

  const renderDashboardView = () => (
    <div className="p-4 space-y-6 max-w-md mx-auto">
      {/* Welcome Header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-4xl mb-2"
        >
          👋
        </motion.div>
        <h1 className="text-2xl font-bold text-gray-900">
          {userProfile.name ? `Hey ${userProfile.name}!` : 'Welcome back!'}
        </h1>
        <p className="text-gray-600">
          Ready to make today count?
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-4 text-white"
        >
          <div className="text-2xl font-bold">{streakData.currentStreak}</div>
          <div className="text-sm opacity-90">Day Streak</div>
        </motion.div>
        
        <motion.div
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-4 text-white"
        >
          <div className="text-2xl font-bold">{userProfile.totalCheckIns}</div>
          <div className="text-sm opacity-90">Check-ins</div>
        </motion.div>
      </div>

      {/* Streak Card */}
      <StreakCard
        streakData={streakData}
        onStreakTap={() => setShowCheckInModal(true)}
        compact={false}
      />

      {/* Quick Actions */}
      <div className="space-y-3">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCheckInModal(true)}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg"
        >
          🎯 Daily Check-In
        </motion.button>
        
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setCurrentView('insights')}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg"
        >
          💡 Get Insights
        </motion.button>
        
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setCurrentView('goals')}
          className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg"
        >
          🎯 My Goals
        </motion.button>
      </div>
    </div>
  );

  const renderGoalsView = () => (
    <div className="h-full bg-white text-gray-900 overflow-y-auto">
      <GoalManager 
        userId="demo-user"
        onGoalUpdate={(goal: any) => {
          console.log('Goal updated:', goal);
          showToast(`Goal "${goal.title}" updated! 🎯`, 'success');
        }}
      />
    </div>
  );

  const renderChatView = () => {
    const [chatMessages, setChatMessages] = useState<Array<{
      id: string;
      type: 'insight' | 'encouragement' | 'question' | 'reminder';
      content: string;
      timestamp: string;
      isAI: boolean;
    }>>([
      {
        id: '1',
        type: 'encouragement' as const,
        content: "Hey there! I'm your AI coach. I'm here to help you stay motivated and achieve your goals. What's on your mind today?",
        timestamp: new Date().toISOString(),
        isAI: true
      }
    ]);
    const [isTyping, setIsTyping] = useState(false);

    const handleSendMessage = async (message: string) => {
      // Add user message
      const userMessage = {
        id: Date.now().toString(),
        type: 'question' as const,
        content: message,
        timestamp: new Date().toISOString(),
        isAI: false
      };
      
      setChatMessages(prev => [...prev, userMessage]);
      setIsTyping(true);

      try {
        // Call AI chat API
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            userId: 'demo-user',
            goals: [], // Add user goals here
            userContext: {}
          })
        });

        const data = await response.json();
        
        // Add AI response
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          type: 'insight' as const,
          content: data.response || "I'm here to help you with your goals!",
          timestamp: new Date().toISOString(),
          isAI: true
        };
        
        setChatMessages(prev => [...prev, aiMessage]);
      } catch (error) {
        console.error('Chat error:', error);
        const errorMessage = {
          id: (Date.now() + 1).toString(),
          type: 'encouragement' as const,
          content: "I'm having trouble connecting right now, but I'm still here for you. What's challenging you today?",
          timestamp: new Date().toISOString(),
          isAI: true
        };
        setChatMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsTyping(false);
      }
    };

    return (
      <div className="h-full bg-white text-gray-900 flex flex-col">
        <AICoachPanel 
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          isTyping={isTyping}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden">
      {/* Onboarding Flow */}
      <AnimatePresence>
        {showOnboarding && (
          <OnboardingFlow
            isOpen={showOnboarding}
            onComplete={handleOnboardingComplete}
          />
        )}
      </AnimatePresence>

      {/* Daily Check-In Modal */}
      <AnimatePresence>
        {showCheckInModal && (
          <DailyCheckInModal
            isOpen={showCheckInModal}
            onClose={() => setShowCheckInModal(false)}
            onSubmit={handleCheckInComplete}
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🚀</div>
              <div>
                <h1 className="text-lg font-bold">Momentum AI</h1>
                <p className="text-xs text-gray-400">Your lifelong partner</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {currentView !== 'dashboard' && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setCurrentView('dashboard')}
                  className="p-2 rounded-full bg-gray-800 text-gray-300 hover:text-white"
                >
                  🏠
                </motion.button>
              )}
              
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowCheckInModal(true)}
                className="p-2 rounded-full bg-orange-500 text-white"
              >
                ✓
              </motion.button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {currentView === 'insights' && renderInsightsView()}
              {currentView === 'dashboard' && renderDashboardView()}
              {currentView === 'goals' && renderGoalsView()}
              {currentView === 'chat' && renderChatView()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Navigation */}
        <div className="flex-shrink-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-800 px-4 py-2">
          <div className="flex justify-around">
            {[
              { id: 'dashboard', icon: '🏠', label: 'Home' },
              { id: 'insights', icon: '💡', label: 'Insights' },
              { id: 'goals', icon: '🎯', label: 'Goals' },
              { id: 'chat', icon: '🤖', label: 'AI Coach' },
              { id: 'check-in', icon: '✓', label: 'Check-in' }
            ].map((tab) => (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  if (tab.id === 'check-in') {
                    setShowCheckInModal(true);
                  } else {
                    setCurrentView(tab.id as any);
                  }
                }}
                className={`
                  flex flex-col items-center space-y-1 py-2 px-3 rounded-lg
                  ${currentView === tab.id 
                    ? 'bg-blue-500/20 text-blue-400' 
                    : 'text-gray-400 hover:text-white'
                  }
                `}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="text-xs font-medium">{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
}

// Toast notification component
function ToastContainer() {
  const [toasts, setToasts] = useState<Array<{id: string, message: string, type: string}>>([]);

  useEffect(() => {
    const handleToast = (event: CustomEvent) => {
      const { message, type = 'info' } = event.detail;
      const id = Date.now().toString();
      
      setToasts(prev => [...prev, { id, message, type }]);
      
      // Auto remove after 3 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
      }, 3000);
    };

    window.addEventListener('showToast', handleToast as EventListener);
    return () => window.removeEventListener('showToast', handleToast as EventListener);
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            className={`
              px-4 py-3 rounded-lg shadow-lg text-white font-medium max-w-sm
              ${toast.type === 'success' ? 'bg-green-500' : 
                toast.type === 'error' ? 'bg-red-500' : 
                'bg-blue-500'}
            `}
          >
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
