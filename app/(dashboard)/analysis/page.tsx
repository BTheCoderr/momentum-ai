'use client';

import React from 'react';

const AnalysisPage = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Analysis</h1>
        <p className="text-gray-600 mt-2">Deep dive into your behavioral patterns and performance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Metrics */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Performance Metrics</h3>
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-green-700 font-medium">Consistency Score</span>
                <span className="text-2xl font-bold text-green-900">-</span>
              </div>
              <div className="text-xs text-green-600 mt-1">Based on daily check-ins</div>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-blue-700 font-medium">Goal Achievement Rate</span>
                <span className="text-2xl font-bold text-blue-900">-</span>
              </div>
              <div className="text-xs text-blue-600 mt-1">Percentage of goals completed</div>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-purple-700 font-medium">Engagement Level</span>
                <span className="text-2xl font-bold text-purple-900">-</span>
              </div>
              <div className="text-xs text-purple-600 mt-1">App usage and interaction</div>
            </div>
          </div>
        </div>

        {/* Behavioral Patterns */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🧠 Behavioral Patterns</h3>
          <div className="space-y-4">
            <div className="p-3 border-l-4 border-orange-400 bg-orange-50">
              <div className="font-medium text-orange-900">Peak Performance Time</div>
              <div className="text-sm text-orange-700">Data needed to identify patterns</div>
            </div>
            
            <div className="p-3 border-l-4 border-blue-400 bg-blue-50">
              <div className="font-medium text-blue-900">Most Productive Days</div>
              <div className="text-sm text-blue-700">Complete more check-ins to see trends</div>
            </div>
            
            <div className="p-3 border-l-4 border-green-400 bg-green-50">
              <div className="font-medium text-green-900">Energy Patterns</div>
              <div className="text-sm text-green-700">Track daily energy to see patterns</div>
            </div>
          </div>
        </div>

        {/* Drift Prediction */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🔮 Drift Prediction</h3>
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🤖</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">AI Drift Detection</h4>
            <p className="text-gray-600 text-sm mb-4">
              Our AI will predict when you might lose momentum and intervene proactively
            </p>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <div className="text-yellow-800 font-medium">Status: Learning</div>
              <div className="text-xs text-yellow-600 mt-1">
                Gathering data to personalize predictions
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 AI Recommendations</h3>
          <div className="space-y-3">
            <div className="p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg">
              <div className="font-medium text-indigo-900">🎯 Goal Optimization</div>
              <div className="text-sm text-indigo-700 mt-1">
                Start with 1-2 small, achievable goals to build momentum
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg">
              <div className="font-medium text-emerald-900">📅 Routine Building</div>
              <div className="text-sm text-emerald-700 mt-1">
                Complete daily check-ins to establish a consistent routine
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Charts Section */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">📈 Detailed Analysis</h3>
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📊</div>
          <h4 className="text-xl font-medium text-gray-900 mb-2">Advanced Analytics Coming Soon</h4>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Once you have more data from check-ins and goal tracking, you'll see detailed charts showing:
          </p>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="font-medium text-gray-900">📊 Trend Analysis</div>
              <div className="text-sm text-gray-600">Mood and energy over time</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="font-medium text-gray-900">🔄 Habit Tracking</div>
              <div className="text-sm text-gray-600">Goal completion patterns</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="font-medium text-gray-900">🎯 Predictive Insights</div>
              <div className="text-sm text-gray-600">AI-powered recommendations</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPage; 