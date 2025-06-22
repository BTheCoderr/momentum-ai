'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Authentication Component
const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    primaryGoal: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Login with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;
        
        console.log('✅ Login successful:', data);
      } else {
        // Sign up with Supabase
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name,
              phone: formData.phone,
              primary_goal: formData.primaryGoal,
            }
          }
        });

        if (error) throw error;

        console.log('✅ Signup successful:', data);
        
        // Create user profile
        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: data.user.id,
                full_name: formData.name,
                email: formData.email,
                phone: formData.phone,
                primary_goal: formData.primaryGoal,
                created_at: new Date().toISOString()
              }
            ]);
          
          if (profileError) {
            console.log('Profile creation error:', profileError);
          }
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setError(error.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Momentum AI
          </h1>
          <p className="text-gray-600">
            Your AI-powered accountability partner
          </p>
        </div>

        <div className="flex mb-6">
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 px-4 rounded-l-lg transition-colors ${
              !isLogin 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Sign Up
          </button>
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 px-4 rounded-r-lg transition-colors ${
              isLogin 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Login
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Goal
                </label>
                <select
                  required
                  value={formData.primaryGoal}
                  onChange={(e) => setFormData({...formData, primaryGoal: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select your main focus</option>
                  <option value="fitness">Health & Fitness</option>
                  <option value="career">Career Growth</option>
                  <option value="learning">Learning & Skills</option>
                  <option value="habits">Daily Habits</option>
                  <option value="mindfulness">Mindfulness & Mental Health</option>
                  <option value="productivity">Productivity</option>
                  <option value="relationships">Relationships</option>
                  <option value="creativity">Creativity & Hobbies</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="For accountability reminders"
                />
            </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Create a secure password"
            />
        </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Start Your Journey')}
          </button>
        </form>

        {!isLogin && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">🚀 What You'll Get:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• AI-powered daily check-ins</li>
              <li>• Personalized coaching insights</li>
              <li>• Streak tracking & motivation</li>
              <li>• Progress analytics & patterns</li>
            </ul>
          </div>
        )}
      </div>
            </div>
  );
};

// Simple Dashboard Components
const DailyCheckInCard = () => (
  <div className="bg-white rounded-xl shadow-sm border p-6">
    <h3 className="text-lg font-semibold mb-4">Daily Check-In</h3>
    <p className="text-gray-600 mb-4">How are you feeling today?</p>
    <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
      Start Check-In
    </button>
                  </div>
);

const ProgressDashboard = () => (
  <div className="bg-white rounded-xl shadow-sm border p-6">
    <h3 className="text-lg font-semibold mb-4">Progress Dashboard</h3>
    <p className="text-gray-600 mb-4">Track your journey and celebrate wins</p>
    <div className="grid grid-cols-3 gap-4">
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600">0</div>
        <div className="text-sm text-gray-500">Goals</div>
                  </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">0</div>
        <div className="text-sm text-gray-500">Streak</div>
                  </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-purple-600">0</div>
        <div className="text-sm text-gray-500">Check-ins</div>
                    </div>
                  </div>
                </div>
);

const InsightCards = () => (
  <div className="bg-white rounded-xl shadow-sm border p-6">
    <h3 className="text-lg font-semibold mb-4">AI Insights</h3>
    <p className="text-gray-600 mb-4">Get personalized insights from your AI coach</p>
    <div className="text-center py-8">
      <div className="text-4xl mb-4">🌱</div>
      <p className="text-gray-500">Complete a few check-ins to unlock insights</p>
    </div>
  </div>
);

const StreakCard = () => (
  <div className="bg-white rounded-xl shadow-sm border p-6">
    <h3 className="text-lg font-semibold mb-4">Your Streak</h3>
    <div className="text-center">
      <div className="text-3xl font-bold text-orange-600 mb-2">0</div>
      <p className="text-gray-600">Days in a row</p>
    </div>
    <button className="w-full mt-4 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors">
      Start Today's Check-In
    </button>
  </div>
);

const GoalCard = () => (
  <div className="bg-white rounded-xl shadow-sm border p-6">
    <h3 className="text-lg font-semibold mb-4">Your Goals</h3>
    <p className="text-gray-600 mb-4">Set and track your objectives</p>
    <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
      Add Your First Goal
    </button>
  </div>
);

const AICoachPanel = () => (
  <div className="bg-white rounded-xl shadow-sm border p-6">
    <h3 className="text-lg font-semibold mb-4">AI Coach</h3>
    <div className="space-y-4">
      <div className="bg-blue-50 p-3 rounded-lg">
        <p className="text-sm text-blue-800">👋 Hello! I'm your AI coach. How can I help you today?</p>
      </div>
      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="Ask me anything..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
          Send
        </button>
                        </div>
                      </div>
                    </div>
    );

// Main App Component
const MainApp = ({ user }: { user: any }) => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

    return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Momentum AI
          </h1>
        </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome back, {user?.user_metadata?.full_name || user?.email || 'User'}!
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Logout
              </button>
          </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <DailyCheckInCard />
            <ProgressDashboard />
              <InsightCards />
                    </div>

          {/* Right Column */}
          <div className="space-y-8">
            <StreakCard />
            <GoalCard />
            <AICoachPanel />
                  </div>
                </div>
      </main>
    </div>
  );
};

// Root Component with Supabase Authentication
export default function Home() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Momentum AI...</p>
        </div>
      </div>
    );
  }

  return user ? <MainApp user={user} /> : <AuthScreen />;
}
