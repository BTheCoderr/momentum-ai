'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface LeaderboardUser {
  id: string;
  name: string;
  xp: number;
  level: number;
  streak: number;
  rank: number;
  avatar: string;
  isCurrentUser?: boolean;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'xp' | 'streak' | 'level'>('xp');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [currentUser, setCurrentUser] = useState<LeaderboardUser | null>(null);

  // Mock data - in real app, this would come from database
  const mockLeaderboardData: LeaderboardUser[] = [
    { id: '1', name: 'Alex Chen', xp: 2890, level: 8, streak: 45, rank: 1, avatar: '🧠' },
    { id: '2', name: 'Sarah Kim', xp: 2750, level: 7, streak: 23, rank: 2, avatar: '🎯' },
    { id: '3', name: 'Mike Johnson', xp: 2650, level: 7, streak: 38, rank: 3, avatar: '🚀' },
    { id: '4', name: 'Emma Davis', xp: 2500, level: 6, streak: 15, rank: 4, avatar: '⭐' },
    { id: '5', name: 'You', xp: 2450, level: 5, streak: 12, rank: 5, avatar: '👤', isCurrentUser: true },
    { id: '6', name: 'David Wilson', xp: 2350, level: 6, streak: 28, rank: 6, avatar: '🔥' },
    { id: '7', name: 'Lisa Wang', xp: 2200, level: 5, streak: 9, rank: 7, avatar: '💪' },
    { id: '8', name: 'Tom Brown', xp: 2100, level: 5, streak: 31, rank: 8, avatar: '🎪' },
    { id: '9', name: 'Anna Lee', xp: 2050, level: 4, streak: 6, rank: 9, avatar: '🌟' },
    { id: '10', name: 'Chris Taylor', xp: 1950, level: 4, streak: 19, rank: 10, avatar: '🏆' },
  ];

  useEffect(() => {
    loadLeaderboard();
  }, [activeTab]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Sort data based on active tab
      let sortedData = [...mockLeaderboardData];
      
      if (activeTab === 'xp') {
        sortedData.sort((a, b) => b.xp - a.xp);
      } else if (activeTab === 'streak') {
        sortedData.sort((a, b) => b.streak - a.streak);
      } else if (activeTab === 'level') {
        sortedData.sort((a, b) => b.level - a.level || b.xp - a.xp);
      }

      // Update ranks
      sortedData.forEach((user, index) => {
        user.rank = index + 1;
      });

      setLeaderboardData(sortedData);
      setCurrentUser(sortedData.find(u => u.isCurrentUser) || null);
      
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getTabData = (user: LeaderboardUser) => {
    switch (activeTab) {
      case 'xp': return `${user.xp} XP`;
      case 'streak': return `${user.streak} days`;
      case 'level': return `Level ${user.level}`;
      default: return `${user.xp} XP`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-orange-100 pb-20">
      <div className="max-w-2xl mx-auto p-6">
        
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <span className="mr-2">←</span>
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Leaderboard</h1>
          <p className="text-gray-600">See how you rank against other momentum builders</p>
        </div>

        {/* Current User Rank */}
        {currentUser && (
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-6 text-white mb-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                  {currentUser.avatar}
                </div>
                <div>
                  <h3 className="text-xl font-bold">Your Rank</h3>
                  <p className="text-white/90">
                    {getRankIcon(currentUser.rank)} • {getTabData(currentUser)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{getRankIcon(currentUser.rank)}</div>
                <div className="text-sm text-white/90">out of {leaderboardData.length}</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-3xl p-2 shadow-lg border border-gray-100 mb-6">
          <div className="grid grid-cols-3 gap-2">
            {(['xp', 'streak', 'level'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-4 rounded-2xl font-medium transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab === 'xp' ? '🏆 XP' : tab === 'streak' ? '🔥 Streak' : '📊 Level'}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard List */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">
              {activeTab === 'xp' ? 'Top XP Earners' : 
               activeTab === 'streak' ? 'Longest Streaks' : 
               'Highest Levels'}
            </h3>
          </div>
          
          <div className="divide-y divide-gray-100">
            {leaderboardData.map((user, index) => (
              <div 
                key={user.id} 
                className={`p-4 flex items-center space-x-4 hover:bg-gray-50 transition-colors ${
                  user.isCurrentUser ? 'bg-orange-50 border-l-4 border-orange-500' : ''
                }`}
              >
                {/* Rank */}
                <div className="flex-shrink-0 w-12 text-center">
                  {user.rank <= 3 ? (
                    <span className="text-2xl">{getRankIcon(user.rank)}</span>
                  ) : (
                    <span className="text-lg font-semibold text-gray-600">#{user.rank}</span>
                  )}
                </div>
                
                {/* Avatar */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                  user.isCurrentUser 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-100'
                }`}>
                  {user.avatar}
                </div>
                
                {/* User Info */}
                <div className="flex-1">
                  <h4 className={`font-semibold ${
                    user.isCurrentUser ? 'text-orange-600' : 'text-gray-900'
                  }`}>
                    {user.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    Level {user.level} • {user.streak} day streak
                  </p>
                </div>
                
                {/* Score */}
                <div className="text-right">
                  <div className={`text-lg font-semibold ${
                    user.isCurrentUser ? 'text-orange-600' : 'text-gray-900'
                  }`}>
                    {getTabData(user)}
                  </div>
                  {activeTab !== 'xp' && (
                    <div className="text-sm text-gray-500">
                      {user.xp} XP
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Motivation Section */}
        <div className="mt-6 bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Level Up Your Ranking</h3>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-orange-50 rounded-xl">
              <span className="text-2xl mr-3">📝</span>
              <div>
                <p className="font-medium text-gray-900">Complete Daily Check-ins</p>
                <p className="text-sm text-gray-600">+10-60 XP per day</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-blue-50 rounded-xl">
              <span className="text-2xl mr-3">🔥</span>
              <div>
                <p className="font-medium text-gray-900">Maintain Your Streak</p>
                <p className="text-sm text-gray-600">Consistency is key to climbing ranks</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-green-50 rounded-xl">
              <span className="text-2xl mr-3">🏆</span>
              <div>
                <p className="font-medium text-gray-900">Complete Goals</p>
                <p className="text-sm text-gray-600">+100 XP per completed goal</p>
              </div>
            </div>
          </div>
        </div>

        {/* Share Section */}
        <div className="mt-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">🎉 Share Your Progress</h3>
          <p className="text-white/90 mb-4">
            You're in the top {Math.round((currentUser?.rank || 5) / leaderboardData.length * 100)}% of users!
          </p>
          <button className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-medium transition-colors">
            Share Achievement
          </button>
        </div>

      </div>
    </div>
  );
} 