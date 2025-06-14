import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, Flame, Target, Users, TrendingUp, Calendar, Star, Award } from 'lucide-react';

interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  rank: number;
  score: number;
  streak: number;
  goalsCompleted: number;
  weeklyProgress: number;
  badge?: string;
  isCurrentUser?: boolean;
}

interface LeaderboardProps {
  currentUserId: string;
}

export default function Leaderboard({ currentUserId }: LeaderboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'weekly' | 'monthly' | 'allTime'>('weekly');
  const [selectedMetric, setSelectedMetric] = useState<'overall' | 'streaks' | 'goals' | 'consistency'>('overall');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);

  useEffect(() => {
    generateLeaderboardData();
  }, [selectedPeriod, selectedMetric]);

  const generateLeaderboardData = () => {
    // Mock leaderboard data - in production this would come from your API
    const mockUsers: LeaderboardUser[] = [
      {
        id: '1',
        name: 'Sarah Chen',
        avatar: '👩‍💼',
        rank: 1,
        score: 2847,
        streak: 45,
        goalsCompleted: 12,
        weeklyProgress: 98,
        badge: 'Streak Master'
      },
      {
        id: '2',
        name: 'Marcus Johnson',
        avatar: '👨‍🎓',
        rank: 2,
        score: 2634,
        streak: 32,
        goalsCompleted: 15,
        weeklyProgress: 94,
        badge: 'Goal Crusher'
      },
      {
        id: currentUserId,
        name: 'You',
        avatar: '🚀',
        rank: 3,
        score: 2456,
        streak: 12,
        goalsCompleted: 8,
        weeklyProgress: 87,
        badge: 'Rising Star',
        isCurrentUser: true
      },
      {
        id: '4',
        name: 'Emma Rodriguez',
        avatar: '👩‍🔬',
        rank: 4,
        score: 2298,
        streak: 28,
        goalsCompleted: 9,
        weeklyProgress: 91
      },
      {
        id: '5',
        name: 'David Kim',
        avatar: '👨‍💻',
        rank: 5,
        score: 2156,
        streak: 18,
        goalsCompleted: 11,
        weeklyProgress: 83
      },
      {
        id: '6',
        name: 'Lisa Thompson',
        avatar: '👩‍🎨',
        rank: 6,
        score: 2034,
        streak: 22,
        goalsCompleted: 7,
        weeklyProgress: 89
      },
      {
        id: '7',
        name: 'Alex Rivera',
        avatar: '👨‍🏫',
        rank: 7,
        score: 1987,
        streak: 15,
        goalsCompleted: 6,
        weeklyProgress: 76
      },
      {
        id: '8',
        name: 'Maya Patel',
        avatar: '👩‍⚕️',
        rank: 8,
        score: 1876,
        streak: 9,
        goalsCompleted: 10,
        weeklyProgress: 82
      }
    ];

    setLeaderboardData(mockUsers);
  };

  const periods = [
    { id: 'weekly', name: 'This Week', icon: Calendar },
    { id: 'monthly', name: 'This Month', icon: TrendingUp },
    { id: 'allTime', name: 'All Time', icon: Trophy }
  ];

  const metrics = [
    { id: 'overall', name: 'Overall Score', icon: Trophy },
    { id: 'streaks', name: 'Longest Streaks', icon: Flame },
    { id: 'goals', name: 'Goals Completed', icon: Target },
    { id: 'consistency', name: 'Consistency', icon: Star }
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Award className="w-6 h-6 text-amber-600" />;
      default: return <span className="w-6 h-6 flex items-center justify-center text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number, isCurrentUser?: boolean) => {
    if (isCurrentUser) return 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300';
    
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300';
      case 2: return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-300';
      case 3: return 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-300';
      default: return 'bg-white border-gray-200';
    }
  };

  const getScoreForMetric = (user: LeaderboardUser) => {
    switch (selectedMetric) {
      case 'streaks': return user.streak;
      case 'goals': return user.goalsCompleted;
      case 'consistency': return user.weeklyProgress;
      default: return user.score;
    }
  };

  const getScoreLabel = () => {
    switch (selectedMetric) {
      case 'streaks': return 'days';
      case 'goals': return 'completed';
      case 'consistency': return '% consistent';
      default: return 'points';
    }
  };

  const currentUser = leaderboardData.find(user => user.isCurrentUser);
  const topUsers = leaderboardData.slice(0, 3);
  const otherUsers = leaderboardData.slice(3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Leaderboard</h2>
            <p className="text-gray-600">Compete with the community and climb the ranks</p>
          </div>
        </div>

        {currentUser && (
          <div className="bg-white/50 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 mb-2">Your Position</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-purple-700">Rank:</span>
                <span className="font-bold ml-2">#{currentUser.rank}</span>
              </div>
              <div>
                <span className="text-purple-700">Score:</span>
                <span className="font-bold ml-2">{currentUser.score.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-purple-700">Streak:</span>
                <span className="font-bold ml-2">{currentUser.streak} days</span>
              </div>
              <div>
                <span className="text-purple-700">Goals:</span>
                <span className="font-bold ml-2">{currentUser.goalsCompleted} completed</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex space-x-2">
          <span className="text-sm font-medium text-gray-700 self-center">Period:</span>
          {periods.map((period) => {
            const Icon = period.icon;
            return (
              <button
                key={period.id}
                onClick={() => setSelectedPeriod(period.id as any)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                  selectedPeriod === period.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{period.name}</span>
              </button>
            );
          })}
        </div>

        <div className="flex space-x-2">
          <span className="text-sm font-medium text-gray-700 self-center">Metric:</span>
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <button
                key={metric.id}
                onClick={() => setSelectedMetric(metric.id as any)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                  selectedMetric === metric.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{metric.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Performers</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topUsers.map((user, index) => (
            <div
              key={user.id}
              className={`rounded-xl p-6 border-2 ${getRankColor(user.rank, user.isCurrentUser)} ${
                index === 0 ? 'md:order-2 transform md:scale-105' : 
                index === 1 ? 'md:order-1' : 'md:order-3'
              }`}
            >
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  {getRankIcon(user.rank)}
                </div>
                <div className="text-4xl mb-2">{user.avatar}</div>
                <h4 className="font-bold text-gray-900 mb-1">{user.name}</h4>
                {user.badge && (
                  <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full mb-2">
                    {user.badge}
                  </span>
                )}
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {getScoreForMetric(user).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">{getScoreLabel()}</div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="font-medium text-gray-900">{user.streak}</div>
                      <div className="text-gray-600">Streak</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{user.goalsCompleted}</div>
                      <div className="text-gray-600">Goals</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full Leaderboard */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Full Rankings</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {leaderboardData.map((user) => (
            <div
              key={user.id}
              className={`p-4 hover:bg-gray-50 transition-colors ${
                user.isCurrentUser ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8">
                    {getRankIcon(user.rank)}
                  </div>
                  
                  <div className="text-2xl">{user.avatar}</div>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className={`font-medium ${user.isCurrentUser ? 'text-blue-900' : 'text-gray-900'}`}>
                        {user.name}
                      </h4>
                      {user.isCurrentUser && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          You
                        </span>
                      )}
                    </div>
                    {user.badge && (
                      <span className="text-xs text-purple-600">{user.badge}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-6 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-gray-900">{getScoreForMetric(user).toLocaleString()}</div>
                    <div className="text-gray-600">{getScoreLabel()}</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="font-medium text-gray-900">{user.streak}</div>
                    <div className="text-gray-600">Streak</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="font-medium text-gray-900">{user.goalsCompleted}</div>
                    <div className="text-gray-600">Goals</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="font-medium text-gray-900">{user.weeklyProgress}%</div>
                    <div className="text-gray-600">Weekly</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Motivational Footer */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
        <div className="flex items-center space-x-3">
          <Users className="w-8 h-8 text-green-600" />
          <div>
            <h3 className="font-semibold text-green-900">Keep Climbing!</h3>
            <p className="text-green-700 text-sm">
              {currentUser && currentUser.rank > 1 
                ? `You're ${currentUser.rank - 1} spot${currentUser.rank - 1 > 1 ? 's' : ''} away from moving up!`
                : "You're at the top! Keep up the amazing work!"
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 