'use client';

import { useState } from 'react';
import { Target, Brain, TrendingUp, Heart, MessageSquare, Calendar } from 'lucide-react';
import GoalCard from '@/components/GoalCard';
import AICoachPanel from '@/components/AICoachPanel';
import ProgressDashboard from '@/components/ProgressDashboard';
import GoalCreationModal from '@/components/GoalCreationModal';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  
  // Mock data - in real app this would come from API/database
  const [userGoals, setUserGoals] = useState([
    {
      id: '1',
      title: 'Launch My SaaS Product',
      description: 'Build and launch my productivity app by Q2',
      progress: 65,
      emotionalContext: 'This represents my dream of financial freedom and creative fulfillment',
      deadline: '2025-12-31',
      status: 'on-track' as const
    },
    {
      id: '2', 
      title: 'Get in Best Shape of My Life',
      description: 'Lose 25 pounds and run a half marathon',
      progress: 40,
      emotionalContext: 'I want to feel confident and energetic for my family',
      deadline: '2025-10-15',
      status: 'at-risk' as const
    }
  ]);

  const handleAddGoal = (newGoal: any) => {
    setUserGoals(prev => [...prev, newGoal]);
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
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'coach' && (
          <AICoachPanel />
        )}
      </main>

      {/* Goal Creation Modal */}
      <GoalCreationModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSave={handleAddGoal}
      />
    </div>
  );
}
