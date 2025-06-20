import React, { useState } from 'react';
import { Calendar, Clock, Heart, Target, TrendingUp, Brain, CheckCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nsgqhhbqpyvonirlfluv.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zZ3FoaGJxcHl2b25pcmxmbHV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NTY1NTgsImV4cCI6MjA2NTMzMjU1OH0.twGF9Y6clrRtJg_4S1OWHA1vhhYpKzn3ZpFJPGJbmEo'
);

interface SmartCheckInProps {
  isOpen: boolean;
  onClose: () => void;
  userGoals: any[];
  onCheckInComplete: (data: any) => void;
}

export default function SmartCheckIn({ isOpen, onClose, userGoals, onCheckInComplete }: SmartCheckInProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [checkInData, setCheckInData] = useState({
    mood: '',
    energy: 5,
    progress: {} as Record<string, number>,
    challenges: '',
    wins: '',
    tomorrow: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const moodOptions = [
    { emoji: '🚀', label: 'Energized', value: 'energized' },
    { emoji: '😊', label: 'Happy', value: 'happy' },
    { emoji: '😌', label: 'Calm', value: 'calm' },
    { emoji: '😐', label: 'Neutral', value: 'neutral' },
    { emoji: '😓', label: 'Tired', value: 'tired' },
    { emoji: '😤', label: 'Frustrated', value: 'frustrated' },
    { emoji: '😔', label: 'Down', value: 'down' }
  ];

  const steps = [
    { title: 'How are you feeling?', icon: Heart },
    { title: 'Energy Level', icon: TrendingUp },
    { title: 'Goal Progress', icon: Target },
    { title: 'Reflection', icon: Brain }
  ];

  const handleMoodSelect = (mood: string) => {
    setCheckInData({ ...checkInData, mood });
  };

  const handleProgressUpdate = (goalId: string, progress: number) => {
    setCheckInData({
      ...checkInData,
      progress: { ...checkInData.progress, [goalId]: progress }
    });
  };

  const handleSubmitCheckIn = async () => {
    setIsSubmitting(true);
    
    try {
      const userId = 'test-user-id'; // Replace with actual user ID from auth
      
      // Calculate average progress
      const progressValues = Object.values(checkInData.progress);
      const avgProgress = progressValues.length > 0 
        ? Math.round(progressValues.reduce((a, b) => a + b, 0) / progressValues.length) 
        : 0;
      
      // Log the check-in event to Supabase
      const { error: eventError } = await supabase.from('user_events').insert([{
        user_id: userId,
        event_type: 'daily_check_in',
        mood: checkInData.mood,
        progress: avgProgress,
        meta: {
          energy_level: checkInData.energy,
          challenges: checkInData.challenges,
          wins: checkInData.wins,
          tomorrow_plan: checkInData.tomorrow,
          time_of_day: new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening',
          device: 'web',
          goal_progress: checkInData.progress
        }
      }]);

      if (eventError) {
        console.error('Error logging check-in:', eventError);
      } else {
        console.log('✅ Check-in logged successfully!');
        
        // Generate AI insight after check-in
        await generateAIInsight(userId);
        
        onCheckInComplete(checkInData);
        onClose();
        
        // Reset form
        setCheckInData({
          mood: '',
          energy: 5,
          progress: {},
          challenges: '',
          wins: '',
          tomorrow: ''
        });
        setCurrentStep(0);
      }
    } catch (error) {
      console.error('Error submitting check-in:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateAIInsight = async (userId: string) => {
    try {
      // Fetch recent check-ins
      const { data: events, error } = await supabase
        .from('user_events')
        .select('*')
        .eq('user_id', userId)
        .eq('event_type', 'daily_check_in')
        .order('timestamp', { ascending: false })
        .limit(7);

      if (error || !events?.length) {
        console.log('No recent check-ins found for insight generation');
        return;
      }

      const recentPattern = events.map(event => 
        `${new Date(event.timestamp).toLocaleDateString('en-US', { weekday: 'short' })}: ${event.mood} mood, ${event.progress}% progress, energy ${event.meta?.energy_level || 'unknown'}`
      ).join('\n');

      // Call AI insight generation API
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          pattern: recentPattern,
          latestCheckIn: checkInData
        })
      });

      if (response.ok) {
        console.log('🧠 AI insight generated successfully!');
      }
    } catch (error) {
      console.error('Error generating AI insight:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Daily Check-In</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {index < currentStep ? <CheckCircle className="w-5 h-5" /> : index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-1 mx-2 ${
                    index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 0: Mood */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="text-center">
                <Heart className="w-12 h-12 text-pink-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">How are you feeling today?</h3>
                <p className="text-gray-600">Your emotional state helps us understand your journey</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {moodOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleMoodSelect(option.value)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      checkInData.mood === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{option.emoji}</div>
                    <div className="text-sm font-medium">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Energy */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">What's your energy level?</h3>
                <p className="text-gray-600">Rate from 1 (exhausted) to 10 (energized)</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-center">
                  <span className="text-3xl font-bold text-blue-600">{checkInData.energy}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={checkInData.energy}
                  onChange={(e) => setCheckInData({ ...checkInData, energy: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Exhausted</span>
                  <span>Energized</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Goal Progress */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <Target className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">How did you progress on your goals?</h3>
                <p className="text-gray-600">Rate your progress for each active goal</p>
              </div>
              
              <div className="space-y-4">
                {userGoals.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <p>No active goals found.</p>
                    <p className="text-sm">Create some goals to track your progress!</p>
                  </div>
                ) : (
                  userGoals.map((goal) => (
                    <div key={goal.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{goal.title}</h4>
                        <span className="text-sm text-gray-500">
                          {checkInData.progress[goal.id] || 0}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={checkInData.progress[goal.id] || 0}
                        onChange={(e) => handleProgressUpdate(goal.id, parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Step 3: Reflection */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <Brain className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Let's reflect on today</h3>
                <p className="text-gray-600">This helps our AI understand your patterns</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🏆 What went well today?
                  </label>
                  <textarea
                    value={checkInData.wins}
                    onChange={(e) => setCheckInData({ ...checkInData, wins: e.target.value })}
                    placeholder="Celebrate your wins, big or small..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🤔 What challenges did you face?
                  </label>
                  <textarea
                    value={checkInData.challenges}
                    onChange={(e) => setCheckInData({ ...checkInData, challenges: e.target.value })}
                    placeholder="What made things difficult today?"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🎯 One thing to focus on tomorrow?
                  </label>
                  <textarea
                    value={checkInData.tomorrow}
                    onChange={(e) => setCheckInData({ ...checkInData, tomorrow: e.target.value })}
                    placeholder="What's your main priority for tomorrow?"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          
          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={
                (currentStep === 0 && !checkInData.mood)
              }
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmitCheckIn}
              disabled={isSubmitting}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Complete Check-In ✨'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 