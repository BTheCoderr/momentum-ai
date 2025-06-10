import { Calendar, Heart, TrendingUp, AlertTriangle, CheckCircle, Flame, Target, Circle } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';

interface Habit {
  id: string;
  text: string;
  completed: boolean;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  progress: number;
  emotionalContext: string;
  deadline: string;
  status: 'on-track' | 'at-risk' | 'completed';
  currentStreak: number;
  bestStreak: number;
  completionRate: number;
  lastCheckIn: string;
  habits: Habit[];
}

interface GoalCardProps {
  goal: Goal;
  onCheckIn?: () => void;
}

export default function GoalCard({ goal, onCheckIn }: GoalCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'text-green-600 bg-green-100';
      case 'at-risk': return 'text-amber-600 bg-amber-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on-track': return <CheckCircle className="w-4 h-4" />;
      case 'at-risk': return <AlertTriangle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <TrendingUp className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{goal.title}</h3>
          <p className="text-gray-600 text-sm">{goal.description}</p>
        </div>
        <div className={clsx(
          'flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium',
          getStatusColor(goal.status)
        )}>
          {getStatusIcon(goal.status)}
          <span className="capitalize">{goal.status.replace('-', ' ')}</span>
        </div>
      </div>

      {/* Streak Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-100">
          <div className="flex items-center justify-center mb-1">
            <Flame className="w-4 h-4 text-orange-600 mr-1" />
            <span className="text-xs font-medium text-orange-800">Current</span>
          </div>
          <div className="text-lg font-bold text-orange-700">{goal.currentStreak}</div>
          <div className="text-xs text-orange-600">days</div>
        </div>
        
        <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-100">
          <div className="flex items-center justify-center mb-1">
            <TrendingUp className="w-4 h-4 text-yellow-600 mr-1" />
            <span className="text-xs font-medium text-yellow-800">Best</span>
          </div>
          <div className="text-lg font-bold text-yellow-700">{goal.bestStreak}</div>
          <div className="text-xs text-yellow-600">days</div>
        </div>
        
        <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100">
          <div className="flex items-center justify-center mb-1">
            <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
            <span className="text-xs font-medium text-green-800">Rate</span>
          </div>
          <div className="text-lg font-bold text-green-700">{goal.completionRate}%</div>
          <div className="text-xs text-green-600">done</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm font-bold text-gray-900">{goal.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${goal.progress}%` }}
          ></div>
        </div>
      </div>

      {/* Today's Habits */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Target className="w-4 h-4 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">Today's Habits</span>
          </div>
          <span className="text-xs text-gray-500">
            {goal.habits.filter(h => h.completed).length}/{goal.habits.length}
          </span>
        </div>
        <div className="space-y-2">
          {goal.habits.slice(0, 3).map((habit) => (
            <div key={habit.id} className="flex items-center text-sm">
              {habit.completed ? (
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
              )}
              <span className={`${habit.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                {habit.text}
              </span>
            </div>
          ))}
          {goal.habits.length > 3 && (
            <div className="text-xs text-gray-500 ml-6">
              +{goal.habits.length - 3} more habits
            </div>
          )}
        </div>
      </div>

      {/* Emotional Context */}
      <div className="mb-4 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-100">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <Heart className="w-4 h-4 text-pink-600" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1">Why This Matters</h4>
            <p className="text-sm text-gray-700 italic">"{goal.emotionalContext}"</p>
          </div>
        </div>
      </div>

      {/* Deadline & Actions */}
      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4" />
          <span>Due: {format(new Date(goal.deadline), 'MMM d, yyyy')}</span>
        </div>
        
        {/* Last Check-in Status */}
        <div className="text-xs">
          {(() => {
            const lastCheckIn = new Date(goal.lastCheckIn);
            const now = new Date();
            const hoursDiff = Math.floor((now.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60));
            
            if (hoursDiff < 24) {
              return <span className="text-green-600 font-medium">✅ Checked in today</span>;
            } else if (hoursDiff < 48) {
              return <span className="text-yellow-600 font-medium">⚠️ Yesterday</span>;
            } else {
              return <span className="text-red-600 font-medium">❌ {Math.floor(hoursDiff / 24)} days ago</span>;
            }
          })()}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <button 
          onClick={onCheckIn}
          className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors text-sm font-medium"
        >
          Daily Check-In
        </button>
        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
          Share Progress
        </button>
      </div>
    </div>
  );
} 