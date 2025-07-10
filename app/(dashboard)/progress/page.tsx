'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// XP calculation functions
const levelFromXP = (xp: number): number => {
  return Math.floor(xp / 100) + 1;
};

const xpForNextLevel = (level: number): number => {
  return level * 100;
};

interface Achievement {
  id: number;
  name: string;
  description: string;
  unlocked: boolean;
  icon: string;
  xpReward: number;
}

export default function XPProgressPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState<any>(null);
  const [progressAnimation, setProgressAnimation] = useState(0);

  // Mock data for now - in a real app, this would come from the database
  const mockStats = {
    totalXP: 350,
    lastXPGain: 25,
    lastXPAction: 'Daily Check-in',
    achievements: [
      { id: 1, name: 'First Steps', description: 'Complete your first check-in', unlocked: true, icon: '🎯', xpReward: 10 },
      { id: 2, name: 'Streak Master', description: 'Maintain a 7-day streak', unlocked: true, icon: '🔥', xpReward: 50 },
      { id: 3, name: 'Goal Getter', description: 'Create your first goal', unlocked: true, icon: '⭐', xpReward: 25 },
      { id: 4, name: 'Reflection Pro', description: 'Complete 5 reflections', unlocked: false, icon: '🧘', xpReward: 75 },
      { id: 5, name: 'Level 5 Champion', description: 'Reach level 5', unlocked: false, icon: '👑', xpReward: 100 },
      { id: 6, name: 'Goal Crusher', description: 'Complete 10 goals', unlocked: false, icon: '💪', xpReward: 150 },
      { id: 7, name: 'Consistency King', description: 'Maintain 30-day streak', unlocked: false, icon: '🏆', xpReward: 200 },
      { id: 8, name: 'Mindful Master', description: 'Complete 20 check-ins', unlocked: false, icon: '🧠', xpReward: 125 },
    ] as Achievement[]
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // In a real app, fetch from Supabase
      setUserStats(mockStats);
      
      // Animate progress bar
      const currentLevel = levelFromXP(mockStats.totalXP);
      const nextLevelXP = xpForNextLevel(currentLevel);
      const previousLevelXP = currentLevel > 1 ? xpForNextLevel(currentLevel - 1) : 0;
      const progress = (mockStats.totalXP - previousLevelXP) / (nextLevelXP - previousLevelXP);
      
      setTimeout(() => {
        setProgressAnimation(progress * 100);
      }, 500);
      
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !userStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your progress...</p>
        </div>
      </div>
    );
  }

  const currentLevel = levelFromXP(userStats.totalXP);
  const nextLevelXP = xpForNextLevel(currentLevel);
  const previousLevelXP = currentLevel > 1 ? xpForNextLevel(currentLevel - 1) : 0;
  const xpInCurrentLevel = userStats.totalXP - previousLevelXP;
  const xpNeededForCurrentLevel = nextLevelXP - previousLevelXP;
  const unlockedAchievements = userStats.achievements.filter((a: Achievement) => a.unlocked);

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Progress</h1>
          <p className="text-gray-600">Track your journey and celebrate your achievements</p>
        </div>

        {/* Level Badge */}
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 mb-6 text-center">
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg">
              <span className="text-3xl">🏆</span>
            </div>
            <div className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
              {currentLevel}
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Level {currentLevel}</h2>
          <p className="text-gray-600 text-lg">{userStats.totalXP} Total XP</p>
        </div>

        {/* XP Progress Bar */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Progress to Level {currentLevel + 1}</h3>
            <span className="text-sm text-gray-600">
              {xpInCurrentLevel} / {xpNeededForCurrentLevel} XP
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-orange-500 to-red-500 h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progressAnimation}%` }}
            ></div>
          </div>
          
          <p className="text-center text-gray-600">
            <span className="font-semibold">{xpNeededForCurrentLevel - xpInCurrentLevel} XP</span> to next level
          </p>
        </div>

        {/* Recent Activity */}
        {userStats.lastXPGain && (
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="flex items-center p-4 bg-green-50 rounded-2xl">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-4">
                <span className="text-white text-lg">✨</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{userStats.lastXPAction}</p>
                <p className="text-green-600 font-semibold">+{userStats.lastXPGain} XP</p>
              </div>
            </div>
          </div>
        )}

        {/* Achievements */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Achievements ({unlockedAchievements.length}/{userStats.achievements.length})
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {userStats.achievements.map((achievement: Achievement) => (
              <div 
                key={achievement.id} 
                className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                  achievement.unlocked 
                    ? 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200' 
                    : 'bg-gray-50 border-gray-200 opacity-60'
                }`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">{achievement.icon}</div>
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">{achievement.name}</h4>
                  <p className="text-xs text-gray-600 mb-2">{achievement.description}</p>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-xs text-orange-600">+{achievement.xpReward} XP</span>
                    {achievement.unlocked && (
                      <span className="text-green-500 text-xs">✓</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* XP Earning Tips */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Earn More XP</h3>
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-orange-50 rounded-xl">
              <span className="text-2xl mr-3">📝</span>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Daily Check-in</p>
                <p className="text-sm text-gray-600">+10-60 XP (streak bonus)</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-blue-50 rounded-xl">
              <span className="text-2xl mr-3">🎯</span>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Create Goal</p>
                <p className="text-sm text-gray-600">+25 XP</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-green-50 rounded-xl">
              <span className="text-2xl mr-3">🏆</span>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Complete Goal</p>
                <p className="text-sm text-gray-600">+100 XP</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-purple-50 rounded-xl">
              <span className="text-2xl mr-3">🧘</span>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Reflection</p>
                <p className="text-sm text-gray-600">+50 XP</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-pink-50 rounded-xl">
              <span className="text-2xl mr-3">🤖</span>
              <div className="flex-1">
                <p className="font-medium text-gray-900">AI Coaching Session</p>
                <p className="text-sm text-gray-600">+30 XP</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
} 