import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { 
  updateChallengeProgress, 
  getChallengeProgress, 
  awardPodXP,
  ChallengeProgress 
} from '../lib/pod-challenges';
import { useAuth } from '../hooks/useAuth';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  totalDays: number;
  type: string;
  podId?: string;
}

const defaultChallenges: Challenge[] = [
  {
    id: 'daily-reflection',
    title: '🌟 Daily Reflection',
    description: 'Take 5 minutes to reflect on your progress',
    points: 50,
    totalDays: 7,
    type: 'daily',
  },
  {
    id: 'pod-challenge',
    title: '🫂 Pod Challenge',
    description: 'Share your biggest win with your pod',
    points: 75,
    totalDays: 1,
    type: 'social',
  },
  {
    id: 'coach-chat',
    title: '🤖 Coach Chat',
    description: 'Get personalized advice from your AI coach',
    points: 100,
    totalDays: 3,
    type: 'coaching',
  },
];

export function ChallengeCards() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const [challengeProgress, setChallengeProgress] = useState<Record<string, ChallengeProgress>>({});

  useEffect(() => {
    if (user?.id) {
      loadChallengeProgress();
    }
  }, [user?.id]);

  const loadChallengeProgress = async () => {
    if (!user?.id) return;
    
    const progressData: Record<string, ChallengeProgress> = {};
    
    for (const challenge of defaultChallenges) {
      const progress = await getChallengeProgress(user.id, challenge.id);
      if (progress) {
        progressData[challenge.id] = progress;
      }
    }
    
    setChallengeProgress(progressData);
  };

  const handleChallengePress = async (challenge: Challenge) => {
    if (!user?.id) return;

    // Check if this is a daily challenge and mark today as completed
    if (challenge.type === 'daily') {
      const today = new Date().getDate();
      const progress = await updateChallengeProgress(user.id, challenge.id, today);
      
      if (progress) {
        setChallengeProgress(prev => ({
          ...prev,
          [challenge.id]: progress
        }));
        
        Alert.alert(
          'Progress Updated! 🎉',
          `You've completed day ${progress.completed_days.length} of ${challenge.totalDays}`,
          [{ text: 'Keep Going!', style: 'default' }]
        );
      }
    }

    // Navigate to appropriate screen
    switch (challenge.type) {
      case 'daily':
        navigation.navigate('CheckIn');
        break;
      case 'social':
        navigation.navigate('Pod');
        break;
      case 'coaching':
        navigation.navigate('AICoach');
        break;
    }
  };

  const getProgressPercentage = (challengeId: string, totalDays: number): number => {
    const progress = challengeProgress[challengeId];
    if (!progress) return 0;
    return Math.min((progress.completed_days.length / totalDays) * 100, 100);
  };

  const getProgressText = (challengeId: string, totalDays: number): string => {
    const progress = challengeProgress[challengeId];
    const completed = progress?.completed_days.length || 0;
    return `${completed}/${totalDays} days`;
  };

  const isCompleted = (challengeId: string, totalDays: number): boolean => {
    const progress = challengeProgress[challengeId];
    return (progress?.completed_days.length || 0) >= totalDays;
  };

  const ProgressBar = ({ progress }: { progress: number }) => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBackground}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
    </View>
  );

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      style={styles.container}
    >
      {defaultChallenges.map((challenge) => {
        const progressPercentage = getProgressPercentage(challenge.id, challenge.totalDays);
        const progressText = getProgressText(challenge.id, challenge.totalDays);
        const completed = isCompleted(challenge.id, challenge.totalDays);
        
        return (
          <TouchableOpacity
            key={challenge.id}
            onPress={() => handleChallengePress(challenge)}
            style={[
              styles.card,
              completed && styles.completedCard
            ]}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.title}>{challenge.title}</Text>
              {completed && <Text style={styles.completedBadge}>✅</Text>}
            </View>
            
            <Text style={styles.description}>{challenge.description}</Text>
            
            <View style={styles.progressSection}>
              <Text style={styles.progressText}>{progressText}</Text>
              <ProgressBar progress={progressPercentage} />
            </View>
            
            <View style={styles.pointsContainer}>
              <Text style={styles.points}>+{challenge.points} XP</Text>
              {completed && (
                <Text style={styles.completedText}>COMPLETED</Text>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  card: {
    marginRight: 16,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    padding: 16,
    borderRadius: 16,
    width: 280,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  completedCard: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    borderColor: '#34C759',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  completedBadge: {
    fontSize: 16,
  },
  description: {
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  progressContainer: {
    height: 6,
  },
  progressBackground: {
    height: 6,
    backgroundColor: '#E5E5E7',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 3,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  points: {
    color: '#007AFF',
    fontWeight: '600',
  },
  completedText: {
    color: '#34C759',
    fontSize: 12,
    fontWeight: 'bold',
  },
}); 