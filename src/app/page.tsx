'use client';

import { useState, useEffect } from 'react';
import { Target, Brain, TrendingUp, Heart, MessageSquare, Calendar, DollarSign, AlertTriangle, Users, BarChart3, Settings, Plus, Zap, Trophy, Lightbulb, Crown, Server } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useGoals } from '@/hooks/useGoals';
import { useMessages } from '@/hooks/useMessages';
import { usePersistedGoals, usePersistedMessages } from '@/hooks/useLocalStorage';
import GoalCard from '@/components/GoalCard';
import AICoachPanel from '@/components/AICoachPanel';
import ProgressDashboard from '@/components/ProgressDashboard';
import GoalModal from '@/components/GoalModal';
import { DailyCheckInModal } from '@/components/DailyCheckInModal';
import SmartCheckIn from '@/components/SmartCheckIn';
import ProgressShare from '@/components/ProgressShare';
import InsightCards from '@/components/InsightCards';
import AccountabilityPods from '@/components/AccountabilityPods';
import IntegrationHub from '@/components/IntegrationHub';
import GoalCreationModal from '@/components/GoalCreationModal';
import OnboardingFlow from '@/components/OnboardingFlow';
import BetaUserBanner from '@/components/BetaUserBanner';
import ProductHuntLanding from '@/components/ProductHuntLanding';
import LoginButton from '@/components/LoginButton';
import PricingTiers from '@/components/PricingTiers';
import { DailyCheckInCard } from '@/components/DailyCheckInCard';
import { Goal, Message } from '@/types';
import AIGoalRecommendations from '@/components/AIGoalRecommendations';
import AchievementSystem from '@/components/AchievementSystem';
import Leaderboard from '@/components/Leaderboard';
import AdvancedAnalytics from '@/components/AdvancedAnalytics';
import SubscriptionManager from '@/components/SubscriptionManager';
import TeamManagement from '@/components/TeamManagement';
import APIIntegration from '@/components/APIIntegration';
import WhiteLabel from '@/components/WhiteLabel';
import AdvancedReporting from '@/components/AdvancedReporting';
import LaunchInfrastructure from '@/components/LaunchInfrastructure';
import PWAInstaller from '@/components/PWAInstaller';
import OfflineIndicator from '@/components/OfflineIndicator';

interface Habit {
  id: string;
  text: string;
  completed: boolean;
}

