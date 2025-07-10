'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

const PreviewPage = () => {
  const router = useRouter();
  
  // Get current time for personalized greeting
  const currentHour = new Date().getHours();
  const getGreeting = () => {
    if (currentHour < 12) return 'Good morning!';
    if (currentHour < 17) return 'Good afternoon!';
    return 'Good evening!';
  };

  const getDayOfWeek = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-style Purple Header */}
      <div className="bg-gradient-to-br from-purple-600 via-purple-500 to-blue-600 px-6 pt-12 pb-8 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <h1 className="text-white text-2xl font-bold">Momentum AI</h1>
            <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full font-medium">
              BETA
            </span>
          </div>
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-purple-600 text-sm">👤</span>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <h2 className="text-white text-2xl font-bold mb-2">
            {getGreeting()} How's your {getDayOfWeek()} going?
          </h2>
          <p className="text-white/90 text-base">
            You're making great progress today! Keep the momentum going.
          </p>
        </div>
      </div>

      {/* Preview Banner */}
      <div className="px-6 -mt-2 relative z-10">
        <div className="bg-yellow-100 border border-yellow-300 rounded-xl p-4 mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-xl">👀</span>
            <div>
              <h3 className="font-semibold text-yellow-800">Design Preview</h3>
              <p className="text-sm text-yellow-700">This is your new mobile-inspired design! Sign in to access the full experience.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 -mt-4 pb-20">
        {/* Streak Card */}
        <div className="bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 rounded-2xl p-6 mb-6 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">🔥</span>
                <h3 className="text-white text-xl font-bold">7 day streak! Keep it going!</h3>
              </div>
              <p className="text-white/90 text-sm mb-4">
                Your peak performance time is Tuesday mornings. Consider checking in then for best results.
              </p>
              <button
                onClick={() => alert('Sign in to continue your streak!')}
                className="bg-white/20 backdrop-blur text-white font-semibold py-3 px-6 rounded-xl border border-white/20 hover:bg-white/30 transition-all duration-200"
              >
                Continue Streak 🎯
              </button>
            </div>
            <div className="ml-4">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                <span className="text-3xl">🔥</span>
              </div>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full"></div>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full"></div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Progress Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📈</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">85%</div>
              <div className="text-gray-700 font-semibold text-sm">Overall Progress</div>
              <div className="text-gray-500 text-xs mt-1">77% success</div>
            </div>
          </div>

          {/* Active Goals Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">2</div>
              <div className="text-gray-700 font-semibold text-sm">Active Goals</div>
              <div className="text-gray-500 text-xs mt-1">Currently tracking</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => alert('Sign in to set goals!')}
              className="bg-blue-50 hover:bg-blue-100 p-4 rounded-xl transition-colors duration-200"
            >
              <div className="text-2xl mb-2">🎯</div>
              <div className="text-sm font-semibold text-blue-900">Set Goal</div>
            </button>
            <button
              onClick={() => alert('Sign in to chat with AI Coach!')}
              className="bg-purple-50 hover:bg-purple-100 p-4 rounded-xl transition-colors duration-200"
            >
              <div className="text-2xl mb-2">🤖</div>
              <div className="text-sm font-semibold text-purple-900">AI Coach</div>
            </button>
            <button
              onClick={() => alert('Sign in to view insights!')}
              className="bg-green-50 hover:bg-green-100 p-4 rounded-xl transition-colors duration-200"
            >
              <div className="text-2xl mb-2">📊</div>
              <div className="text-sm font-semibold text-green-900">Insights</div>
            </button>
            <button
              onClick={() => alert('Sign in to reflect!')}
              className="bg-orange-50 hover:bg-orange-100 p-4 rounded-xl transition-colors duration-200"
            >
              <div className="text-2xl mb-2">🧘</div>
              <div className="text-sm font-semibold text-orange-900">Reflect</div>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-xl">
              <span className="text-xl">🎉</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Completed morning check-in
                </p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl">
              <span className="text-xl">🎯</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Updated goal progress
                </p>
                <p className="text-xs text-gray-500">5 hours ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sign In CTA */}
        <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Ready to get started?</h3>
          <p className="text-gray-600 mb-4">Sign in to access your personalized dashboard and start building momentum!</p>
          <button
            onClick={() => router.push('/auth')}
            className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
          >
            Sign In to Continue
          </button>
        </div>
      </div>

      {/* Bottom Navigation - Mobile Style */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 shadow-lg">
        <div className="flex items-center justify-around">
          <button className="flex flex-col items-center space-y-1">
            <span className="text-xl">🏠</span>
            <span className="text-xs font-medium text-blue-600">Home</span>
          </button>
          <button className="flex flex-col items-center space-y-1">
            <span className="text-xl">🏆</span>
            <span className="text-xs font-medium text-gray-500">Goals</span>
          </button>
          <button className="flex flex-col items-center space-y-1">
            <span className="text-xl">💬</span>
            <span className="text-xs font-medium text-gray-500">AI Coach</span>
          </button>
          <button className="flex flex-col items-center space-y-1">
            <span className="text-xl">📈</span>
            <span className="text-xs font-medium text-gray-500">Progress</span>
          </button>
          <button className="flex flex-col items-center space-y-1">
            <span className="text-xl">👤</span>
            <span className="text-xs font-medium text-gray-500">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewPage; 