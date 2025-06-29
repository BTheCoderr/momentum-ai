import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { levelFromXP, xpForNextLevel } from '../lib/services';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function XPProgressScreen({ navigation }: any) {
  const [userStats, setUserStats] = useState<any>(null);
  const [animatedXP] = useState(new Animated.Value(0));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Mock data for now - in real app, fetch from API
      const mockStats = {
        totalXP: 350,
        level: levelFromXP(350),
        lastXPGain: 50,
        lastXPAction: 'Daily Check-in',
        achievements: [
          { id: 1, name: 'First Steps', description: 'Complete your first check-in', unlocked: true, icon: '🎯' },
          { id: 2, name: 'Streak Master', description: 'Maintain a 7-day streak', unlocked: true, icon: '🔥' },
          { id: 3, name: 'Goal Getter', description: 'Create your first goal', unlocked: true, icon: '⭐' },
          { id: 4, name: 'Reflection Pro', description: 'Complete 5 reflections', unlocked: false, icon: '🧘' },
          { id: 5, name: 'Level 5', description: 'Reach level 5', unlocked: false, icon: '👑' },
        ]
      };
      
      setUserStats(mockStats);
      
      // Animate XP bar
      const currentLevel = mockStats.level;
      const nextLevelXP = xpForNextLevel(currentLevel);
      const previousLevelXP = currentLevel > 1 ? xpForNextLevel(currentLevel - 1) : 0;
      const progress = (mockStats.totalXP - previousLevelXP) / (nextLevelXP - previousLevelXP);
      
      Animated.timing(animatedXP, {
        toValue: progress,
        duration: 1500,
        useNativeDriver: false,
      }).start();
      
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !userStats) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your progress...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentLevel = userStats.level;
  const nextLevelXP = xpForNextLevel(currentLevel);
  const previousLevelXP = currentLevel > 1 ? xpForNextLevel(currentLevel - 1) : 0;
  const xpInCurrentLevel = userStats.totalXP - previousLevelXP;
  const xpNeededForCurrentLevel = nextLevelXP - previousLevelXP;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Progress</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Level Badge */}
        <View style={styles.levelSection}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelEmoji}>🏆</Text>
            <Text style={styles.levelNumber}>{currentLevel}</Text>
          </View>
          <Text style={styles.levelTitle}>Level {currentLevel}</Text>
          <Text style={styles.totalXPText}>{userStats.totalXP} Total XP</Text>
        </View>

        {/* XP Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress to Level {currentLevel + 1}</Text>
            <Text style={styles.progressNumbers}>
              {xpInCurrentLevel} / {xpNeededForCurrentLevel} XP
            </Text>
          </View>
          
          <View style={styles.progressBarContainer}>
            <Animated.View 
              style={[
                styles.progressBar,
                {
                  width: animatedXP.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                }
              ]} 
            />
          </View>
          
          <Text style={styles.xpNeeded}>
            {xpNeededForCurrentLevel - xpInCurrentLevel} XP to next level
          </Text>
        </View>

        {/* Recent Activity */}
        {userStats.lastXPGain && (
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.recentItem}>
              <Text style={styles.recentEmoji}>✨</Text>
              <View style={styles.recentInfo}>
                <Text style={styles.recentAction}>{userStats.lastXPAction}</Text>
                <Text style={styles.recentXP}>+{userStats.lastXPGain} XP</Text>
              </View>
            </View>
          </View>
        )}

        {/* Achievements */}
        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementsGrid}>
            {userStats.achievements.map((achievement: any) => (
              <View 
                key={achievement.id} 
                style={[
                  styles.achievementCard,
                  achievement.unlocked ? styles.achievementUnlocked : styles.achievementLocked
                ]}
              >
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                <Text style={styles.achievementName}>{achievement.name}</Text>
                <Text style={styles.achievementDescription}>{achievement.description}</Text>
                {achievement.unlocked && (
                  <View style={styles.unlockedBadge}>
                    <Text style={styles.unlockedText}>✓</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* XP Earning Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Earn More XP</Text>
          <View style={styles.tipItem}>
            <Text style={styles.tipEmoji}>📝</Text>
            <Text style={styles.tipText}>Daily Check-in: +10-60 XP</Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipEmoji}>🎯</Text>
            <Text style={styles.tipText}>Create Goal: +25 XP</Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipEmoji}>🏆</Text>
            <Text style={styles.tipText}>Complete Goal: +100 XP</Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipEmoji}>🧘</Text>
            <Text style={styles.tipText}>Reflection: +50 XP</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  placeholder: {
    width: 60,
  },
  levelSection: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#fff',
  },
  levelBadge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  levelEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  levelNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  levelTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  totalXPText: {
    fontSize: 16,
    color: '#666',
  },
  progressSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  progressNumbers: {
    fontSize: 14,
    color: '#666',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 6,
  },
  xpNeeded: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  recentSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  recentEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  recentInfo: {
    flex: 1,
  },
  recentAction: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  recentXP: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '600',
  },
  achievementsSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 16,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementCard: {
    width: (width - 60) / 2,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    position: 'relative',
  },
  achievementUnlocked: {
    backgroundColor: '#e8f5e8',
    borderWidth: 2,
    borderColor: '#34C759',
  },
  achievementLocked: {
    backgroundColor: '#f0f0f0',
    opacity: 0.6,
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  unlockedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unlockedText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  tipsSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 16,
    marginBottom: 20,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipEmoji: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
  },
  tipText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
}); 