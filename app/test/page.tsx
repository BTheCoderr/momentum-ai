'use client';

import React, { useState } from 'react';
import SmartCheckIn from '../../src/components/SmartCheckIn';
import InsightCards from '../../src/components/InsightCards';
import { Brain, Target, Calendar, TrendingUp, Settings } from 'lucide-react';

// Sample goals for testing
const sampleGoals = [
  {
    id: 'goal-1',
    title: 'Daily Exercise',
    description: 'Exercise for at least 30 minutes every day',
    status: 'active',
    progress: 65,
    category: 'health'
  },
  {
    id: 'goal-2', 
    title: 'Read More Books',
    description: 'Read for 20 minutes daily',
    status: 'active',
    progress: 80,
    category: 'learning'
  },
  {
    id: 'goal-3',
    title: 'Meditation Practice',
    description: 'Daily 10-minute meditation',
    status: 'active', 
    progress: 45,
    category: 'wellness'
  }
];

export default function TestPage() {
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [checkInCount, setCheckInCount] = useState(0);
  const [lastCheckIn, setLastCheckIn] = useState<any>(null);

  const handleCheckInComplete = (data: any) => {
    setCheckInCount(prev => prev + 1);
    setLastCheckIn(data);
    console.log('✅ Check-in completed:', data);
  };

  const testDatabaseConnection = async () => {
    try {
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'test-user-id',
          pattern: 'Mon: happy mood, 75% progress\nTue: energized mood, 80% progress',
          latestCheckIn: {
            mood: 'happy',
            energy: 8,
            wins: 'Completed all tasks',
            challenges: 'Time management'
          }
        })
      });

      const result = await response.json();
      console.log('🧠 Database test result:', result);
      
      if (result.success) {
        alert('✅ Database connection successful! Check console for details.');
      } else {
        alert('❌ Database test failed: ' + result.error);
      }
    } catch (error) {
      console.error('Database test error:', error);
      alert('❌ Database test failed. Check console for details.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Brain className="w-8 h-8 text-purple-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">
              Momentum AI Test Page
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Test the AI-powered check-in system and insights generation. 
            This page demonstrates the complete behavioral tracking and AI analysis workflow.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{checkInCount}</div>
                <div className="text-sm text-gray-600">Check-ins</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center">
              <Target className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{sampleGoals.length}</div>
                <div className="text-sm text-gray-600">Active Goals</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-purple-500 mr-3" />
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round(sampleGoals.reduce((acc, goal) => acc + goal.progress, 0) / sampleGoals.length)}%
                </div>
                <div className="text-sm text-gray-600">Avg Progress</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center">
              <Brain className="w-8 h-8 text-pink-500 mr-3" />
              <div>
                <div className="text-2xl font-bold text-gray-900">AI</div>
                <div className="text-sm text-gray-600">Insights Ready</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          <button
            onClick={() => setShowCheckIn(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
          >
            🚀 Start Daily Check-In
          </button>

          <button
            onClick={testDatabaseConnection}
            className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
          >
            🧪 Test Database
          </button>

          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors font-medium"
          >
            🔄 Reset Page
          </button>
        </div>

        {/* Last Check-in Display */}
        {lastCheckIn && (
          <div className="bg-white rounded-xl p-6 border border-gray-200 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              ✅ Last Check-in Completed
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Mood:</span> {lastCheckIn.mood}
              </div>
              <div>
                <span className="font-medium text-gray-700">Energy:</span> {lastCheckIn.energy}/10
              </div>
              <div>
                <span className="font-medium text-gray-700">Wins:</span> {lastCheckIn.wins || 'None shared'}
              </div>
              <div>
                <span className="font-medium text-gray-700">Challenges:</span> {lastCheckIn.challenges || 'None shared'}
              </div>
            </div>
          </div>
        )}

        {/* Goals Display */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="w-5 h-5 text-purple-600 mr-2" />
            Sample Goals
          </h3>
          <div className="space-y-4">
            {sampleGoals.map((goal) => (
              <div key={goal.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{goal.title}</h4>
                  <p className="text-sm text-gray-600">{goal.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-purple-600">{goal.progress}%</div>
                  <div className="text-xs text-gray-500">{goal.category}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights Section */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <InsightCards userId="test-user-id" limit={10} />
        </div>

        {/* Debug Info */}
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <details>
            <summary className="cursor-pointer font-medium text-gray-700 mb-2">
              🔧 Debug Information
            </summary>
            <div className="text-sm text-gray-600 space-y-2">
              <div><strong>User ID:</strong> test-user-id</div>
              <div><strong>Check-ins Completed:</strong> {checkInCount}</div>
              <div><strong>Sample Goals:</strong> {sampleGoals.length}</div>
              <div><strong>Database Tables:</strong> user_events, insights, goals</div>
              <div><strong>AI Provider:</strong> Groq (with fallback)</div>
            </div>
          </details>
        </div>
      </div>

      {/* Smart Check-In Modal */}
      <SmartCheckIn
        isOpen={showCheckIn}
        onClose={() => setShowCheckIn(false)}
        userGoals={sampleGoals}
        onCheckInComplete={handleCheckInComplete}
      />
    </div>
  );
} 