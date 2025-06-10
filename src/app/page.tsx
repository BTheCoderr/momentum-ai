'use client';

import { useState } from 'react';
import { Target, Brain, TrendingUp, Heart, MessageSquare, Calendar } from 'lucide-react';
import GoalCard from '@/components/GoalCard';
import AICoachPanel from '@/components/AICoachPanel';
import ProgressDashboard from '@/components/ProgressDashboard';
import GoalCreationModal from '@/components/GoalCreationModal';
import { DailyCheckInModal } from '@/components/DailyCheckInModal';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isDailyCheckInOpen, setIsDailyCheckInOpen] = useState(false);
  const [showCheckInReminder, setShowCheckInReminder] = useState(true);
  
  // Mock data - in real app this would come from API/database
  const [userGoals, setUserGoals] = useState([
    {
      id: '1',
      title: 'Launch My SaaS Product',
      description: 'Build and launch my productivity app by Q2',
      progress: 65,
      emotionalContext: 'This represents my dream of financial freedom and creative fulfillment',
      deadline: '2025-12-31',
      status: 'on-track' as const,
      currentStreak: 12,
      bestStreak: 18,
      completionRate: 85,
      lastCheckIn: new Date().toISOString(),
      habits: [
        { id: 'h1', text: 'Code for 2 hours', completed: true },
        { id: 'h2', text: 'Write 1 blog post', completed: false },
        { id: 'h3', text: 'Talk to 1 potential user', completed: true }
      ]
    },
    {
      id: '2', 
      title: 'Get in Best Shape of My Life',
      description: 'Lose 25 pounds and run a half marathon',
      progress: 40,
      emotionalContext: 'I want to feel confident and energetic for my family',
      deadline: '2025-10-15',
      status: 'at-risk' as const,
      currentStreak: 3,
      bestStreak: 14,
      completionRate: 67,
      lastCheckIn: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(), // 25 hours ago
      habits: [
        { id: 'h4', text: 'Workout for 30 minutes', completed: false },
        { id: 'h5', text: 'Eat healthy meals', completed: true },
        { id: 'h6', text: 'Track calories', completed: false }
      ]
    }
  ]);

  const handleAddGoal = (newGoal: any) => {
    setUserGoals(prev => [...prev, newGoal]);
  };

  const handleDailyCheckIn = (completedHabits: { [goalId: string]: string[] }) => {
    const now = new Date().toISOString();
    
    setUserGoals(prev => prev.map(goal => {
      const completedHabitIds = completedHabits[goal.id] || [];
      const updatedHabits = goal.habits.map(habit => ({
        ...habit,
        completed: completedHabitIds.includes(habit.id)
      }));
      
      const habitCompletionRate = updatedHabits.filter(h => h.completed).length / updatedHabits.length;
      const shouldIncreaseStreak = habitCompletionRate >= 0.6; // 60% completion threshold
      
      return {
        ...goal,
        habits: updatedHabits,
        lastCheckIn: now,
        currentStreak: shouldIncreaseStreak ? goal.currentStreak + 1 : 0,
        bestStreak: shouldIncreaseStreak && (goal.currentStreak + 1) > goal.bestStreak 
          ? goal.currentStreak + 1 
          : goal.bestStreak,
        completionRate: Math.round((goal.completionRate + habitCompletionRate * 100) / 2) // Moving average
      };
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Momentum AI
                </h1>
                <p className="text-sm text-gray-500">Your AI Accountability Agent</p>
              </div>
            </div>
            
            <nav className="flex items-center space-x-6">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'dashboard' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
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
                onClick={() => setActiveTab('coach')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'coach' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
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
                <Heart className="w-4 h-4" />
                <span>Community</span>
              </button>
            </nav>
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
        </div>
      </section>

      {/* Daily Check-In Reminder */}
      {showCheckInReminder && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl p-6 text-white relative">
            <button
              onClick={() => setShowCheckInReminder(false)}
              className="absolute top-4 right-4 text-white/80 hover:text-white"
            >
              ✕
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">🔥 Ready for your daily check-in?</h3>
                <p className="text-orange-100 mb-4">
                  Keep your momentum going! Track your habits and celebrate today's wins.
                </p>
                <button
                  onClick={() => setIsDailyCheckInOpen(true)}
                  className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Start Check-In 🎉
                </button>
              </div>
              <div className="text-6xl opacity-50">
                🎯
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <ProgressDashboard goals={userGoals} />
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-2xl font-bold text-green-600">85%</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Overall Progress</h3>
                <p className="text-gray-600 text-sm">You're crushing it this month!</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Brain className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-2xl font-bold text-blue-600">12</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">AI Interventions</h3>
                <p className="text-gray-600 text-sm">Timely nudges this week</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Heart className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-2xl font-bold text-purple-600">94%</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Motivation Score</h3>
                <p className="text-gray-600 text-sm">Emotional connection strong</p>
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
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'coach' && (
          <AICoachPanel />
        )}

        {activeTab === 'community' && (
          <div className="space-y-8">
            {/* Community Header */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Community Leaderboard</h2>
              <p className="text-gray-600">See how you stack up against other goal crushers!</p>
            </div>

            {/* Your Stats */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Your Rank</h3>
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl font-bold">#7</span>
                    <div>
                      <p className="text-blue-100">Total Streaks: 47 days</p>
                      <p className="text-blue-100">Active Goals: 2</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors">
                    Share Progress
                  </button>
                </div>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">This Week's Champions</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {[
                    { rank: 1, name: 'Alex K.', streaks: 89, avatar: '🚀' },
                    { rank: 2, name: 'Sarah M.', streaks: 76, avatar: '💪' },
                    { rank: 3, name: 'Mike R.', streaks: 68, avatar: '🎯' },
                    { rank: 4, name: 'Emma L.', streaks: 54, avatar: '✨' },
                    { rank: 5, name: 'David C.', streaks: 51, avatar: '🔥' },
                    { rank: 6, name: 'Lisa W.', streaks: 49, avatar: '🌟' },
                    { rank: 7, name: 'You', streaks: 47, avatar: '👤', isUser: true }
                  ].map((user) => (
                    <div key={user.rank} className={`flex items-center justify-between p-3 rounded-lg ${
                      user.isUser ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                    }`}>
                      <div className="flex items-center space-x-4">
                        <span className="text-lg font-bold text-gray-500 w-8">#{user.rank}</span>
                        <span className="text-2xl">{user.avatar}</span>
                        <span className={`font-medium ${user.isUser ? 'text-blue-700' : 'text-gray-900'}`}>
                          {user.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-gray-900">{user.streaks} days</span>
                        <p className="text-xs text-gray-500">total streaks</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Weekly Challenges */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Weekly Challenges</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2">🏃‍♂️ Consistency Challenge</h4>
                    <p className="text-green-700 text-sm mb-3">Complete all daily habits for 7 days straight</p>
                    <div className="flex items-center justify-between">
                      <span className="text-green-600 text-sm">4/7 days</span>
                      <div className="w-20 bg-green-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: '57%'}}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-purple-800 mb-2">🎯 Focus Challenge</h4>
                    <p className="text-purple-700 text-sm mb-3">Work on your top goal for 5 hours this week</p>
                    <div className="flex items-center justify-between">
                      <span className="text-purple-600 text-sm">3.2/5 hours</span>
                      <div className="w-20 bg-purple-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{width: '64%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Goal Creation Modal */}
      <GoalCreationModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSave={handleAddGoal}
      />

      {/* Daily Check-In Modal */}
      <DailyCheckInModal
        isOpen={isDailyCheckInOpen}
        onClose={() => setIsDailyCheckInOpen(false)}
        goals={userGoals}
        onComplete={handleDailyCheckIn}
      />
    </div>
  );
}
