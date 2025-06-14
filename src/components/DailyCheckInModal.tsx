'use client'

import { useState } from 'react';
import { X, CheckCircle, Circle, Flame, Target, Heart, Zap } from 'lucide-react';

interface Habit {
  id: string;
  text: string;
  completed: boolean;
}

interface Goal {
  id: string;
  title: string;
  habits: Habit[];
  currentStreak: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  goals: Goal[];
  onComplete: (completedHabits: { [goalId: string]: string[] }) => void;
}

export function DailyCheckInModal({ isOpen, onClose, goals, onComplete }: Props) {
  const [mood, setMood] = useState<'amazing' | 'good' | 'okay' | 'struggling' | null>(null);
  const [completedHabits, setCompletedHabits] = useState<{ [habitId: string]: boolean }>({});
  const [motivation, setMotivation] = useState('');

  const moods = [
    { id: 'amazing', emoji: '🚀', label: 'Amazing!', color: 'bg-green-500' },
    { id: 'good', emoji: '😊', label: 'Good', color: 'bg-blue-500' },
    { id: 'okay', emoji: '😐', label: 'Okay', color: 'bg-yellow-500' },
    { id: 'struggling', emoji: '😔', label: 'Struggling', color: 'bg-red-500' }
  ];

  const handleHabitToggle = (habitId: string) => {
    setCompletedHabits(prev => ({
      ...prev,
      [habitId]: !prev[habitId]
    }));
  };

  const handleSubmit = () => {
    // Group completed habits by goal
    const habitsByGoal: { [goalId: string]: string[] } = {};
    
    goals.forEach(goal => {
      // Safe fallback for goals without habits
      const goalHabits = goal.habits || [];
      habitsByGoal[goal.id] = goalHabits
        .filter(habit => completedHabits[habit.id])
        .map(habit => habit.id);
    });

    onComplete(habitsByGoal);
    onClose();
  };

  // Safe calculation with fallback for missing habits
  const totalHabits = goals.reduce((total, goal) => total + (goal.habits?.length || 0), 0);
  const completedCount = Object.values(completedHabits).filter(Boolean).length;
  const completionRate = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Daily Check-In</h2>
              <p className="text-gray-600 mt-1">How did today go? Let's celebrate your wins! 🎉</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Mood Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Heart className="w-5 h-5 mr-2 text-red-500" />
              How are you feeling today?
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {moods.map((moodOption) => (
                <button
                  key={moodOption.id}
                  onClick={() => setMood(moodOption.id as any)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    mood === moodOption.id
                      ? `${moodOption.color} text-white border-transparent`
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="text-2xl mb-2">{moodOption.emoji}</div>
                  <div className="text-sm font-medium">{moodOption.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Habit Tracking */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-blue-500" />
              Today's Habits
            </h3>
            
            {goals.map((goal) => (
              <div key={goal.id} className="mb-6 last:mb-0">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-800">{goal.title}</h4>
                  <div className="flex items-center text-orange-600">
                    <Flame className="w-4 h-4 mr-1" />
                    <span className="text-sm font-bold">{goal.currentStreak || 0} day streak</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {/* Safe fallback for goals without habits */}
                  {(goal.habits || []).length > 0 ? (
                    (goal.habits || []).map((habit) => (
                      <div
                        key={habit.id}
                        onClick={() => handleHabitToggle(habit.id)}
                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                          completedHabits[habit.id]
                            ? 'bg-green-50 border-green-200 text-green-900'
                            : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {completedHabits[habit.id] ? (
                          <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-400 mr-3" />
                        )}
                        <span className={`${completedHabits[habit.id] ? 'line-through' : ''}`}>
                          {habit.text}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-gray-500 text-center italic">
                      No habits set for this goal yet. Add some habits to track daily progress!
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Progress Summary */}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-blue-800 font-medium">Today's Progress</span>
                <span className="text-blue-600 font-bold">{completedCount}/{totalHabits} completed ({completionRate}%)</span>
              </div>
              <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Motivation Note */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-yellow-500" />
              What's driving you today? (Optional)
            </h3>
            <textarea
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              placeholder="Share what's motivating you or any challenges you faced..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Skip Today
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors font-medium"
            >
              Complete Check-In 🎉
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 