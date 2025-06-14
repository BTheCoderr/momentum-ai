import React, { useState, useEffect } from 'react';
import { Trophy, Star, Flame, Target, Calendar, Users, Zap, Award, Crown, Medal } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  category: 'streaks' | 'goals' | 'social' | 'milestones' | 'special';
  difficulty: 'bronze' | 'silver' | 'gold' | 'platinum';
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedDate?: string;
  reward: string;
  rarity: number; // percentage of users who have this
}

interface AchievementSystemProps {
  userStats: {
    totalGoals: number;
    completedGoals: number;
    currentStreak: number;
    longestStreak: number;
    totalCheckIns: number;
    daysActive: number;
    podParticipation: number;
  };
}

export default function AchievementSystem({ userStats }: AchievementSystemProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);

  useEffect(() => {
    generateAchievements();
  }, [userStats]);

  const generateAchievements = () => {
    const allAchievements: Achievement[] = [
      // Streak Achievements
      {
        id: 'first-week',
        title: 'First Steps',
        description: 'Complete your first 7-day streak',
        icon: Flame,
        category: 'streaks',
        difficulty: 'bronze',
        progress: Math.min(userStats.currentStreak, 7),
        maxProgress: 7,
        unlocked: userStats.currentStreak >= 7,
        unlockedDate: userStats.currentStreak >= 7 ? '2024-01-15' : undefined,
        reward: '+50 XP, Streak Protector (1 day)',
        rarity: 78
      },
      {
        id: 'month-warrior',
        title: 'Month Warrior',
        description: 'Maintain a 30-day streak',
        icon: Crown,
        category: 'streaks',
        difficulty: 'silver',
        progress: Math.min(userStats.longestStreak, 30),
        maxProgress: 30,
        unlocked: userStats.longestStreak >= 30,
        unlockedDate: userStats.longestStreak >= 30 ? '2024-01-20' : undefined,
        reward: '+200 XP, Custom Goal Templates',
        rarity: 34
      },
      {
        id: 'century-club',
        title: 'Century Club',
        description: 'Achieve a 100-day streak',
        icon: Medal,
        category: 'streaks',
        difficulty: 'gold',
        progress: Math.min(userStats.longestStreak, 100),
        maxProgress: 100,
        unlocked: userStats.longestStreak >= 100,
        reward: '+500 XP, Priority Support',
        rarity: 8
      },

      // Goal Achievements
      {
        id: 'goal-setter',
        title: 'Goal Setter',
        description: 'Create your first goal',
        icon: Target,
        category: 'goals',
        difficulty: 'bronze',
        progress: Math.min(userStats.totalGoals, 1),
        maxProgress: 1,
        unlocked: userStats.totalGoals >= 1,
        unlockedDate: userStats.totalGoals >= 1 ? '2024-01-10' : undefined,
        reward: '+25 XP, Goal Templates',
        rarity: 95
      },
      {
        id: 'achiever',
        title: 'Achiever',
        description: 'Complete 5 goals',
        icon: Trophy,
        category: 'goals',
        difficulty: 'silver',
        progress: Math.min(userStats.completedGoals, 5),
        maxProgress: 5,
        unlocked: userStats.completedGoals >= 5,
        reward: '+150 XP, Advanced Analytics',
        rarity: 42
      },
      {
        id: 'master-achiever',
        title: 'Master Achiever',
        description: 'Complete 25 goals',
        icon: Crown,
        category: 'goals',
        difficulty: 'gold',
        progress: Math.min(userStats.completedGoals, 25),
        maxProgress: 25,
        unlocked: userStats.completedGoals >= 25,
        reward: '+400 XP, AI Coach Pro',
        rarity: 12
      },

      // Social Achievements
      {
        id: 'team-player',
        title: 'Team Player',
        description: 'Join your first accountability pod',
        icon: Users,
        category: 'social',
        difficulty: 'bronze',
        progress: Math.min(userStats.podParticipation, 1),
        maxProgress: 1,
        unlocked: userStats.podParticipation >= 1,
        reward: '+75 XP, Pod Leader Badge',
        rarity: 67
      },
      {
        id: 'community-champion',
        title: 'Community Champion',
        description: 'Help 10 pod members reach their goals',
        icon: Award,
        category: 'social',
        difficulty: 'gold',
        progress: 3, // This would come from actual pod interaction data
        maxProgress: 10,
        unlocked: false,
        reward: '+300 XP, Mentor Status',
        rarity: 15
      },

      // Milestone Achievements
      {
        id: 'check-in-champion',
        title: 'Check-in Champion',
        description: 'Complete 100 daily check-ins',
        icon: Calendar,
        category: 'milestones',
        difficulty: 'silver',
        progress: Math.min(userStats.totalCheckIns, 100),
        maxProgress: 100,
        unlocked: userStats.totalCheckIns >= 100,
        reward: '+250 XP, Smart Reminders',
        rarity: 28
      },
      {
        id: 'momentum-master',
        title: 'Momentum Master',
        description: 'Stay active for 365 days',
        icon: Zap,
        category: 'milestones',
        difficulty: 'platinum',
        progress: Math.min(userStats.daysActive, 365),
        maxProgress: 365,
        unlocked: userStats.daysActive >= 365,
        reward: '+1000 XP, Lifetime Pro Access',
        rarity: 3
      },

      // Special Achievements
      {
        id: 'early-adopter',
        title: 'Early Adopter',
        description: 'Joined during beta phase',
        icon: Star,
        category: 'special',
        difficulty: 'gold',
        progress: 1,
        maxProgress: 1,
        unlocked: true,
        unlockedDate: '2024-01-01',
        reward: 'Exclusive Beta Badge, Lifetime Discount',
        rarity: 5
      }
    ];

    setAchievements(allAchievements);
  };

  const categories = [
    { id: 'all', name: 'All', icon: Trophy },
    { id: 'streaks', name: 'Streaks', icon: Flame },
    { id: 'goals', name: 'Goals', icon: Target },
    { id: 'social', name: 'Social', icon: Users },
    { id: 'milestones', name: 'Milestones', icon: Calendar },
    { id: 'special', name: 'Special', icon: Star }
  ];

  const filteredAchievements = achievements.filter(achievement => {
    const categoryMatch = selectedCategory === 'all' || achievement.category === selectedCategory;
    const unlockedMatch = !showUnlockedOnly || achievement.unlocked;
    return categoryMatch && unlockedMatch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'bronze': return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'silver': return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'gold': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'platinum': return 'bg-purple-100 text-purple-700 border-purple-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getRarityColor = (rarity: number) => {
    if (rarity >= 70) return 'text-gray-600';
    if (rarity >= 30) return 'text-blue-600';
    if (rarity >= 10) return 'text-purple-600';
    return 'text-orange-600';
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalXP = achievements.filter(a => a.unlocked).reduce((sum, a) => {
    const xpMatch = a.reward.match(/\+(\d+) XP/);
    return sum + (xpMatch ? parseInt(xpMatch[1]) : 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Achievement System</h2>
            <p className="text-gray-600">Track your progress and unlock rewards</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{unlockedCount}</div>
            <div className="text-sm text-yellow-700">Achievements Unlocked</div>
          </div>
          <div className="bg-white/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{totalXP}</div>
            <div className="text-sm text-orange-700">Total XP Earned</div>
          </div>
          <div className="bg-white/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{userStats.currentStreak}</div>
            <div className="text-sm text-purple-700">Current Streak</div>
          </div>
          <div className="bg-white/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{Math.round((unlockedCount / achievements.length) * 100)}%</div>
            <div className="text-sm text-green-700">Completion Rate</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex space-x-2 overflow-x-auto">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>

        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showUnlockedOnly}
            onChange={(e) => setShowUnlockedOnly(e.target.checked)}
            className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
          />
          <span className="text-sm text-gray-700">Show unlocked only</span>
        </label>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAchievements.map((achievement) => {
          const Icon = achievement.icon;
          const progressPercentage = (achievement.progress / achievement.maxProgress) * 100;

          return (
            <div
              key={achievement.id}
              className={`rounded-xl p-6 border-2 transition-all ${
                achievement.unlocked
                  ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300 shadow-lg'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  achievement.unlocked
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                    : 'bg-gray-100'
                }`}>
                  <Icon className={`w-6 h-6 ${
                    achievement.unlocked ? 'text-white' : 'text-gray-400'
                  }`} />
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(achievement.difficulty)}`}>
                    {achievement.difficulty}
                  </span>
                  <span className={`text-xs font-medium ${getRarityColor(achievement.rarity)}`}>
                    {achievement.rarity}% have this
                  </span>
                </div>
              </div>

              <h3 className={`text-lg font-bold mb-2 ${
                achievement.unlocked ? 'text-gray-900' : 'text-gray-600'
              }`}>
                {achievement.title}
              </h3>
              
              <p className={`text-sm mb-4 ${
                achievement.unlocked ? 'text-gray-700' : 'text-gray-500'
              }`}>
                {achievement.description}
              </p>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">
                    {achievement.progress}/{achievement.maxProgress}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      achievement.unlocked
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                        : 'bg-gray-400'
                    }`}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              {/* Reward */}
              <div className={`p-3 rounded-lg ${
                achievement.unlocked ? 'bg-white/70' : 'bg-gray-50'
              }`}>
                <h4 className="font-medium text-gray-900 mb-1">Reward</h4>
                <p className="text-sm text-gray-700">{achievement.reward}</p>
              </div>

              {/* Unlocked Date */}
              {achievement.unlocked && achievement.unlockedDate && (
                <div className="mt-3 pt-3 border-t border-yellow-200">
                  <p className="text-xs text-yellow-700">
                    Unlocked on {new Date(achievement.unlockedDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No achievements found</h3>
          <p className="text-gray-600">Try adjusting your filters or keep working towards your goals!</p>
        </div>
      )}
    </div>
  );
} 