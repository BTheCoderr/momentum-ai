'use client';

import React from 'react';

const InsightsPage = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Insights</h1>
        <p className="text-gray-600 mt-2">Discover patterns and trends in your progress</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Overview */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Progress Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-green-700">Goals Completed</span>
              <span className="font-bold text-green-900">0</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-blue-700">Check-ins This Week</span>
              <span className="font-bold text-blue-900">0</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <span className="text-orange-700">Current Streak</span>
              <span className="font-bold text-orange-900">0 days</span>
            </div>
          </div>
        </div>

        {/* Mood Patterns */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">😊 Mood Patterns</h3>
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-gray-600">Complete a few check-ins to see your mood patterns</p>
          </div>
        </div>

        {/* Weekly Summary */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📅 Weekly Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Most Productive Day</span>
              <span className="font-medium">-</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Average Energy Level</span>
              <span className="font-medium">-</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Goals Progress</span>
              <span className="font-medium">-</span>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🤖 AI Insights</h3>
          <div className="space-y-3">
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="text-purple-700 font-medium">💡 Smart Recommendation</div>
              <div className="text-sm text-purple-600 mt-1">
                Complete your first check-in to get personalized insights!
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Detailed Analytics</h3>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">Analytics Coming Soon</h4>
          <p className="text-gray-600">
            Detailed charts and analytics will appear here as you use the app more
          </p>
        </div>
      </div>
    </div>
  );
};

export default InsightsPage; 