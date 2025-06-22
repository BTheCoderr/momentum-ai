'use client';

import React, { useState, useEffect } from 'react';

// Simple UI Components (replacing missing shadcn components)
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-xl shadow-sm border ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, variant = 'default', className = '' }: { children: React.ReactNode; variant?: string; className?: string }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
    variant === 'secondary' ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'
  } ${className}`}>
    {children}
  </span>
);

const Button = ({ children, variant = 'default', size = 'default', className = '', onClick, disabled, ...props }: any) => (
  <button
    className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors ${
      variant === 'outline' 
        ? 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50' 
        : 'bg-blue-600 text-white hover:bg-blue-700'
    } ${
      size === 'sm' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    onClick={onClick}
    disabled={disabled}
    {...props}
  >
    {children}
  </button>
);

const Progress = ({ value, className = '' }: { value: number; className?: string }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <div 
      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

interface InsightData {
  id: string;
  title: string;
  content: string;
  category: 'pattern' | 'encouragement' | 'suggestion' | 'reflection';
  confidence?: number;
  timestamp: string;
  actionable?: boolean;
  relatedGoals?: string[];
}

interface InsightCardsProps {
  className?: string;
}

const InsightCards: React.FC<InsightCardsProps> = ({ className = '' }) => {
  const [insights, setInsights] = useState<InsightData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'patterns' | 'encouragement' | 'suggestions' | 'reflections'>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Check if user has enough data for insights
  const hasEnoughData = () => {
    const checkins = JSON.parse(localStorage.getItem('momentum_checkins') || '[]');
    const goals = JSON.parse(localStorage.getItem('momentum_goals') || '[]');
    return checkins.length >= 3 || goals.length >= 2;
  };

  const generateInsights = async () => {
    if (!hasEnoughData()) {
      setInsights([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Get user data for context
      const checkins = JSON.parse(localStorage.getItem('momentum_checkins') || '[]');
      const goals = JSON.parse(localStorage.getItem('momentum_goals') || '[]');
      
      // Generate insights based on real data
      const generatedInsights: InsightData[] = [];

      // Pattern insights from check-ins
      if (checkins.length >= 3) {
        const recentMoods = checkins.slice(-7).map((c: any) => c.mood || 3);
        const avgMood = recentMoods.reduce((a: number, b: number) => a + b, 0) / recentMoods.length;
        
        if (avgMood >= 4) {
          generatedInsights.push({
            id: 'mood-pattern-positive',
            title: '📈 Positive Mood Trend',
            content: `Your mood has been consistently high this week (${avgMood.toFixed(1)}/5). Keep up whatever you're doing!`,
            category: 'pattern',
            confidence: 85,
            timestamp: new Date().toISOString(),
            actionable: true
          });
        } else if (avgMood <= 2.5) {
          generatedInsights.push({
            id: 'mood-pattern-low',
            title: '💙 Mood Support',
            content: `I notice your mood has been lower lately. Consider focusing on self-care activities that bring you joy.`,
            category: 'suggestion',
            confidence: 80,
            timestamp: new Date().toISOString(),
            actionable: true
          });
        }
      }

      // Goal-based insights
      if (goals.length > 0) {
        const activeGoals = goals.filter((g: any) => !g.completed);
        if (activeGoals.length > 3) {
          generatedInsights.push({
            id: 'goal-focus',
            title: '🎯 Goal Focus Tip',
            content: `You have ${activeGoals.length} active goals. Consider focusing on 2-3 key goals for better results.`,
            category: 'suggestion',
            confidence: 90,
            timestamp: new Date().toISOString(),
            actionable: true
          });
        }
      }

      // Encouragement based on streaks
      const userStats = JSON.parse(localStorage.getItem('momentum_user_stats') || '{}');
      if (userStats.currentStreak >= 3) {
        generatedInsights.push({
          id: 'streak-encouragement',
          title: '🔥 Amazing Consistency!',
          content: `You're on a ${userStats.currentStreak}-day streak! Your dedication is paying off.`,
          category: 'encouragement',
          confidence: 95,
          timestamp: new Date().toISOString(),
          actionable: false
        });
      }

      // Reflection prompts
      generatedInsights.push({
        id: 'reflection-prompt',
        title: '🤔 Reflection Moment',
        content: 'What small win from this week are you most proud of? Take a moment to celebrate it.',
        category: 'reflection',
        confidence: 100,
        timestamp: new Date().toISOString(),
        actionable: true
      });

      setInsights(generatedInsights);
    } catch (error) {
      console.error('Error generating insights:', error);
      setInsights([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateInsights();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await generateInsights();
    setRefreshing(false);
  };

  const filteredInsights = insights.filter(insight => {
    if (activeTab === 'all') return true;
    if (activeTab === 'patterns') return insight.category === 'pattern';
    if (activeTab === 'encouragement') return insight.category === 'encouragement';
    if (activeTab === 'suggestions') return insight.category === 'suggestion';
    if (activeTab === 'reflections') return insight.category === 'reflection';
    return true;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'pattern': return '📊';
      case 'encouragement': return '💪';
      case 'suggestion': return '💡';
      case 'reflection': return '🤔';
      default: return '✨';
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Generating insights...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasEnoughData()) {
    return (
      <Card className={className}>
        <CardContent>
          <h3 className="text-lg font-semibold mb-4">🌱 Building Your Profile</h3>
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📊</div>
            <h4 className="font-medium text-gray-900 mb-2">Almost Ready for Insights!</h4>
            <p className="text-gray-600 mb-6">
              Complete a few more check-ins or add some goals to unlock personalized insights from your AI coach.
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center justify-center space-x-2">
                <span>✅ Check-ins: {JSON.parse(localStorage.getItem('momentum_checkins') || '[]').length}/3</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span>✅ Goals: {JSON.parse(localStorage.getItem('momentum_goals') || '[]').length}/2</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">AI Insights</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? '🔄' : '↻'} Refresh
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          {[
            { key: 'all', label: 'All' },
            { key: 'patterns', label: 'Patterns' },
            { key: 'encouragement', label: 'Motivation' },
            { key: 'suggestions', label: 'Tips' },
            { key: 'reflections', label: 'Reflect' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Insights Grid */}
        <div className="space-y-4">
          {filteredInsights.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-gray-600">No insights available for this category yet.</p>
            </div>
          ) : (
            filteredInsights.map((insight) => (
              <div
                key={insight.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getCategoryIcon(insight.category)}</span>
                    <h4 className="font-medium text-gray-900">{insight.title}</h4>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">
                      {insight.category}
                    </Badge>
                    {insight.confidence && (
                      <span className="text-xs text-gray-500">
                        {insight.confidence}% confident
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-700 mb-3">{insight.content}</p>
                
                {insight.confidence && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Confidence</span>
                      <span>{insight.confidence}%</span>
                    </div>
                    <Progress value={insight.confidence} />
                  </div>
                )}
                
                {insight.actionable && (
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      👍 Helpful
                    </Button>
                    <Button size="sm" variant="outline">
                      💬 Tell me more
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InsightCards; 