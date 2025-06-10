import { Calendar, Heart, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';

interface Goal {
  id: string;
  title: string;
  description: string;
  progress: number;
  emotionalContext: string;
  deadline: string;
  status: 'on-track' | 'at-risk' | 'completed';
}

interface GoalCardProps {
  goal: Goal;
}

export default function GoalCard({ goal }: GoalCardProps) {
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

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-bold text-gray-900">{goal.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${goal.progress}%` }}
          ></div>
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

      {/* Deadline */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4" />
          <span>Due: {format(new Date(goal.deadline), 'MMM d, yyyy')}</span>
        </div>
        <button className="text-blue-600 hover:text-blue-700 font-medium">
          View Details
        </button>
      </div>
    </div>
  );
} 