export default function Home() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [communityTab, setCommunityTab] = useState('pods');
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isDailyCheckInOpen, setIsDailyCheckInOpen] = useState(false);
  const [isSmartCheckInOpen, setIsSmartCheckInOpen] = useState(false);
  const [isProgressShareOpen, setIsProgressShareOpen] = useState(false);
  const [showCheckInReminder, setShowCheckInReminder] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [isNewUser, setIsNewUser] = useState(true);
  const [isProductHuntVisitor, setIsProductHuntVisitor] = useState(false);
  const [showSubscriptionManager, setShowSubscriptionManager] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<'free' | 'pro' | 'enterprise'>('enterprise'); // Set to enterprise for testing
  
  // Use real data hooks with localStorage fallback
  const { goals: apiGoals, loading: goalsLoading, createGoal, submitCheckIn } = useGoals();
  const { messages: apiMessages, sendMessage, isTyping } = useMessages();
  
  // LocalStorage persistence for offline functionality
  const { goals: localGoals, addGoal: addLocalGoal } = usePersistedGoals();
  const { messages: localMessages, addMessage: addLocalMessage } = usePersistedMessages();
  
  // Use API data when available, fallback to localStorage
  const userGoals = apiGoals.length > 0 ? apiGoals : localGoals;
  const messages = apiMessages.length > 0 ? apiMessages : localMessages;
  
  // TEMPORARY: Mock session for testing dashboard
  const mockSession = {
    user: {
      name: "Test User",
      email: "test@example.com",
      id: "test-user-id"
    }
  };
  
  // Use real session (remove mock when testing auth)
  const currentSession = session || mockSession;

  // Check for Product Hunt referral
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const ref = urlParams.get('ref');
      const utm_source = urlParams.get('utm_source');
      
      if (ref === 'producthunt' || utm_source === 'producthunt' || 
          document.referrer.includes('producthunt.com')) {
        setIsProductHuntVisitor(true);
      }
    }
  }, []);

  // Mock user profile for AI recommendations
  const userProfile = {
    currentGoals: userGoals,
    completedGoals: [], // This would come from your database
    preferences: ['productivity', 'health', 'learning'],
    availableTime: '1-2 hours/day',
    experience: 'intermediate'
  };

  // Mock user stats for achievements
  const userStats = {
    totalGoals: userGoals.length,
    completedGoals: 3, // This would come from your database
    currentStreak: 12,
    longestStreak: 45,
    totalCheckIns: 87,
    daysActive: 156,
    podParticipation: 2
  };

  const handleAddGoal = async (newGoal: any) => {
    try {
      // Try API first
      await createGoal(newGoal);
      alert('🎯 Goal created successfully! Your journey begins now.');
    } catch (error) {
      console.error('Failed to create goal via API, saving locally:', error);
      // Fallback to localStorage
      addLocalGoal(newGoal);
      alert('🎯 Goal created and saved locally! Your journey begins now.');
    }
    setIsGoalModalOpen(false);
  };

  const handleDailyCheckIn = async (completedHabits: { [goalId: string]: string[] }) => {
    try {
      for (const [goalId, habitIds] of Object.entries(completedHabits)) {
        await submitCheckIn(goalId, { completedHabits: habitIds });
      }
    } catch (error) {
      console.error('Failed to submit check-in:', error);
    }
  };

  const handleSendMessage = async (message: string) => {
    try {
      await sendMessage(message);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Handler functions for dashboard insight buttons
  const handleScheduleIntervention = () => {
    console.log('Scheduling intervention...');
    alert('📅 Opening calendar to schedule a workout buddy session...');
  };

  const handleKeepGoing = () => {
    console.log('Keep going action...');
    alert('🚀 Great momentum! Setting up additional motivation reminders...');
  };

  const handleOptimizeSchedule = () => {
    console.log('Optimizing schedule...');
    alert('⚡ Analyzing your patterns to optimize your Tuesday morning schedule...');
  };

  const handleSelectRecommendedGoal = (goal: any) => {
    console.log('Selected recommended goal:', goal);
    // Convert recommendation to goal format and add it
    const newGoal = {
      id: Date.now().toString(),
      title: goal.title,
      description: goal.description,
      emotionalContext: goal.reasoning,
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days from now
      habits: goal.habits.map((habit: string, index: number) => ({
        id: `${Date.now()}-${index}`,
        text: habit,
        completed: false
      })),
      progress: 0,
      streak: 0,
      lastCheckIn: null
    };
    
    handleAddGoal(newGoal);
    setActiveTab('goals'); // Switch to goals tab to see the new goal
  };

  // Show Product Hunt landing page for visitors from Product Hunt
  if (isProductHuntVisitor && !currentSession) {
    return (
      <ProductHuntLanding 
        onGetStarted={() => {
          setIsProductHuntVisitor(false);
          setShowOnboarding(true);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Beta User Banner */}
      {currentSession && isNewUser && (
        <BetaUserBanner 
          userId={currentSession.user?.id} 
          userNumber={Math.floor(Math.random() * 100) + 1}
        />
      )}

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 flex items-center justify-center">
                <img 
                  src="/images/momentum-logo.svg" 
                  alt="Momentum AI Logo" 
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Momentum AI
                </h1>
                <p className="text-sm text-gray-500">Your AI Accountability Agent</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              {currentSession && (
                <nav className="flex items-center space-x-6">
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      activeTab === 'dashboard' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Dashboard</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('goals')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      activeTab === 'goals' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Target className="w-4 h-4" />
                    <span>Goals</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('recommendations')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      activeTab === 'recommendations' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Lightbulb className="w-4 h-4" />
                    <span>AI Suggestions</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('coach')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      activeTab === 'coach' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Brain className="w-4 h-4" />
                    <span>AI Coach</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('community')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      activeTab === 'community' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Community</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('achievements')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      activeTab === 'achievements' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Trophy className="w-4 h-4" />
                    <span>Achievements</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('integrations')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      activeTab === 'integrations' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Integrations</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      activeTab === 'analytics' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Analytics</span>
                  </button>
                  {(currentPlan === 'pro' || currentPlan === 'enterprise') && (
                    <>
                      <button
                        onClick={() => setActiveTab('team')}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                          activeTab === 'team' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <Users className="w-4 h-4" />
                        <span>Team</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('api')}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                          activeTab === 'api' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <Settings className="w-4 h-4" />
                        <span>API</span>
                      </button>
                    </>
                  )}
                  {currentPlan === 'enterprise' && (
                    <>
                      <button
                        onClick={() => setActiveTab('white-label')}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                          activeTab === 'white-label' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Brand</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('reports')}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                          activeTab === 'reports' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <BarChart3 className="w-4 h-4" />
                        <span>Reports</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('infrastructure')}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                          activeTab === 'infrastructure' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <Server className="w-4 h-4" />
                        <span>Deploy</span>
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setShowSubscriptionManager(true)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-gray-600 hover:text-gray-900 relative"
                  >
                    <Crown className="w-4 h-4" />
                    <span>Upgrade</span>
                    {currentPlan === 'free' && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full"></span>
                    )}
                  </button>
                </nav>
              )}
              <LoginButton />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Brain className="w-4 h-4" />
            <span>AI-Powered Accountability</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Stay Emotionally Connected <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              To Your Goals
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Your AI accountability agent predicts when you'll drift from your goals and intervenes proactively. 
            Like having a mini-therapist + detective that keeps your dreams alive.
          </p>

          {!currentSession && (
            <>
              <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 max-w-md mx-auto mb-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Start?</h3>
                <p className="text-gray-600 mb-6">
                  Sign in to create your first goal and start your accountability journey.
                </p>
                <LoginButton />
              </div>
              {/* <PricingTiers /> */}
            </>
          )}
        </div>
      </section>

      {/* Daily Check-In Reminder */}
      {currentSession && showCheckInReminder && (
        <DailyCheckInCard
          onDismiss={() => setShowCheckInReminder(false)}
          onStartCheckIn={() => setIsSmartCheckInOpen(true)}
        />
      )}

      {/* Main Content */}
      {currentSession && (
        <>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 lg:pb-8">
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Overview Cards - Exactly like the screenshot */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Target className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-xl font-bold text-blue-600">2</div>
                        <div className="text-sm text-gray-600">Active Goals</div>
                        <div className="text-xs text-gray-500">Currently tracking</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="text-xl font-bold text-green-600">53%</div>
                        <div className="text-sm text-gray-600">Avg Progress</div>
                        <div className="text-xs text-gray-500">Across all goals</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <div className="text-xl font-bold text-amber-600">1</div>
                        <div className="text-sm text-gray-600">At Risk</div>
                        <div className="text-xs text-gray-500">Need attention</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                        <Brain className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-xl font-bold text-purple-600">3</div>
                        <div className="text-sm text-gray-600">AI Insights</div>
                        <div className="text-xs text-gray-500">This week</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charts Section - Exactly like the screenshot */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Goal Progress Chart */}
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Goal Progress</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Launch My</span>
                          <span className="text-sm text-gray-500">65%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                          <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full" style={{ width: '65%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Get in</span>
                          <span className="text-sm text-gray-500">40%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                          <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full" style={{ width: '40%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Weekly Trend Chart */}
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Weekly Trend</h3>
                    <div className="relative h-48">
                      {/* Simple line chart representation */}
                      <svg className="w-full h-full" viewBox="0 0 300 150">
                        {/* Grid lines */}
                        <defs>
                          <pattern id="grid" width="60" height="30" patternUnits="userSpaceOnUse">
                            <path d="M 60 0 L 0 0 0 30" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                        
                        {/* Progress line (solid) */}
                        <polyline
                          fill="none"
                          stroke="#4F46E5"
                          strokeWidth="2"
                          points="30,120 90,100 150,90 210,75 270,60"
                        />
                        
                        {/* Motivation line (dotted) */}
                        <polyline
                          fill="none"
                          stroke="#7C3AED"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                          points="30,110 90,105 150,95 210,85 270,70"
                        />
                        
                        {/* Data points */}
                        <circle cx="30" cy="120" r="3" fill="#4F46E5"/>
                        <circle cx="90" cy="100" r="3" fill="#4F46E5"/>
                        <circle cx="150" cy="90" r="3" fill="#4F46E5"/>
                        <circle cx="210" cy="75" r="3" fill="#4F46E5"/>
                        <circle cx="270" cy="60" r="3" fill="#4F46E5"/>
                        
                        <circle cx="30" cy="110" r="3" fill="#7C3AED"/>
                        <circle cx="90" cy="105" r="3" fill="#7C3AED"/>
                        <circle cx="150" cy="95" r="3" fill="#7C3AED"/>
                        <circle cx="210" cy="85" r="3" fill="#7C3AED"/>
                        <circle cx="270" cy="70" r="3" fill="#7C3AED"/>
                      </svg>
                      
                      {/* Week labels */}
                      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 px-4">
                        <span>Week 1</span>
                        <span>Week 2</span>
                        <span>Week 3</span>
                        <span>Week 4</span>
                      </div>
                    </div>
                    
                    {/* Legend */}
                    <div className="flex items-center justify-center space-x-6 mt-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                        <span className="text-sm text-gray-600">Progress</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-0.5 bg-purple-600"></div>
                        <span className="text-sm text-gray-600">Motivation</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Personal Insights - New Enhanced Section */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <InsightCards 
                    userPatterns={{
                      bestPerformanceTime: "between 9-11 AM",
                      streakPattern: "You typically recover from setbacks within 2 days when you restart immediately",
                      motivationTriggers: ["Morning coffee", "Accountability partner check-ins", "Progress visualization"],
                      riskFactors: ["Sunday evenings", "high stress days"],
                      successRate: 73,
                      weeklyTrend: "up"
                    }}
                  />
                </div>

                {/* AI Insights & Interventions - Exactly like the screenshot */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">AI Insights & Interventions</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                            <h4 className="font-semibold text-gray-900">Motivation Dip Detected</h4>
                          </div>
                          <p className="text-gray-600 text-sm">Your fitness goal shows 20% less activity this week. Consider scheduling a workout buddy session.</p>
                        </div>
                        <button 
                          onClick={handleScheduleIntervention}
                          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-amber-50 text-amber-700 hover:bg-amber-100"
                        >
                          Schedule Intervention
                        </button>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <h4 className="font-semibold text-gray-900">Strong Momentum</h4>
                          </div>
                          <p className="text-gray-600 text-sm">Your SaaS project is ahead of schedule! This aligns with your pattern of weekend productivity.</p>
                        </div>
                        <button 
                          onClick={handleKeepGoing}
                          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-green-50 text-green-700 hover:bg-green-100"
                        >
                          Keep Going
                        </button>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <h4 className="font-semibold text-gray-900">Pattern Recognition</h4>
                          </div>
                          <p className="text-gray-600 text-sm">You tend to be most productive on Tuesday mornings. Consider scheduling important tasks then.</p>
                        </div>
                        <button 
                          onClick={handleOptimizeSchedule}
                          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-blue-50 text-blue-700 hover:bg-blue-100"
                        >
                          Optimize Schedule
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Stats Cards - Exactly like the screenshot */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">85%</div>
                        <div className="text-base font-semibold text-gray-900">Overall Progress</div>
                        <div className="text-sm text-gray-600">You're crushing it this month!</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Brain className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">12</div>
                        <div className="text-base font-semibold text-gray-900">AI Interventions</div>
                        <div className="text-sm text-gray-600">Timely nudges this week</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                        <Heart className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">94%</div>
                        <div className="text-base font-semibold text-gray-900">Motivation Score</div>
                        <div className="text-sm text-gray-600">Emotional connection strong</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'goals' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Your Goals</h2>
                  <button 
                    onClick={() => setIsGoalModalOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-shadow"
                  >
                    + Add New Goal
                  </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {userGoals.map((goal) => (
                    <GoalCard 
                      key={goal.id} 
                      goal={goal} 
                      onCheckIn={() => setIsDailyCheckInOpen(true)}
                      onShareProgress={() => setIsProgressShareOpen(true)}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'recommendations' && (
              <AIGoalRecommendations 
                userProfile={userProfile}
                onSelectGoal={handleSelectRecommendedGoal}
              />
            )}

            {activeTab === 'coach' && (
              <div className="space-y-6">
                {/* AI Coach Header - Exactly like deployed version */}
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-2xl font-bold text-gray-900">AI Accountability Coach</h2>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-green-600 font-medium">Active</span>
                      </div>
                    </div>
                    <p className="text-gray-600">Your personal motivation detective</p>
                  </div>
                  <div className="ml-auto">
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">Elite</span>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[500px] flex flex-col">
                  <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                    {/* AI Question Message */}
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Brain className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Brain className="w-4 h-4 text-purple-600" />
                            <span className="text-sm font-medium text-purple-600">Question</span>
                          </div>
                          <p className="text-gray-800">
                            Hi! I've been analyzing your progress and I noticed something interesting. You've been making great 
                            progress on your SaaS goal, but your fitness goal seems to be lagging. What's going on?
                          </p>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">06:22 PM</div>
                      </div>
                    </div>

                    {/* User Response */}
                    <div className="flex items-start space-x-3 justify-end">
                      <div className="flex-1 max-w-md">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-4">
                          <p>
                            You're right. I've been so focused on my startup that I've been skipping workouts. 
                            I know it's important but I just can't find the time.
                          </p>
                        </div>
                        <div className="text-xs text-gray-500 mt-2 text-right">06:24 PM</div>
                      </div>
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-medium">U</span>
                      </div>
                    </div>

                    {/* AI Insight Message */}
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Brain className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Brain className="w-4 h-4 text-purple-600" />
                            <span className="text-sm font-medium text-purple-600">Insight</span>
                          </div>
                          <p className="text-gray-800">
                            I understand that completely. Here's what I've learned about your patterns: you're most energetic in the mornings, 
                            and you mentioned that staying fit makes you feel confident and energetic for your family. What if we tried 15-minute 
                            morning workouts instead of hour-long gym sessions?
                          </p>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">06:25 PM</div>
                      </div>
                    </div>

                    {/* Additional messages from the messages state */}
                    {messages.slice(3).map((message, index) => (
                      <div key={index} className={`flex items-start space-x-3 ${message.sender === 'user' ? 'justify-end' : ''}`}>
                        {message.sender === 'ai' && (
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <Brain className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div className={`flex-1 ${message.sender === 'user' ? 'max-w-md' : ''}`}>
                          <div className={`rounded-lg p-4 ${
                            message.sender === 'user' 
                              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                              : 'bg-gray-50'
                          }`}>
                            {message.sender === 'ai' && (
                              <div className="flex items-center space-x-2 mb-2">
                                <Brain className="w-4 h-4 text-purple-600" />
                                <span className="text-sm font-medium text-purple-600">{message.type || 'Response'}</span>
                              </div>
                            )}
                            <p className={message.sender === 'user' ? 'text-white' : 'text-gray-800'}>
                              {message.content}
                            </p>
                          </div>
                          <div className={`text-xs text-gray-500 mt-2 ${message.sender === 'user' ? 'text-right' : ''}`}>
                            {message.timestamp}
                          </div>
                        </div>
                        {message.sender === 'user' && (
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-sm font-medium">U</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="border-t border-gray-200 p-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="text"
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        onKeyPress={(e) => {
                          const target = e.target as HTMLInputElement;
                          if (e.key === 'Enter' && target.value.trim()) {
                            handleSendMessage(target.value);
                            target.value = '';
                          }
                        }}
                      />
                      <button 
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow"
                        onClick={(e) => {
                          const button = e.target as HTMLButtonElement;
                          const input = button.parentElement?.querySelector('input') as HTMLInputElement;
                          if (input?.value.trim()) {
                            handleSendMessage(input.value);
                            input.value = '';
                          }
                        }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-2 text-center">
                      Your AI coach is here to help you stay connected to your deeper motivations and overcome obstacles.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'community' && (
              <div className="space-y-6">
                <div className="flex space-x-2 mb-6">
                  <button
                    onClick={() => setCommunityTab('pods')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      communityTab === 'pods'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Accountability Pods
                  </button>
                  <button
                    onClick={() => setCommunityTab('leaderboard')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      communityTab === 'leaderboard'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Leaderboard
                  </button>
                </div>
                
                {communityTab === 'pods' && <AccountabilityPods />}
                {communityTab === 'leaderboard' && <Leaderboard currentUserId="current-user" />}
              </div>
            )}

            {activeTab === 'integrations' && (
              <IntegrationHub />
            )}

            {activeTab === 'achievements' && (
              <AchievementSystem userStats={userStats} />
            )}

            {activeTab === 'analytics' && (
              <AdvancedAnalytics currentPlan={currentPlan} />
            )}

            {activeTab === 'plans' && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-900">Choose Your Plan</h2>
                  <p className="mt-4 text-xl text-gray-600">
                    Unlock more features and achieve your goals faster
                  </p>
                </div>
                              <PricingTiers />
              </div>
            )}

            {activeTab === 'team' && (
              <TeamManagement 
                currentUserRole={currentPlan === 'enterprise' ? 'admin' : 'manager'}
                organizationId="org-123"
              />
            )}

            {activeTab === 'api' && (
              <APIIntegration />
            )}

            {activeTab === 'white-label' && (
              <WhiteLabel />
            )}

            {activeTab === 'reports' && (
              <AdvancedReporting />
            )}

            {activeTab === 'infrastructure' && (
              <LaunchInfrastructure />
            )}
          </main>

          {/* Goal Creation Modal */}
          <GoalModal
            isOpen={isGoalModalOpen}
            onClose={() => setIsGoalModalOpen(false)}
            onSubmit={handleAddGoal}
          />

          {/* Daily Check-In Modal */}
          <DailyCheckInModal
            isOpen={isDailyCheckInOpen}
            onClose={() => setIsDailyCheckInOpen(false)}
            goals={userGoals}
            onComplete={(data) => {
              console.log('Check-in data:', data);
              setIsDailyCheckInOpen(false);
            }}
          />

          {/* Smart Check-In Modal */}
          {isSmartCheckInOpen && (
            <SmartCheckIn
              goals={userGoals}
              onComplete={(data) => {
                console.log('Smart check-in completed:', data);
                
                // Update localStorage with check-in data
                const checkInData = {
                  id: `checkin-${Date.now()}`,
                  date: new Date().toISOString(),
                  completedHabits: data.selectedHabits,
                  mood: data.mood,
                  notes: data.notes,
                  aiInsight: data.aiInsight
                };
                
                // Store in localStorage
                const existingCheckIns = JSON.parse(localStorage.getItem('momentum-checkins') || '[]');
                existingCheckIns.unshift(checkInData);
                localStorage.setItem('momentum-checkins', JSON.stringify(existingCheckIns.slice(0, 30))); // Keep last 30
                
                // Try to submit to API
                handleDailyCheckIn(data.selectedHabits);
                
                // Close modal and hide reminder
                setIsSmartCheckInOpen(false);
                setShowCheckInReminder(false);
                
                // Show success message
                setTimeout(() => {
                  alert('✅ Check-in completed! Your progress has been saved.');
                }, 500);
              }}
              onClose={() => setIsSmartCheckInOpen(false)}
            />
          )}

          {/* Progress Share Modal */}
          {isProgressShareOpen && (
            <ProgressShare
              goals={userGoals}
              weeklyStats={{
                habitsCompleted: 24,
                avgMood: 7.5,
                streakDays: 12,
                completionRate: 85
              }}
              onClose={() => setIsProgressShareOpen(false)}
            />
          )}

          {/* Onboarding Flow for New Users */}
          {currentSession && showOnboarding && isNewUser && (
            <OnboardingFlow
              userId={currentSession.user?.id}
              onComplete={() => {
                setShowOnboarding(false);
                setIsNewUser(false);
              }}
              onSkip={() => {
                setShowOnboarding(false);
                setIsNewUser(false);
              }}
            />
          )}

          {/* Subscription Manager Modal */}
          {showSubscriptionManager && (
            <SubscriptionManager
              onClose={() => setShowSubscriptionManager(false)}
            />
          )}

          {/* PWA Install Prompt */}
          <PWAInstaller />

          {/* Offline Indicator */}
          <OfflineIndicator />
        </>
      )}
    </div>
  );
}
