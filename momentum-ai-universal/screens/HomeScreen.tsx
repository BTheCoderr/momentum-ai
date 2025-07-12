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
import { goalServices, userStatsServices, checkinServices, userProfileServices, utils, UserStats, CheckIn } from '../lib/services';
import { Goal } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AnalysisScreen from './AnalysisScreen';
import { EnergyFlow } from '../components/EnergyFlow';
import { StreakDisplay } from '../components/DuolingoStyleFeatures';
import { useGamification } from '../hooks/useGamification';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { styles } from '../styles/HomeScreen.styles';

type RootStackParamList = {
  Auth: undefined;
  XPProgress: undefined;
  Goals: undefined;
};

interface UserStats {
  totalCheckins: number;
  totalGoals: number;
  currentStreak: number;
}

declare global {
  interface Window {
    handleSignOut?: () => void;
  }
}

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [userName, setUserName] = useState('Friend');
  const [currentStreak, setCurrentStreak] = useState(0);
  const [todayMood, setTodayMood] = useState(3);
  const [weeklyGoals, setWeeklyGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState<UserStats>({
    totalCheckins: 0,
    totalGoals: 0,
    currentStreak: 0
  });
  const [recentCheckin, setRecentCheckin] = useState<CheckIn | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  useEffect(() => {
    loadUserData();
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

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Handle not authenticated
        if (global.handleSignOut) {
          global.handleSignOut();
        }
        return;
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setUserName(profile.full_name || profile.email?.split('@')[0] || 'Friend');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Failed to load user data');
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user');
      }

      // Get user stats
      const { data: stats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (stats) {
        setUserStats({
          totalCheckins: stats.total_checkins || 0,
          totalGoals: stats.total_goals || 0,
          currentStreak: stats.streak_count || 0,
        });
        setCurrentStreak(stats.streak_count || 0);
      }

      // Get weekly goals
      const { data: goals } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (goals) {
        setWeeklyGoals(goals);
      }

      // Get recent checkin
      const { data: checkins } = await supabase
        .from('checkins')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(1);

      if (checkins && checkins.length > 0) {
        setRecentCheckin(checkins[0]);
        setTodayMood(checkins[0].mood);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data');
      
      // Retry logic
      if (retryCount < MAX_RETRIES) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          loadDashboardData();
        }, 2000 * (retryCount + 1)); // Exponential backoff
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const checkTodaysCheckin = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      const { data: checkins } = await supabase
        .from('checkins')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .limit(1);

      setHasCheckedInToday(checkins && checkins.length > 0);
    } catch (error) {
      console.error('Error checking today\'s checkin:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
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

    const overallProgress = userStats.totalCheckins || 0;
    const activeGoals = userStats.totalGoals || 0;
    const motivationScore = userStats.currentStreak || 70;
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

  const handleSignOut = async () => {
    try {
      // Clear local storage
      await AsyncStorage.clear();
      
      // Use the global sign out function from App.tsx
      // @ts-ignore
      if (global.handleSignOut) {
        // @ts-ignore
        global.handleSignOut();
      } else {
        Alert.alert('Error', 'Sign out failed. Please restart the app.');
      }
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  if (showAnalysis) {
    return <AnalysisScreen />;
  }

  if (loading) {
    return null;
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
            onRefresh={handleRefresh}
            colors={['#FF6B35']}
            tintColor="#FF6B35"
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
                <Text style={styles.levelTitle}>Level {userStats?.currentStreak || 1}</Text>
                <Text style={styles.xpText}>{userStats?.totalCheckins || 0} XP</Text>
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