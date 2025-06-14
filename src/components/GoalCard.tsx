import { Calendar, Heart, TrendingUp, AlertTriangle, CheckCircle, Flame, Target, Circle } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';
import { Goal } from '@/types';

interface Habit {
  id: string;
  text: string;
  completed: boolean;
}

interface GoalCardProps {
  goal: Goal;
  onCheckIn: () => void;
  onShareProgress: () => void;
}

export default function GoalCard({ goal, onCheckIn, onShareProgress }: GoalCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">{goal.title}</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          goal.status === 'on-track' 
            ? 'bg-green-50 text-green-700'
            : goal.status === 'at-risk'
            ? 'bg-amber-50 text-amber-700'
            : 'bg-blue-50 text-blue-700'
        }`}>
          {goal.status === 'on-track' ? 'On Track' : goal.status === 'at-risk' ? 'At Risk' : 'Completed'}
        </div>
      </div>

      <p className="text-gray-600 mb-6">{goal.description}</p>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="text-sm text-orange-600 mb-1">Current</div>
          <div className="text-2xl font-bold text-orange-700">{goal.currentStreak}</div>
          <div className="text-xs text-orange-600">days</div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="text-sm text-yellow-600 mb-1">Best</div>
          <div className="text-2xl font-bold text-yellow-700">{goal.bestStreak}</div>
          <div className="text-xs text-yellow-600">days</div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-sm text-green-600 mb-1">Rate</div>
          <div className="text-2xl font-bold text-green-700">{goal.completionRate}%</div>
          <div className="text-xs text-green-600">done</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-gray-600">Overall Progress</div>
          <div className="text-sm font-medium text-gray-900">{goal.progress}%</div>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
            style={{ width: `${goal.progress}%` }}
          ></div>
        </div>
      </div>

      {/* Today's Habits */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-600 mb-3 flex items-center">
          <Target className="w-4 h-4 mr-2" />
          Today's Habits
          <span className="ml-auto text-sm text-gray-500">
            {goal.habits.filter(h => h.completed).length}/{goal.habits.length}
          </span>
        </h4>
        <div className="space-y-2">
          {goal.habits.map((habit) => (
            <div key={habit.id} className="flex items-center">
              <input
                type="checkbox"
                checked={habit.completed}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                readOnly
              />
              <span className={`ml-3 text-sm ${habit.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                {habit.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Why This Matters */}
      <div className="bg-pink-50 rounded-lg p-4 mb-6">
        <h4 className="text-sm font-medium text-pink-700 mb-2 flex items-center">
          <Heart className="w-4 h-4 mr-2" />
          Why This Matters
        </h4>
        <p className="text-sm text-pink-600 italic">"{goal.emotionalContext}"</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="flex items-center">
          <TrendingUp className="w-4 h-4 mr-1" />
          Due: {new Date(goal.deadline).toLocaleDateString()}
        </div>
        {new Date(goal.lastCheckIn).toDateString() === new Date().toDateString() ? (
          <div className="text-green-600">✓ Checked in today</div>
        ) : (
          <div className="text-amber-600">⚠ Yesterday</div>
        )}
      </div>

      {/* Actions */}
      <div className="flex space-x-3">
        <button
          onClick={onCheckIn}
          className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors text-sm font-medium"
        >
          Daily Check-In
        </button>
        <button 
          onClick={onShareProgress}
          className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
        >
          Share Progress
        </button>
      </div>
    </div>
  );
} 