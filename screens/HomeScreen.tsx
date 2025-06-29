import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  Vibration,
  RefreshControl,
} from 'react-native';
import { goalServices, userStatsServices, checkinServices, utils, UserStats, CheckIn } from '../lib/services';
import { Goal } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AnalysisScreen from './AnalysisScreen';
import { EnergyFlow } from '../components/EnergyFlow';
import { StreakDisplay } from '../components/DuolingoStyleFeatures';
import { useGamification } from '../hooks/useGamification';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

type RootStackParamList = {
  Auth: undefined;
  XPProgress: undefined;
  Goals: undefined;
};

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [userName, setUserName] = useState('Friend');
  const [currentStreak, setCurrentStreak] = useState(0);
  const [todayMood, setTodayMood] = useState(3);
  const [weeklyGoals, setWeeklyGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [recentCheckin, setRecentCheckin] = useState<CheckIn | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  useEffect(() => {
    checkAuthStatus();
    loadDashboardData();
    const checkUserData = async () => {
      try {
        const stats = await userStatsServices.get();
        // Only show analysis if user has previous data
        setShowAnalysis(stats && stats.total_checkins > 0);
      } catch (error) {
        console.log('Error checking user data:', error);
        setShowAnalysis(false);
      }
    };
    
    checkUserData();
    checkTodaysCheckin();
  }, []);

  const checkAuthStatus = async () => {
    const session = await supabase.auth.getSession();
    if (!session.data.session) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load data with retry mechanism
      const loadDataWithRetry = async (fetchFn: () => Promise<any>, errorMsg: string) => {
        for (let i = 0; i < MAX_RETRIES; i++) {
          try {
            return await fetchFn();
          } catch (err) {
            console.error(`${errorMsg} (Attempt ${i + 1}/${MAX_RETRIES}):`, err);
            if (i === MAX_RETRIES - 1) throw err;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
          }
        }
      };

      // Load all data in parallel with retry
      const [stats, goals, checkins] = await Promise.all([
        loadDataWithRetry(() => userStatsServices.get(), 'Error fetching user stats'),
        loadDataWithRetry(() => goalServices.getAll(), 'Error fetching goals'),
        loadDataWithRetry(() => checkinServices.getRecent(1), 'Error fetching checkins'),
      ]);

      setUserStats(stats);
      setCurrentStreak(stats?.current_streak || 0);
      setWeeklyGoals(Array.isArray(goals) ? goals.slice(0, 3) : []);
      
      if (Array.isArray(checkins) && checkins.length > 0) {
        setRecentCheckin(checkins[0]);
        setTodayMood(checkins[0].mood);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load data. Please check your internet connection and try again.');
      
      // Set fallback data
      setWeeklyGoals([]);
      setUserStats({
        current_streak: 0,
        best_streak: 0,
        total_checkins: 0,
        total_goals: 0,
        overallProgress: 0,
        activeGoals: 0,
        motivationScore: 70,
        level: 1,
        totalXP: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getMoodEmoji = (mood: number) => {
    const emojis = ['😔', '😕', '😐', '🙂', '😊'];
    return emojis[mood - 1] || '😐';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getAIRecommendation = () => {
    if (!userStats) {
      return "Start your journey by setting your first goal and completing a daily check-in!";
    }

    const overallProgress = userStats.overallProgress || 0;
    const activeGoals = userStats.activeGoals || 0;
    const motivationScore = userStats.motivationScore || 70;
    const totalGoals = userStats.totalGoals || 0;
    
    // AI-powered recommendation logic based on user data
    if (currentStreak === 0) {
      return "🎯 Time to restart your momentum! Complete a check-in today to begin a new streak.";
    }
    
    if (currentStreak >= 7) {
      return "🔥 Amazing streak! You're in the top 20% of users. Consider setting a more challenging goal.";
    }
    
    if (overallProgress < 30 && activeGoals > 0) {
      return "💡 Focus on one goal at a time. Research shows 23% higher success rates with focused effort.";
    }
    
    if (motivationScore < 60) {
      return "🌟 Your motivation seems low. Try the reflection exercise or chat with your AI coach for a boost.";
    }
    
    if (activeGoals === 0) {
      return "🎯 Ready to level up? Set your first goal and let AI help you create an action plan.";
    }
    
    if (overallProgress > 70) {
      return "🚀 You're crushing it! Time to set new ambitious goals and maintain this momentum.";
    }
    
    // Default recommendation
    return "📊 Based on your patterns, consistency is key. Keep up your daily check-ins for optimal results.";
  };

  const checkTodaysCheckin = async () => {
    try {
      const recentCheckins = await checkinServices.getRecent(1);
      const today = new Date().toISOString().split('T')[0];
      setHasCheckedInToday(
        recentCheckins.length > 0 && 
        recentCheckins[0].date === today
      );
    } catch (error) {
      console.error('Error checking today\'s checkin:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      // Clear local storage
      await AsyncStorage.clear();
      // Reset navigation to Auth screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  if (showAnalysis) {
    return <AnalysisScreen />;
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading your dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadDashboardData}
            colors={['#2563EB']}
            tintColor="#2563EB"
            title="Pull to refresh"
            titleColor="#666"
          />
        }
      >
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={loadDashboardData}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {!hasCheckedInToday && (
              <View style={styles.section}>
                <EnergyFlow onComplete={() => {
                  setHasCheckedInToday(true);
                  loadDashboardData();
                }} />
              </View>
            )}
            
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <Text style={styles.logo}>🚀 Momentum AI</Text>
              </View>
              <Text style={styles.greeting}>
                {getGreeting()}, {userName}!
              </Text>
            </View>

            {/* Energy Check-in */}
            {!hasCheckedInToday && (
              <View style={styles.section}>
                <EnergyFlow onComplete={() => {
                  setHasCheckedInToday(true);
                  loadDashboardData();
                }} />
              </View>
            )}

            {/* Progress Summary */}
            {hasCheckedInToday && (
              <View style={styles.section}>
                <View style={styles.streakCard}>
                  <Text style={styles.streakTitle}>Current Streak</Text>
                  <Text style={styles.streakCount}>{currentStreak} days</Text>
                  <Text style={styles.streakEmoji}>🔥</Text>
                </View>
                
                {recentCheckin && (
                  <View style={styles.moodCard}>
                    <Text style={styles.moodTitle}>Today's Energy</Text>
                    <Text style={styles.moodEmoji}>
                      {recentCheckin.energy === 3 ? '🔥' : recentCheckin.energy === 2 ? '⚡️' : '🌱'}
                    </Text>
                    <Text style={styles.moodLevel}>
                      {recentCheckin.energy === 3 ? 'High' : recentCheckin.energy === 2 ? 'Medium' : 'Low'}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* User Level & XP Card */}
            <TouchableOpacity 
              style={styles.levelCard}
              onPress={() => navigation.navigate('XPProgress')}
              activeOpacity={0.8}
            >
              <View style={styles.levelInfo}>
                <Text style={styles.levelTitle}>Level {userStats?.level || 1}</Text>
                <Text style={styles.xpText}>{userStats?.totalXP || 0} XP</Text>
              </View>
              <Text style={styles.levelEmoji}>⚡️</Text>
            </TouchableOpacity>

            {/* AI Recommendation */}
            <View style={styles.aiCard}>
              <Text style={styles.aiTitle}>AI Coach Insight</Text>
              <Text style={styles.aiText}>{getAIRecommendation()}</Text>
            </View>

            {/* Weekly Goals */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Weekly Goals</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Goals')}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              {weeklyGoals.length === 0 ? (
                <TouchableOpacity 
                  style={styles.emptyGoals}
                  onPress={() => navigation.navigate('Goals')}
                >
                  <Text style={styles.emptyGoalsEmoji}>🎯</Text>
                  <Text style={styles.emptyGoalsText}>Set your first goal</Text>
                </TouchableOpacity>
              ) : (
                weeklyGoals.map((goal) => (
                  <View key={goal.id} style={styles.goalCard}>
                    <View style={styles.goalInfo}>
                      <Text style={styles.goalTitle}>{goal.title}</Text>
                      <View style={styles.goalProgress}>
                        <View style={[styles.progressBar, { width: `${goal.progress}%` }]} />
                      </View>
                      <Text style={styles.progressText}>{goal.progress}% Complete</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  section: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  streakCard: {
    alignItems: 'center',
    marginBottom: 20,
  },
  streakTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  streakCount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  streakEmoji: {
    fontSize: 24,
    marginTop: 5,
  },
  moodCard: {
    alignItems: 'center',
  },
  moodTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 5,
  },
  moodLevel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  levelCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  xpText: {
    fontSize: 16,
    color: '#666',
  },
  levelEmoji: {
    fontSize: 24,
  },
  aiCard: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  aiTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  aiText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  seeAllText: {
    fontSize: 16,
    color: '#2563EB',
  },
  emptyGoals: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
  },
  emptyGoalsEmoji: {
    fontSize: 32,
    marginBottom: 10,
  },
  emptyGoalsText: {
    fontSize: 16,
    color: '#666',
  },
  goalCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  goalProgress: {
    height: 6,
    backgroundColor: '#e9ecef',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 5,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen; 