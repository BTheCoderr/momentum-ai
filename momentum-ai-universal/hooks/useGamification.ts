import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserXP {
  totalXP: number;
  level: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  progress: number;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  xpReward: number;
}

// XP Rewards
export const XP_REWARDS = {
  DAILY_CHECKIN: 25,
  FIRST_CHECKIN: 50,
  STREAK_7_DAYS: 100,
  STREAK_30_DAYS: 250,
  CREATE_GOAL: 30,
  COMPLETE_GOAL: 100,
  REFLECTION: 40,
  CHAT_WITH_AI: 15,
  PROFILE_COMPLETE: 75,
};

// Level calculation
export const levelFromXP = (xp: number): number => {
  return Math.floor(xp / 100) + 1;
};

export const xpForLevel = (level: number): number => {
  return (level - 1) * 100;
};

export const xpForNextLevel = (currentLevel: number): number => {
  return currentLevel * 100;
};

export const useGamification = () => {
  const [userXP, setUserXP] = useState<UserXP>({
    totalXP: 0,
    level: 1,
    xpForCurrentLevel: 0,
    xpForNextLevel: 100,
    progress: 0,
    achievements: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserXP();
  }, []);

  const loadUserXP = async () => {
    try {
      const storedXP = await AsyncStorage.getItem('userXP');
      const storedAchievements = await AsyncStorage.getItem('achievements');
      
      const totalXP = storedXP ? parseInt(storedXP) : 0;
      const achievements = storedAchievements ? JSON.parse(storedAchievements) : getDefaultAchievements();
      
      const level = levelFromXP(totalXP);
      const xpForCurrentLevel = xpForLevel(level);
      const xpForNextLevel = xpForLevel(level + 1);
      const progress = (totalXP - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel);

      setUserXP({
        totalXP,
        level,
        xpForCurrentLevel,
        xpForNextLevel,
        progress,
        achievements,
      });
    } catch (error) {
      console.error('Error loading user XP:', error);
    } finally {
      setLoading(false);
    }
  };

  const addXP = async (amount: number, reason: string) => {
    try {
      const newTotalXP = userXP.totalXP + amount;
      const newLevel = levelFromXP(newTotalXP);
      const xpForCurrentLevel = xpForLevel(newLevel);
      const xpForNextLevel = xpForLevel(newLevel + 1);
      const progress = (newTotalXP - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel);

      // Check for level up
      const leveledUp = newLevel > userXP.level;

      // Update achievements
      const updatedAchievements = checkAchievements(newTotalXP, userXP.achievements);

      const updatedUserXP = {
        totalXP: newTotalXP,
        level: newLevel,
        xpForCurrentLevel,
        xpForNextLevel,
        progress,
        achievements: updatedAchievements,
      };

      setUserXP(updatedUserXP);
      
      // Save to storage
      await AsyncStorage.setItem('userXP', newTotalXP.toString());
      await AsyncStorage.setItem('achievements', JSON.stringify(updatedAchievements));

      // Return info for UI feedback
      return {
        xpGained: amount,
        leveledUp,
        newLevel,
        reason,
        newAchievements: updatedAchievements.filter(a => 
          a.unlocked && !userXP.achievements.find(old => old.id === a.id && old.unlocked)
        ),
      };
    } catch (error) {
      console.error('Error adding XP:', error);
      return null;
    }
  };

  const checkAchievements = (totalXP: number, currentAchievements: Achievement[]): Achievement[] => {
    const level = levelFromXP(totalXP);
    
    return currentAchievements.map(achievement => {
      if (achievement.unlocked) return achievement;

      let shouldUnlock = false;

      switch (achievement.id) {
        case 'first_checkin':
          // This would be triggered when first check-in is completed
          break;
        case 'streak_7':
          // This would be triggered when 7-day streak is achieved
          break;
        case 'level_5':
          shouldUnlock = level >= 5;
          break;
        case 'level_10':
          shouldUnlock = level >= 10;
          break;
        case 'xp_500':
          shouldUnlock = totalXP >= 500;
          break;
        case 'xp_1000':
          shouldUnlock = totalXP >= 1000;
          break;
      }

      return {
        ...achievement,
        unlocked: shouldUnlock,
      };
    });
  };

  const getDefaultAchievements = (): Achievement[] => [
    {
      id: 'first_checkin',
      name: 'First Steps',
      description: 'Complete your first check-in',
      icon: '🎯',
      unlocked: false,
      xpReward: 50,
    },
    {
      id: 'streak_7',
      name: 'Week Warrior',
      description: 'Maintain a 7-day streak',
      icon: '🔥',
      unlocked: false,
      xpReward: 100,
    },
    {
      id: 'level_5',
      name: 'Rising Star',
      description: 'Reach level 5',
      icon: '⭐',
      unlocked: false,
      xpReward: 150,
    },
    {
      id: 'level_10',
      name: 'Champion',
      description: 'Reach level 10',
      icon: '👑',
      unlocked: false,
      xpReward: 250,
    },
    {
      id: 'xp_500',
      name: 'XP Collector',
      description: 'Earn 500 total XP',
      icon: '💎',
      unlocked: false,
      xpReward: 100,
    },
    {
      id: 'xp_1000',
      name: 'XP Master',
      description: 'Earn 1000 total XP',
      icon: '🏆',
      unlocked: false,
      xpReward: 200,
    },
  ];

  return {
    userXP,
    loading,
    addXP,
    refresh: loadUserXP,
  };
};

export const useUserXP = () => {
  const { userXP, loading } = useGamification();
  
  return {
    xp: userXP.totalXP,
    level: userXP.level,
    nextLevelXP: userXP.xpForNextLevel,
    progress: userXP.progress,
    achievements: userXP.achievements,
    loading,
  };
}; 