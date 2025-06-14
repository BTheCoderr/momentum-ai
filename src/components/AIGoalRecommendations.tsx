import React, { useState, useEffect } from 'react';
import { Brain, Target, TrendingUp, Clock, Zap, Star, ChevronRight, Plus } from 'lucide-react';

interface GoalRecommendation {
  id: string;
  title: string;
  description: string;
  category: 'health' | 'productivity' | 'learning' | 'relationships' | 'finance';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeCommitment: string;
  successRate: number;
  reasoning: string;
  habits: string[];
  estimatedDuration: string;
  personalizedTip: string;
}

interface AIGoalRecommendationsProps {
  userProfile: {
    currentGoals: any[];
    completedGoals: any[];
    preferences: string[];
    availableTime: string;
    experience: string;
  };
  onSelectGoal: (goal: GoalRecommendation) => void;
}

export default function AIGoalRecommendations({ userProfile, onSelectGoal }: AIGoalRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<GoalRecommendation[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    generateRecommendations();
  }, [userProfile]);

  const generateRecommendations = () => {
    setIsLoading(true);
    
    // Simulate AI analysis delay
    setTimeout(() => {
      const smartRecommendations: GoalRecommendation[] = [
        {
          id: 'morning-routine',
          title: 'Perfect Morning Routine',
          description: 'Build a consistent morning routine that sets you up for daily success',
          category: 'productivity',
          difficulty: 'beginner',
          timeCommitment: '30 minutes daily',
          successRate: 87,
          reasoning: 'Based on your current schedule and productivity goals, a morning routine would create momentum for your other habits.',
          habits: ['Wake up at 6:30 AM', 'Drink 16oz water', '10-minute meditation', 'Review daily priorities'],
          estimatedDuration: '21 days to establish',
          personalizedTip: 'Start with just 2 habits and gradually add more. Your peak energy is in the morning!'
        },
        {
          id: 'fitness-foundation',
          title: 'Sustainable Fitness Foundation',
          description: 'Build lasting fitness habits without overwhelming your schedule',
          category: 'health',
          difficulty: 'beginner',
          timeCommitment: '20 minutes, 3x/week',
          successRate: 92,
          reasoning: 'Your current goals show you value consistency. This fitness approach prioritizes sustainability over intensity.',
          habits: ['Monday: 20-min walk', 'Wednesday: Bodyweight exercises', 'Friday: Yoga or stretching'],
          estimatedDuration: '6 weeks to habit',
          personalizedTip: 'Schedule workouts like meetings. Your calendar shows Tuesday evenings are consistently free!'
        },
        {
          id: 'skill-development',
          title: 'Daily Skill Building',
          description: 'Dedicate focused time to learning a new skill that advances your career',
          category: 'learning',
          difficulty: 'intermediate',
          timeCommitment: '45 minutes daily',
          successRate: 78,
          reasoning: 'Your productivity patterns suggest you learn best in focused blocks. This goal aligns with your growth mindset.',
          habits: ['Choose one skill to focus on', 'Study for 45 minutes daily', 'Practice with real projects', 'Track progress weekly'],
          estimatedDuration: '90 days to proficiency',
          personalizedTip: 'Your most focused time is 2-4 PM. Block this time for deep learning!'
        },
        {
          id: 'financial-wellness',
          title: 'Financial Wellness Tracker',
          description: 'Build healthy money habits and increase financial awareness',
          category: 'finance',
          difficulty: 'beginner',
          timeCommitment: '15 minutes daily',
          successRate: 85,
          reasoning: 'Financial goals often provide the foundation for other life goals. Starting here creates stability.',
          habits: ['Track daily expenses', 'Review weekly spending', 'Save $5 daily', 'Learn one financial concept weekly'],
          estimatedDuration: '30 days to establish',
          personalizedTip: 'Link this to your morning routine - review finances with your coffee!'
        },
        {
          id: 'relationship-building',
          title: 'Meaningful Connections',
          description: 'Strengthen relationships through intentional, consistent communication',
          category: 'relationships',
          difficulty: 'intermediate',
          timeCommitment: '20 minutes daily',
          successRate: 81,
          reasoning: 'Strong relationships are the #1 predictor of happiness. Your social goals suggest this is important to you.',
          habits: ['Text one friend daily', 'Call family weekly', 'Plan monthly friend meetups', 'Practice active listening'],
          estimatedDuration: '60 days to natural habit',
          personalizedTip: 'Set phone reminders for relationship check-ins. Your calendar shows Sunday evenings work well!'
        }
      ];

      setRecommendations(smartRecommendations);
      setIsLoading(false);
    }, 1500);
  };

  const categories = [
    { id: 'all', name: 'All Recommendations', icon: Brain },
    { id: 'health', name: 'Health & Fitness', icon: Zap },
    { id: 'productivity', name: 'Productivity', icon: Target },
    { id: 'learning', name: 'Learning & Growth', icon: TrendingUp },
    { id: 'finance', name: 'Financial', icon: Star },
    { id: 'relationships', name: 'Relationships', icon: Clock }
  ];

  const filteredRecommendations = selectedCategory === 'all' 
    ? recommendations 
    : recommendations.filter(r => r.category === selectedCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'health': return 'bg-green-50 border-green-200';
      case 'productivity': return 'bg-blue-50 border-blue-200';
      case 'learning': return 'bg-purple-50 border-purple-200';
      case 'finance': return 'bg-yellow-50 border-yellow-200';
      case 'relationships': return 'bg-pink-50 border-pink-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
        <div className="flex items-center justify-center space-x-3 mb-6">
          <Brain className="w-8 h-8 text-blue-600 animate-pulse" />
          <h2 className="text-2xl font-bold text-gray-900">AI Analyzing Your Patterns...</h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI Goal Recommendations</h2>
            <p className="text-gray-600">Personalized suggestions based on your patterns and preferences</p>
          </div>
        </div>
        
        <div className="bg-white/50 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Analysis Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Current Goals:</span>
              <span className="font-medium ml-2">{userProfile.currentGoals.length}</span>
            </div>
            <div>
              <span className="text-blue-700">Success Rate:</span>
              <span className="font-medium ml-2">87%</span>
            </div>
            <div>
              <span className="text-blue-700">Available Time:</span>
              <span className="font-medium ml-2">{userProfile.availableTime || '1-2 hours/day'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{category.name}</span>
            </button>
          );
        })}
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRecommendations.map((recommendation) => (
          <div
            key={recommendation.id}
            className={`rounded-xl p-6 border-2 hover:shadow-lg transition-all cursor-pointer ${getCategoryColor(recommendation.category)}`}
            onClick={() => onSelectGoal(recommendation)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{recommendation.title}</h3>
                <p className="text-gray-600 mb-3">{recommendation.description}</p>
                
                <div className="flex items-center space-x-3 mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recommendation.difficulty)}`}>
                    {recommendation.difficulty}
                  </span>
                  <span className="text-sm text-gray-600">
                    <Clock className="w-4 h-4 inline mr-1" />
                    {recommendation.timeCommitment}
                  </span>
                  <span className="text-sm font-medium text-green-600">
                    {recommendation.successRate}% success rate
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>

            <div className="bg-white/70 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">Why This Goal?</h4>
              <p className="text-sm text-gray-700 mb-3">{recommendation.reasoning}</p>
              
              <div className="bg-blue-50 rounded-lg p-3">
                <h5 className="font-medium text-blue-900 mb-1">💡 Personalized Tip</h5>
                <p className="text-sm text-blue-800">{recommendation.personalizedTip}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Suggested Habits:</h4>
              <div className="space-y-1">
                {recommendation.habits.slice(0, 3).map((habit, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span>{habit}</span>
                  </div>
                ))}
                {recommendation.habits.length > 3 && (
                  <div className="text-sm text-gray-500">
                    +{recommendation.habits.length - 3} more habits
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                <Target className="w-4 h-4 inline mr-1" />
                {recommendation.estimatedDuration}
              </span>
              <button className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                <Plus className="w-3 h-3" />
                <span>Add Goal</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredRecommendations.length === 0 && (
        <div className="text-center py-12">
          <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No recommendations in this category</h3>
          <p className="text-gray-600">Try selecting a different category or check back later for new suggestions.</p>
        </div>
      )}
    </div>
  );
} 