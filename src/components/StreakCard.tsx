import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Calendar, Trophy, Target, TrendingUp } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nsgqhhbqpyvonirlfluv.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zZ3FoaGJxcHl2b25pcmxmbHV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NTY1NTgsImV4cCI6MjA2NTMzMjU1OH0.twGF9Y6clrRtJg_4S1OWHA1vhhYpKzn3ZpFJPGJbmEo'
);

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
  weekData: boolean[]; // 7 days, true = completed
  monthData: boolean[]; // 30 days, true = completed
  streakType: 'check-in' | 'goal' | 'reflection' | 'overall';
  lastActivity: string;
  nextMilestone: number;
}

interface StreakCardProps {
  streakData: StreakData;
  onStreakTap?: () => void;
  showCelebration?: boolean;
  compact?: boolean;
}

export default function StreakCard({ 
  streakData, 
  onStreakTap, 
  showCelebration = false,
  compact = false 
}: StreakCardProps) {
  const [showFireworks, setShowFireworks] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);

  useEffect(() => {
    if (showCelebration) {
      setShowFireworks(true);
      setTimeout(() => setShowFireworks(false), 3000);
    }
  }, [showCelebration]);

  const getStreakEmoji = (streak: number) => {
    if (streak === 0) return '🌱';
    if (streak < 3) return '🔥';
    if (streak < 7) return '🚀';
    if (streak < 30) return '💪';
    if (streak < 100) return '👑';
    return '🏆';
  };

  const getStreakColor = (streak: number) => {
    if (streak === 0) return 'from-gray-400 to-gray-500';
    if (streak < 3) return 'from-orange-400 to-red-500';
    if (streak < 7) return 'from-red-400 to-pink-500';
    if (streak < 30) return 'from-purple-400 to-indigo-500';
    if (streak < 100) return 'from-blue-400 to-purple-500';
    return 'from-yellow-400 to-orange-500';
  };

  const getStreakMessage = (streak: number) => {
    if (streak === 0) return 'Start your journey!';
    if (streak === 1) return 'Great start! 🎉';
    if (streak < 7) return 'Building momentum! 💫';
    if (streak < 30) return 'On fire! 🔥';
    if (streak < 100) return 'Unstoppable! ⚡';
    return 'Legendary! 🏆';
  };

  const getMilestoneProgress = () => {
    const { currentStreak, nextMilestone } = streakData;
    const milestones = [3, 7, 14, 30, 50, 100, 365];
    const currentMilestone = milestones.find(m => m > currentStreak) || 365;
    const previousMilestone = milestones[milestones.indexOf(currentMilestone) - 1] || 0;
    
    const progress = ((currentStreak - previousMilestone) / (currentMilestone - previousMilestone)) * 100;
    return { progress: Math.max(0, Math.min(100, progress)), nextMilestone: currentMilestone };
  };

  const renderWeekView = () => {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    return (
      <div className="flex justify-between items-center space-x-1">
        {streakData.weekData.map((completed, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`
              w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
              ${completed 
                ? 'bg-green-500 text-white shadow-lg' 
                : 'bg-gray-200 text-gray-500'
              }
            `}
          >
            {completed ? '✓' : days[index]}
          </motion.div>
        ))}
      </div>
    );
  };

  const renderMonthView = () => {
    const weeks = [];
    for (let i = 0; i < streakData.monthData.length; i += 7) {
      weeks.push(streakData.monthData.slice(i, i + 7));
    }

    return (
      <div className="space-y-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex space-x-1">
            {week.map((completed, dayIndex) => (
              <motion.div
                key={`${weekIndex}-${dayIndex}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (weekIndex * 7 + dayIndex) * 0.02 }}
                className={`
                  w-3 h-3 rounded-sm
                  ${completed 
                    ? 'bg-green-500' 
                    : 'bg-gray-200'
                  }
                `}
              />
            ))}
          </div>
        ))}
      </div>
    );
  };

  const { progress, nextMilestone } = getMilestoneProgress();

  if (compact) {
    return (
      <motion.div
        whileTap={{ scale: 0.95 }}
        onClick={onStreakTap}
        className={`
          relative overflow-hidden rounded-2xl p-4 cursor-pointer
          bg-gradient-to-r ${getStreakColor(streakData.currentStreak)}
          text-white shadow-lg
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{getStreakEmoji(streakData.currentStreak)}</span>
            <div>
              <div className="text-2xl font-bold">{streakData.currentStreak}</div>
              <div className="text-sm opacity-90">day streak</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-90">Next: {nextMilestone}</div>
            <div className="w-16 h-2 bg-white/20 rounded-full mt-1">
              <div 
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`
          relative overflow-hidden rounded-3xl p-6 shadow-2xl
          bg-gradient-to-br ${getStreakColor(streakData.currentStreak)}
          text-white
        `}
      >
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-white/20 blur-xl"></div>
          <div className="absolute bottom-4 left-4 w-16 h-16 rounded-full bg-white/15 blur-lg"></div>
        </div>

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <motion.div
              animate={{ rotate: showFireworks ? [0, 10, -10, 0] : 0 }}
              transition={{ duration: 0.5, repeat: showFireworks ? 3 : 0 }}
              className="text-5xl"
            >
              {getStreakEmoji(streakData.currentStreak)}
            </motion.div>
            <div>
              <motion.div 
                key={streakData.currentStreak}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-4xl font-black"
              >
                {streakData.currentStreak}
              </motion.div>
              <div className="text-lg opacity-90 font-medium">
                {streakData.currentStreak === 1 ? 'day streak' : 'day streak'}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm opacity-90 mb-1">Best: {streakData.longestStreak}</div>
            <div className="text-sm opacity-90">Total: {streakData.totalDays}</div>
          </div>
        </div>

        {/* Streak Message */}
        <div className="relative z-10 text-center mb-6">
          <motion.div
            key={streakData.currentStreak}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl font-semibold mb-2"
          >
            {getStreakMessage(streakData.currentStreak)}
          </motion.div>
          
          {/* Progress to Next Milestone */}
          <div className="bg-white/20 rounded-full p-1 mb-2">
            <div className="flex items-center justify-between text-sm mb-1 px-2">
              <span>Next goal: {nextMilestone} days</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-white rounded-full shadow-lg"
              />
            </div>
          </div>
        </div>

        {/* Week View */}
        <div className="relative z-10 mb-6">
          <div className="text-sm opacity-90 mb-3 font-medium">This Week</div>
          {renderWeekView()}
        </div>

        {/* Month Heatmap */}
        <div className="relative z-10">
          <div className="text-sm opacity-90 mb-3 font-medium">Last 30 Days</div>
          {renderMonthView()}
        </div>

        {/* Action Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onStreakTap}
          className="relative z-10 w-full mt-6 bg-white/20 backdrop-blur-sm rounded-xl py-3 px-4 font-semibold text-white hover:bg-white/30 transition-colors"
        >
          Continue Streak 🚀
        </motion.button>
      </motion.div>

      {/* Fireworks Animation */}
      <AnimatePresence>
        {showFireworks && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  opacity: 0, 
                  scale: 0,
                  x: Math.random() * 300,
                  y: Math.random() * 200
                }}
                animate={{ 
                  opacity: [0, 1, 0], 
                  scale: [0, 1.5, 0],
                  rotate: 360
                }}
                exit={{ opacity: 0 }}
                transition={{ 
                  duration: 2,
                  delay: i * 0.2,
                  ease: "easeOut"
                }}
                className="absolute text-4xl"
              >
                {['🎉', '✨', '🎊', '⭐', '💫', '🌟'][i]}
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Milestone Celebration Modal */}
      <AnimatePresence>
        {showMilestoneModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 10 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full text-center"
            >
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Milestone Reached!
              </h3>
              <p className="text-gray-600 mb-6">
                You've completed {streakData.currentStreak} days in a row!
              </p>
              <button
                onClick={() => setShowMilestoneModal(false)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold"
              >
                Keep Going! 🚀
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Streak Comparison Component
export function StreakComparison({ 
  userStreak, 
  friendsData 
}: { 
  userStreak: number;
  friendsData: Array<{ name: string; streak: number; avatar?: string }>;
}) {
  const sortedFriends = [...friendsData].sort((a, b) => b.streak - a.streak);
  const userRank = sortedFriends.findIndex(f => f.streak <= userStreak) + 1;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        🏆 Leaderboard
      </h3>
      
      <div className="space-y-3">
        {sortedFriends.slice(0, 5).map((friend, index) => (
          <div key={friend.name} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                ${index === 0 ? 'bg-yellow-400 text-yellow-900' : 
                  index === 1 ? 'bg-gray-300 text-gray-700' :
                  index === 2 ? 'bg-orange-400 text-orange-900' :
                  'bg-gray-100 text-gray-600'}
              `}>
                {index + 1}
              </div>
              <span className="font-medium text-gray-900">{friend.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">{friend.streak} days</span>
              <span className="text-lg">{friend.streak > 0 ? '🔥' : '🌱'}</span>
            </div>
          </div>
        ))}
      </div>

      {userRank > 5 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between bg-blue-50 rounded-lg p-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                {userRank}
              </div>
              <span className="font-medium text-blue-900">You</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-blue-700">{userStreak} days</span>
              <span className="text-lg">🔥</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 