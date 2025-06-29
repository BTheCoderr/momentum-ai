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
    <View style={styles.streakContainer}>
      <Animated.View style={[styles.fireIcon, { transform: [{ scale: fireAnimation }] }]}>
        <Text style={styles.fireEmoji}>🔥</Text>
      </Animated.View>
      <Text style={styles.streakNumber}>{streakData.current}</Text>
      <Text style={styles.streakLabel}>day streak</Text>
      
      {streakData.freezeAvailable > 0 && (
        <View style={styles.freezeContainer}>
          <Text style={styles.freezeIcon}>🧊</Text>
          <Text style={styles.freezeCount}>{streakData.freezeAvailable}</Text>
        </View>
      )}
    </View>
  );
};

// Daily Challenges Component
export const DailyChallenges: React.FC<{ onChallengeComplete: (challenge: DailyChallenge) => void }> = ({
  onChallengeComplete,
}) => {
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
      <Text style={styles.challengesTitle}>Today's Challenges</Text>
      {challenges.map(challenge => (
        <TouchableOpacity
          key={challenge.id}
          style={[
            styles.challengeCard,
            challenge.completed && styles.challengeCompleted,
          ]}
          onPress={() => !challenge.completed && completeChallenge(challenge.id)}
          disabled={challenge.completed}
        >
          <View style={styles.challengeContent}>
            <Text style={styles.challengeEmoji}>{challenge.emoji}</Text>
            <View style={styles.challengeInfo}>
              <Text style={styles.challengeTitle}>{challenge.title}</Text>
              <Text style={styles.challengeDescription}>{challenge.description}</Text>
              <View style={styles.challengeProgress}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${(challenge.progress / challenge.target) * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {challenge.progress}/{challenge.target}
                </Text>
              </View>
            </View>
            <View style={styles.challengeReward}>
              <Text style={styles.xpText}>+{challenge.xpReward} XP</Text>
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
    backgroundColor: '#FFF',
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
    color: '#FF6B35',
  },
  streakLabel: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  freezeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 8,
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
  },
  freezeIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  freezeCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
  },

  // Challenges Styles
  challengesContainer: {
    padding: 20,
  },
  challengesTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  challengeCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E5E5E5',
  },
  challengeCompleted: {
    borderColor: '#58CC02',
    backgroundColor: '#F0FFF0',
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
    color: '#333',
  },
  challengeDescription: {
    fontSize: 14,
    color: '#666',
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
    backgroundColor: '#E5E5E5',
    borderRadius: 3,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#58CC02',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
  challengeReward: {
    alignItems: 'center',
  },
  xpText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
  },
  completedIcon: {
    fontSize: 20,
    marginTop: 4,
  },
});
