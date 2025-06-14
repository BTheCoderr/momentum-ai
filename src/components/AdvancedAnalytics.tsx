import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Target, Calendar, Brain, Zap, Clock, AlertTriangle, CheckCircle, ArrowUp, Eye, Download } from 'lucide-react';

interface AdvancedAnalyticsProps {
  currentPlan: 'free' | 'pro' | 'enterprise';
}

interface AnalyticsData {
  overview: {
    totalGoals: number;
    completedGoals: number;
    activeStreaks: number;
    averageCompletion: number;
  };
  trends: {
    weeklyProgress: number[];
    categoryBreakdown: { category: string; count: number; completion: number }[];
  };
  insights: {
    bestPerformingDay: string;
    optimalTimeSlot: string;
    riskFactors: string[];
    recommendations: string[];
  };
  predictions: {
    successProbability: number;
    expectedCompletion: string;
    riskLevel: 'low' | 'medium' | 'high';
    suggestedActions: string[];
  };
}

export default function AdvancedAnalytics({ currentPlan }: AdvancedAnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setAnalyticsData({
        overview: {
          totalGoals: 24,
          completedGoals: 18,
          activeStreaks: 3,
          averageCompletion: 75
        },
        trends: {
          weeklyProgress: [65, 72, 68, 85, 78, 82, 75],
          categoryBreakdown: [
            { category: 'Health & Fitness', count: 8, completion: 85 },
            { category: 'Productivity', count: 6, completion: 72 },
            { category: 'Learning', count: 5, completion: 68 },
            { category: 'Finance', count: 3, completion: 90 },
            { category: 'Relationships', count: 2, completion: 75 }
          ]
        },
        insights: {
          bestPerformingDay: 'Tuesday',
          optimalTimeSlot: '9:00 AM - 11:00 AM',
          riskFactors: ['Weekend consistency drops', 'Evening motivation decline'],
          recommendations: [
            'Schedule important goals for Tuesday mornings',
            'Set weekend accountability reminders',
            'Create evening routine to maintain momentum'
          ]
        },
        predictions: {
          successProbability: 87,
          expectedCompletion: 'January 28, 2024',
          riskLevel: 'low',
          suggestedActions: [
            'Maintain current momentum',
            'Focus on weekend consistency',
            'Consider adding one more health goal'
          ]
        }
      });
      setLoading(false);
    }, 1500);
  }, [selectedPeriod]);

  const isProFeature = (feature: string) => {
    return currentPlan === 'free';
  };

  const renderChart = (data: number[], label: string) => {
    const max = Math.max(...data);
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-xs text-gray-500">{selectedPeriod}</span>
        </div>
        <div className="flex items-end space-x-1 h-20">
          {data.map((value, index) => (
            <div
              key={index}
              className="flex-1 bg-blue-100 rounded-t relative group cursor-pointer hover:bg-blue-200 transition-colors"
              style={{ height: `${(value / max) * 100}%` }}
            >
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                {value}%
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <p className="text-gray-600">Unable to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Advanced Analytics</h2>
          <p className="text-gray-600">Deep insights into your goal achievement patterns</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          
          <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Goals</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.totalGoals}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-green-600">
            <ArrowUp className="w-4 h-4" />
            <span className="text-sm">+12% from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.completedGoals}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-green-600">
            <ArrowUp className="w-4 h-4" />
            <span className="text-sm">+8% completion rate</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Streaks</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.activeStreaks}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-orange-600">
            <span className="text-sm">Longest: 21 days</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Completion</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.averageCompletion}%</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-green-600">
            <ArrowUp className="w-4 h-4" />
            <span className="text-sm">+5% this month</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Progress Trends */}
        <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-200 ${isProFeature('charts') ? 'opacity-50' : ''}`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Progress Trends</h3>
            {isProFeature('charts') && (
              <div className="flex items-center space-x-2 text-yellow-600">
                <Eye className="w-4 h-4" />
                <span className="text-sm">Pro Feature</span>
              </div>
            )}
          </div>
          
          {isProFeature('charts') ? (
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Unlock detailed progress charts</p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Upgrade to Pro
              </button>
            </div>
          ) : (
            renderChart(analyticsData.trends.weeklyProgress, 'Weekly Progress')
          )}
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Goal Categories</h3>
          <div className="space-y-4">
            {analyticsData.trends.categoryBreakdown.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{category.category}</span>
                    <span className="text-sm text-gray-500">{category.count} goals</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${category.completion}%` }}
                    ></div>
                  </div>
                </div>
                <span className="ml-4 text-sm font-semibold text-gray-900">{category.completion}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className={`bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200 ${isProFeature('ai-insights') ? 'opacity-50' : ''}`}>
        <div className="flex items-center space-x-3 mb-6">
          <Brain className="w-8 h-8 text-purple-600" />
          <div>
            <h3 className="text-xl font-bold text-gray-900">AI-Powered Insights</h3>
            <p className="text-gray-600">Personalized recommendations based on your patterns</p>
          </div>
          {isProFeature('ai-insights') && (
            <div className="ml-auto flex items-center space-x-2 text-yellow-600">
              <Eye className="w-4 h-4" />
              <span className="text-sm">Pro Feature</span>
            </div>
          )}
        </div>

        {isProFeature('ai-insights') ? (
          <div className="text-center py-8">
            <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Unlock AI-powered insights and recommendations</p>
            <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700">
              Upgrade to Pro
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Performance Insights</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-700">
                    Best day: <strong>{analyticsData.insights.bestPerformingDay}</strong>
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-700">
                    Optimal time: <strong>{analyticsData.insights.optimalTimeSlot}</strong>
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Risk Factors</h4>
              <div className="space-y-2">
                {analyticsData.insights.riskFactors.map((risk, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-gray-700">{risk}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Predictive Analytics */}
      <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-200 ${isProFeature('predictions') ? 'opacity-50' : ''}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <div>
              <h3 className="text-xl font-bold text-gray-900">Predictive Analytics</h3>
              <p className="text-gray-600">AI predictions for your goal success</p>
            </div>
          </div>
          {isProFeature('predictions') && (
            <div className="flex items-center space-x-2 text-yellow-600">
              <Eye className="w-4 h-4" />
              <span className="text-sm">Pro Feature</span>
            </div>
          )}
        </div>

        {isProFeature('predictions') ? (
          <div className="text-center py-8">
            <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Get AI predictions for goal success and risk assessment</p>
            <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
              Upgrade to Pro
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 relative">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-200"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 36}`}
                    strokeDashoffset={`${2 * Math.PI * 36 * (1 - analyticsData.predictions.successProbability / 100)}`}
                    className="text-green-600"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-900">
                    {analyticsData.predictions.successProbability}%
                  </span>
                </div>
              </div>
              <h4 className="font-semibold text-gray-900">Success Probability</h4>
              <p className="text-sm text-gray-600">For current goals</p>
            </div>

            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                analyticsData.predictions.riskLevel === 'low' ? 'bg-green-100' :
                analyticsData.predictions.riskLevel === 'medium' ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <AlertTriangle className={`w-8 h-8 ${
                  analyticsData.predictions.riskLevel === 'low' ? 'text-green-600' :
                  analyticsData.predictions.riskLevel === 'medium' ? 'text-yellow-600' : 'text-red-600'
                }`} />
              </div>
              <h4 className="font-semibold text-gray-900">Risk Level</h4>
              <p className={`text-sm capitalize ${
                analyticsData.predictions.riskLevel === 'low' ? 'text-green-600' :
                analyticsData.predictions.riskLevel === 'medium' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {analyticsData.predictions.riskLevel}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Expected Completion</h4>
              <p className="text-sm text-gray-600">{analyticsData.predictions.expectedCompletion}</p>
            </div>
          </div>
        )}
      </div>

      {/* Recommendations */}
      {!isProFeature('recommendations') && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6">AI Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Suggested Actions</h4>
              <div className="space-y-3">
                {analyticsData.predictions.suggestedActions.map((action, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <span className="text-sm text-gray-700">{action}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Optimization Tips</h4>
              <div className="space-y-3">
                {analyticsData.insights.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <Zap className="w-5 h-5 text-blue-600 mt-0.5" />
                    <span className="text-sm text-gray-700">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 