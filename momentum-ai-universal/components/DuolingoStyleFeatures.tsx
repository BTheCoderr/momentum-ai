import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from './ThemeProvider';

const { width } = Dimensions.get('window');

// Duolingo-style interfaces
interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  type: 'checkin' | 'goal' | 'reflection' | 'chat';
  progress: number;
  target: number;
  xpReward: number;
  completed: boolean;
  emoji: string;
}

interface StreakData {
  current: number;
  longest: number;
  lastCheckin: string;
  freezeUsed: boolean;
  freezeAvailable: number;
}

// Duolingo-style Streak Display
export const StreakDisplay: React.FC<{ streakData: StreakData }> = ({ streakData }) => {
  const { theme } = useTheme();
  const fireAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (streakData.current > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(fireAnimation, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(fireAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [streakData.current]);

  return (
    <View style={[styles.streakContainer, { backgroundColor: theme.colors.card }]}>
      <Animated.View style={[styles.fireIcon, { transform: [{ scale: fireAnimation }] }]}>
        <Text style={styles.fireEmoji}>🔥</Text>
      </Animated.View>
      <Text style={[styles.streakNumber, { color: theme.colors.primary }]}>{streakData.current}</Text>
      <Text style={[styles.streakLabel, { color: theme.colors.textSecondary }]}>day streak</Text>
      
      {streakData.freezeAvailable > 0 && (
        <View style={[styles.freezeContainer, { backgroundColor: theme.dark ? '#1E3A8A' : '#E3F2FD' }]}>
          <Text style={styles.freezeIcon}>🧊</Text>
          <Text style={[styles.freezeCount, { color: theme.dark ? '#60A5FA' : '#1976D2' }]}>{streakData.freezeAvailable}</Text>
        </View>
      )}
    </View>
  );
};

// Daily Challenges Component
export const DailyChallenges: React.FC<{ onChallengeComplete: (challenge: DailyChallenge) => void }> = ({
  onChallengeComplete,
}) => {
  const { theme } = useTheme();
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);

  useEffect(() => {
    generateDailyChallenges();
  }, []);

  const generateDailyChallenges = async () => {
    const today = new Date().toDateString();
    const storedChallenges = await AsyncStorage.getItem(`challenges_${today}`);
    
    if (storedChallenges) {
      setChallenges(JSON.parse(storedChallenges));
    } else {
      const newChallenges: DailyChallenge[] = [
        {
          id: '1',
          title: 'Morning Check-in',
          description: 'Complete your daily reflection',
          type: 'checkin',
          progress: 0,
          target: 1,
          xpReward: 25,
          completed: false,
          emoji: '🌅',
        },
        {
          id: '2',
          title: 'Goal Progress',
          description: 'Update progress on 2 goals',
          type: 'goal',
          progress: 0,
          target: 2,
          xpReward: 30,
          completed: false,
          emoji: '🎯',
        },
        {
          id: '3',
          title: 'AI Coaching',
          description: 'Chat with your AI coach',
          type: 'chat',
          progress: 0,
          target: 1,
          xpReward: 20,
          completed: false,
          emoji: '🤖',
        },
      ];
      
      setChallenges(newChallenges);
      await AsyncStorage.setItem(`challenges_${today}`, JSON.stringify(newChallenges));
    }
  };

  const completeChallenge = async (challengeId: string) => {
    const updatedChallenges = challenges.map(challenge => {
      if (challenge.id === challengeId && !challenge.completed) {
        const newProgress = Math.min(challenge.progress + 1, challenge.target);
        const completed = newProgress >= challenge.target;
        
        if (completed) {
          onChallengeComplete(challenge);
        }
        
        return { ...challenge, progress: newProgress, completed };
      }
      return challenge;
    });
    
    setChallenges(updatedChallenges);
    const today = new Date().toDateString();
    await AsyncStorage.setItem(`challenges_${today}`, JSON.stringify(updatedChallenges));
  };

  return (
    <View style={styles.challengesContainer}>
      <Text style={[styles.challengesTitle, { color: theme.colors.text }]}>Today's Challenges</Text>
      {challenges.map(challenge => (
        <TouchableOpacity
          key={challenge.id}
          style={[
            styles.challengeCard,
            { 
              backgroundColor: theme.colors.card, 
              borderColor: challenge.completed ? theme.colors.success : theme.colors.border 
            },
            challenge.completed && { backgroundColor: theme.dark ? '#0F2E13' : '#F0FFF0' },
          ]}
          onPress={() => !challenge.completed && completeChallenge(challenge.id)}
          disabled={challenge.completed}
        >
          <View style={styles.challengeContent}>
            <Text style={styles.challengeEmoji}>{challenge.emoji}</Text>
            <View style={styles.challengeInfo}>
              <Text style={[styles.challengeTitle, { color: theme.colors.text }]}>{challenge.title}</Text>
              <Text style={[styles.challengeDescription, { color: theme.colors.textSecondary }]}>{challenge.description}</Text>
              <View style={styles.challengeProgress}>
                <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
                  <View
                    style={[
                      styles.progressFill,
                      { 
                        backgroundColor: theme.colors.success,
                        width: `${(challenge.progress / challenge.target) * 100}%` 
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
                  {challenge.progress}/{challenge.target}
                </Text>
              </View>
            </View>
            <View style={styles.challengeReward}>
              <Text style={[styles.xpText, { color: theme.colors.primary }]}>+{challenge.xpReward} XP</Text>
              {challenge.completed && <Text style={styles.completedIcon}>✅</Text>}
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  // Streak Styles
  streakContainer: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  fireIcon: {
    marginBottom: 8,
  },
  fireEmoji: {
    fontSize: 48,
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  streakLabel: {
    fontSize: 16,
    marginTop: 4,
  },
  freezeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 8,
    borderRadius: 12,
  },
  freezeIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  freezeCount: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Challenges Styles
  challengesContainer: {
    padding: 20,
  },
  challengesTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  challengeCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
  },
  challengeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  challengeEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  challengeDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  challengeProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
  },
  challengeReward: {
    alignItems: 'center',
  },
  xpText: {
    fontSize: 14,
    fontWeight: '600',
  },
  completedIcon: {
    fontSize: 20,
    marginTop: 4,
  },
});
