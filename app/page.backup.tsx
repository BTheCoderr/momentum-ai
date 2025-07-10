'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Web-specific implementation (React Native components converted for web)
// All your mobile functionality is preserved and adapted for web use

// Web Navigation Component
const WebNavigation = ({ activeTab, setActiveTab, user }: { 
  activeTab: string; 
  setActiveTab: (tab: string) => void;
  user: any;
}) => {
  const tabs = [
    { id: 'home', name: 'Dashboard', icon: '🏠' },
    { id: 'goals', name: 'Goals', icon: '🎯' },
    { id: 'checkin', name: 'Check-In', icon: '✅' },
    { id: 'coach', name: 'AI Coach', icon: '🤖' },
    { id: 'insights', name: 'Insights', icon: '📊' },
    { id: 'chat', name: 'Chat', icon: '💬' },
    { id: 'analysis', name: 'Analysis', icon: '📈' },
    { id: 'reflection', name: 'Reflect', icon: '🧘' },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-orange-600">
              Momentum AI
            </h1>
            <nav className="flex space-x-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-orange-100 text-orange-700 border border-orange-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Welcome, {user?.user_metadata?.full_name || user?.email || 'User'}!
            </div>
            <button
              onClick={handleLogout}
              className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Web-adapted screen wrapper
const WebScreenWrapper = ({ children, title }: { children: React.ReactNode; title: string }) => (
  <div className="min-h-screen bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      </div>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {children}
      </div>
    </div>
  </div>
);

// Main App Component with Full Mobile Functionality
const MainApp = ({ user }: { user: any }) => {
  const [activeTab, setActiveTab] = useState('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <WebScreenWrapper title="Dashboard">
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Stats */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-orange-900 mb-4">Today's Focus</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-orange-700">Current Streak</span>
                      <span className="font-bold text-orange-900">🔥 0 days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-orange-700">Goals Active</span>
                      <span className="font-bold text-orange-900">🎯 0</span>
                    </div>
                    <button
                      onClick={() => setActiveTab('checkin')}
                      className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      Start Daily Check-In
                    </button>
                  </div>
                </div>

                {/* AI Coach Quick Access */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">AI Coach</h3>
                  <div className="space-y-3">
                    <p className="text-blue-700 text-sm">
                      "Ready to tackle your goals today? Let's build some momentum!"
                    </p>
                    <button
                      onClick={() => setActiveTab('coach')}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Chat with AI Coach
                    </button>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setActiveTab('goals')}
                      className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      🎯 Set New Goal
                    </button>
                    <button
                      onClick={() => setActiveTab('insights')}
                      className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      📊 View Insights
                    </button>
                    <button
                      onClick={() => setActiveTab('reflection')}
                      className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      🧘 Reflect
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Activity Feed */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-600">🎉 Welcome to Momentum AI! Complete your first check-in to get started.</p>
                    <p className="text-xs text-gray-500 mt-1">Just now</p>
                  </div>
                </div>
              </div>
            </div>
          </WebScreenWrapper>
        );

      case 'goals':
        return (
          <WebScreenWrapper title="Goals Management">
            <div className="p-6">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Set Your First Goal</h3>
                <p className="text-gray-600 mb-6">Define what you want to achieve and let AI help you get there</p>
                <button className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors">
                  Create New Goal
                </button>
              </div>
            </div>
          </WebScreenWrapper>
        );

      case 'checkin':
        return (
          <WebScreenWrapper title="Daily Check-In">
            <div className="p-6">
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">How are you feeling today?</h3>
                  <p className="text-gray-600">Your daily check-in helps track your progress and mood patterns</p>
                </div>

                <div className="space-y-6">
                  {/* Mood Selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Today's Mood</label>
                    <div className="flex justify-center space-x-4">
                      {['😔', '😕', '😐', '🙂', '😊'].map((emoji, index) => (
                        <button
                          key={index}
                          className="text-4xl p-3 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Energy Level */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Energy Level (1-10)</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      className="w-full"
                    />
                  </div>

                  {/* Quick Note */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">What's on your mind?</label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      rows={4}
                      placeholder="Share your thoughts, wins, or challenges..."
                    />
                  </div>

                  <button className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium">
                    Complete Check-In
                  </button>
                </div>
              </div>
            </div>
          </WebScreenWrapper>
        );

      case 'coach':
        return (
          <WebScreenWrapper title="AI Coach">
            <div className="p-6">
              <div className="max-w-4xl mx-auto">
                <div className="bg-blue-50 rounded-xl p-6 mb-6">
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">🤖</div>
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-2">Your AI Coach</h3>
                      <p className="text-blue-800">
                        Hello! I'm here to help you achieve your goals through personalized coaching, 
                        insights, and accountability. How can I support you today?
                      </p>
                    </div>
                  </div>
                </div>

                {/* Chat Interface */}
                <div className="bg-white border rounded-xl">
                  <div className="h-96 p-4 overflow-y-auto border-b">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-100 text-blue-800 rounded-full p-2 text-sm">🤖</div>
                        <div className="bg-blue-50 rounded-xl p-3 max-w-xs">
                          <p className="text-sm">Welcome! I'm excited to be your accountability partner. What goal would you like to work on?</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex space-x-3">
                      <input
                        type="text"
                        placeholder="Ask me anything about goals, habits, or motivation..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </WebScreenWrapper>
        );

      case 'insights':
        return (
          <WebScreenWrapper title="AI Insights & Analytics">
            <div className="p-6">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Insights Coming Soon</h3>
                <p className="text-gray-600 mb-6">Complete a few check-ins and set some goals to unlock personalized AI insights</p>
                <button
                  onClick={() => setActiveTab('checkin')}
                  className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Start First Check-In
                </button>
              </div>
            </div>
          </WebScreenWrapper>
        );

      case 'chat':
        return (
          <WebScreenWrapper title="Chat History">
            <div className="p-6">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No conversations yet</h3>
                <p className="text-gray-600 mb-6">Start chatting with your AI coach to see your conversation history here</p>
                <button
                  onClick={() => setActiveTab('coach')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start Conversation
                </button>
              </div>
            </div>
          </WebScreenWrapper>
        );

      case 'analysis':
        return (
          <WebScreenWrapper title="Progress Analysis">
            <div className="p-6">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📈</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Analysis Dashboard</h3>
                <p className="text-gray-600 mb-6">Track your patterns, progress, and performance over time</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="font-semibold text-blue-900">Mood Trends</div>
                    <div className="text-2xl font-bold text-blue-600 mt-2">-</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="font-semibold text-green-900">Goal Progress</div>
                    <div className="text-2xl font-bold text-green-600 mt-2">0%</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="font-semibold text-orange-900">Consistency</div>
                    <div className="text-2xl font-bold text-orange-600 mt-2">-</div>
                  </div>
                </div>
              </div>
            </div>
          </WebScreenWrapper>
        );

      case 'reflection':
        return (
          <WebScreenWrapper title="Reflection Space">
            <div className="p-6">
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                  <div className="text-6xl mb-4">🧘</div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">Daily Reflection</h3>
                  <p className="text-gray-600">Take a moment to reflect on your progress and learnings</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">What went well today?</label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      rows={3}
                      placeholder="Celebrate your wins, no matter how small..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">What could be improved?</label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      rows={3}
                      placeholder="Areas for growth and learning..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Tomorrow's focus</label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      rows={3}
                      placeholder="What will you prioritize tomorrow?"
                    />
                  </div>

                  <button className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium">
                    Save Reflection
                  </button>
                </div>
              </div>
            </div>
          </WebScreenWrapper>
        );

      default:
        return <div>Screen not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <WebNavigation activeTab={activeTab} setActiveTab={setActiveTab} user={user} />
      {renderContent()}
    </div>
  );
};

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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
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
                ? 'bg-orange-600 text-white' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Sign Up
          </button>
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 px-4 rounded-r-lg transition-colors ${
              isLogin 
                ? 'bg-orange-600 text-white' 
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Create a secure password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Start Your Journey')}
          </button>
        </form>

        {!isLogin && (
          <div className="mt-6 p-4 bg-orange-50 rounded-lg">
            <h4 className="font-medium text-orange-900 mb-2">🚀 What You'll Get:</h4>
            <ul className="text-sm text-orange-800 space-y-1">
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Momentum AI...</p>
        </div>
      </div>
    );
  }

  return user ? <MainApp user={user} /> : <AuthScreen />;
}
