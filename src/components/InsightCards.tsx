import React from 'react';
import { TrendingUp, Clock, Calendar, Zap, Brain, Target } from 'lucide-react';

interface InsightCardsProps {
  userPatterns: {
    bestPerformanceTime: string;
    streakPattern: string;
    motivationTriggers: string[];
    riskFactors: string[];
    successRate: number;
    weeklyTrend: 'up' | 'down' | 'stable';
  };
}

export default function InsightCards({ userPatterns }: InsightCardsProps) {
  // Handler functions for insight actions
  const handleInsightAction = (actionType: string, insightId: string) => {
    console.log(`Insight action: ${actionType} for ${insightId}`);
    
    switch (insightId) {
      case 'performance-time':
        alert('⏰ Opening calendar to schedule your most important habits during peak performance time...');
        break;
      case 'streak-pattern':
        alert('🔄 Creating personalized streak recovery plan based on your patterns...');
        break;
      case 'motivation-triggers':
        alert('⚡ Setting up automatic motivation triggers for challenging days...');
        break;
      case 'risk-prediction':
        alert('🛡️ Creating contingency plans for your identified risk scenarios...');
        break;
      case 'preemptive-reminder':
        alert('🔮 Setting up preemptive reminder for tomorrow at 2 PM...');
        break;
      default:
        alert(`🎯 Executing: ${actionType}`);
    }
  };

  const insights = [
    {
      id: 'performance-time',
      icon: Clock,
      title: 'Peak Performance Window',
      description: `You're 73% more successful when checking in ${userPatterns.bestPerformanceTime}`,
      action: 'Schedule your most important habits during this time',
      color: 'blue',
      type: 'optimization'
    },
    {
      id: 'streak-pattern',
      icon: TrendingUp,
      title: 'Streak Recovery Pattern',
      description: userPatterns.streakPattern,
      action: 'Use this pattern to bounce back faster',
      color: 'green',
      type: 'resilience'
    },
    {
      id: 'motivation-triggers',
      icon: Zap,
      title: 'Your Motivation Triggers',
      description: `${userPatterns.motivationTriggers.join(', ')} boost your completion rate by 45%`,
      action: 'Set up automatic triggers for tough days',
      color: 'purple',
      type: 'motivation'
    },
    {
      id: 'risk-prediction',
      icon: Brain,
      title: 'Risk Prediction',
      description: `Watch out for ${userPatterns.riskFactors.join(' and ')} - they predict 67% of your setbacks`,
      action: 'Create contingency plans for these scenarios',
      color: 'orange',
      type: 'prevention'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200 text-blue-800',
      green: 'bg-green-50 border-green-200 text-green-800',
      purple: 'bg-purple-50 border-purple-200 text-purple-800',
      orange: 'bg-orange-50 border-orange-200 text-orange-800'
    };
    return colors[color as keyof typeof colors];
  };

  const getIconColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600'
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Your Personal Insights</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Brain className="w-4 h-4" />
          <span>AI-Powered Patterns</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight) => {
          const Icon = insight.icon;
          return (
            <div
              key={insight.id}
              className={`p-4 rounded-xl border-2 ${getColorClasses(insight.color)} hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getIconColorClasses(insight.color)}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{insight.title}</h4>
                  <p className="text-sm mb-3 opacity-90">{insight.description}</p>
                  <button 
                    onClick={() => handleInsightAction(insight.action, insight.id)}
                    className={`text-xs font-medium px-3 py-1 rounded-full bg-white/50 hover:bg-white/80 transition-colors`}
                  >
                    {insight.action}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Weekly Trend Summary */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-indigo-900">Weekly Momentum</h4>
            <p className="text-sm text-indigo-700">
              {userPatterns.weeklyTrend === 'up' && '📈 You\'re building strong momentum this week!'}
              {userPatterns.weeklyTrend === 'down' && '📉 Let\'s get back on track - you\'ve got this!'}
              {userPatterns.weeklyTrend === 'stable' && '📊 Steady progress - consistency is key!'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-indigo-600">{userPatterns.successRate}%</div>
            <div className="text-xs text-indigo-600">Success Rate</div>
          </div>
        </div>
      </div>

      {/* Predictive Nudge */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
            🔮
          </div>
          <div>
            <h4 className="font-semibold text-yellow-900">Tomorrow's Prediction</h4>
            <p className="text-sm text-yellow-800 mb-2">
              Based on your patterns, tomorrow at 2 PM you might feel a motivation dip. 
            </p>
            <button 
              onClick={() => handleInsightAction('Set Preemptive Reminder', 'preemptive-reminder')}
              className="text-xs font-medium px-3 py-1 rounded-full bg-yellow-200 text-yellow-800 hover:bg-yellow-300 transition-colors"
            >
              Set Preemptive Reminder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 