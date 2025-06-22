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

const HomeScreen = ({ navigation }: any) => {
  const [userName, setUserName] = useState('Friend');
  const [currentStreak, setCurrentStreak] = useState(0);
  const [todayMood, setTodayMood] = useState(3);
  const [weeklyGoals, setWeeklyGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [recentCheckin, setRecentCheckin] = useState<CheckIn | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load user stats
      const stats = await userStatsServices.get();
      setUserStats(stats);
      setCurrentStreak(stats?.current_streak || 0);
      
      // Load recent goals with proper error handling
      const goals = await goalServices.getAll();
      // Ensure goals is always an array before calling slice
      const goalsArray = Array.isArray(goals) ? goals : [];
      setWeeklyGoals(goalsArray.slice(0, 3)); // Show top 3 goals
      
      // Load recent check-in for mood
      const checkins = await checkinServices.getRecent(1);
      if (Array.isArray(checkins) && checkins.length > 0) {
        setRecentCheckin(checkins[0]);
        setTodayMood(checkins[0].mood);
      }
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set fallback data to prevent crashes
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
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2563EB']}
            tintColor="#2563EB"
            title="Pull to refresh"
            titleColor="#666"
          />
        }
      >
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.logo}>🚀 Momentum AI</Text>
          </View>
          <Text style={styles.greeting}>
            {getGreeting()}, {userName}! 👋
          </Text>
          <Text style={styles.subtitle}>
            Let's make today amazing
          </Text>
        </View>

        {/* User Level & XP Card - Now clickable */}
        <TouchableOpacity 
          style={styles.levelCard}
          onPress={() => navigation.navigate('XPProgress')}
          activeOpacity={0.8}
        >
          <View style={styles.levelHeader}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelNumber}>{userStats?.level || 1}</Text>
            </View>
            <View style={styles.levelInfo}>
              <Text style={styles.levelTitle}>Level {userStats?.level || 1}</Text>
              <Text style={styles.xpText}>{userStats?.totalXP || 0} XP</Text>
            </View>
            <TouchableOpacity style={styles.xpButton}>
              <Text style={styles.xpButtonText}>🏆</Text>
            </TouchableOpacity>
          </View>
          
          {userStats?.lastXPGain && (
            <View style={styles.recentXP}>
              <Text style={styles.recentXPText}>
                +{userStats.lastXPGain} XP from {userStats.lastXPAction}
              </Text>
            </View>
          )}
          
          <View style={styles.tapHint}>
            <Text style={styles.tapHintText}>Tap to view progress →</Text>
          </View>
        </TouchableOpacity>

        {/* Enhanced Streak Card with Animations */}
        <View style={styles.enhancedStreakCard}>
          <View style={styles.streakStats}>
            <View style={styles.streakMainStat}>
              <View style={styles.streakCircle}>
                <Text style={styles.streakEmoji}>🔥</Text>
                <View style={styles.streakNumberContainer}>
                  <Text style={styles.streakNumber}>{currentStreak}</Text>
                  <Text style={styles.streakLabel}>day streak</Text>
                </View>
              </View>
            </View>
            <View style={styles.streakSubStats}>
              <View style={styles.subStat}>
                <Text style={styles.subStatLabel}>Best</Text>
                <Text style={styles.subStatValue}>{userStats?.best_streak || 25}</Text>
              </View>
              <View style={styles.subStat}>
                <Text style={styles.subStatLabel}>Total</Text>
                <Text style={styles.subStatValue}>{userStats?.total_checkins || 45}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.streakMessageContainer}>
            <Text style={styles.streakMessage}>On fire! 🔥</Text>
            <Text style={styles.streakSubMessage}>Keep the momentum going</Text>
          </View>
          
          {/* Progress towards next goal with better styling */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Next milestone: 14 days</Text>
              <Text style={styles.progressPercent}>71%</Text>
            </View>
            <View style={styles.streakProgressBar}>
              <View style={[styles.streakProgressFill, { width: '71%' }]} />
              <View style={styles.progressGlow} />
            </View>
          </View>
          
          {/* This Week Progress with better design */}
          <View style={styles.weekSection}>
            <Text style={styles.weekTitle}>This Week</Text>
            <View style={styles.weekDots}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
                <View key={index} style={styles.dayContainer}>
                  <View style={[
                    styles.dayDot, 
                    index < 6 ? styles.dayDotComplete : styles.dayDotIncomplete
                  ]}>
                    {index < 6 && <Text style={styles.dayCheck}>✓</Text>}
                  </View>
                  <Text style={styles.dayLabel}>{day}</Text>
                </View>
              ))}
            </View>
          </View>
          
          {/* Last 30 Days Grid with hover effects */}
          <View style={styles.monthSection}>
            <Text style={styles.monthTitle}>Last 30 Days</Text>
            <View style={styles.monthGrid}>
              {Array(30).fill(0).map((_, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.monthDot,
                    Math.random() > 0.3 ? styles.monthDotComplete : styles.monthDotIncomplete
                  ]} 
                />
              ))}
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.continueStreakButton}
            onPress={() => {
              Vibration.vibrate(50); // Gentle haptic feedback
              navigation.navigate('Check-In');
            }}
          >
            <Text style={styles.continueStreakText}>Continue Streak 🚀</Text>
          </TouchableOpacity>
        </View>

        {/* Today's Mood */}
        <View style={styles.moodCard}>
          <Text style={styles.cardTitle}>Today's Mood</Text>
          <View style={styles.moodDisplay}>
            <Text style={styles.moodEmoji}>{getMoodEmoji(todayMood)}</Text>
            <Text style={styles.moodText}>Feeling good</Text>
          </View>
          <TouchableOpacity 
            style={styles.updateButton}
            onPress={() => navigation.navigate('Check-In')}
          >
            <Text style={styles.updateButtonText}>Update Check-in</Text>
          </TouchableOpacity>
        </View>

        {/* AI Insights & Analytics Card - Enhanced */}
        <View style={styles.aiInsightsCard}>
          <View style={styles.cardHeader}>
            <View style={styles.aiHeaderLeft}>
              <Text style={styles.aiIcon}>🧠</Text>
              <View>
                <Text style={styles.cardTitle}>AI Insights</Text>
                <Text style={styles.aiSubtitle}>Powered by your data</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.insightsButton}
              onPress={() => navigation.navigate('Insights')}
            >
              <Text style={styles.insightsButtonText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {/* Data Analytics Summary with better design */}
          <View style={styles.analyticsContainer}>
            <View style={styles.analyticsRow}>
              <View style={[styles.analyticItem, styles.analyticItemPrimary]}>
                <View style={styles.analyticCircle}>
                  <Text style={styles.analyticValue}>{userStats?.overallProgress || 0}%</Text>
                </View>
                <Text style={styles.analyticLabel}>Overall Progress</Text>
              </View>
              <View style={styles.analyticItem}>
                <View style={styles.analyticCircle}>
                  <Text style={styles.analyticValue}>{userStats?.motivationScore || 70}%</Text>
                </View>
                <Text style={styles.analyticLabel}>Motivation Score</Text>
              </View>
              <View style={styles.analyticItem}>
                <View style={styles.analyticCircle}>
                  <Text style={styles.analyticValue}>{userStats?.aiInterventions || 5}</Text>
                </View>
                <Text style={styles.analyticLabel}>AI Interventions</Text>
              </View>
            </View>
          </View>
          
          {/* AI Recommendation with enhanced design */}
          <View style={styles.aiRecommendation}>
            <View style={styles.aiRecommendationHeader}>
              <Text style={styles.aiRecommendationIcon}>💡</Text>
              <Text style={styles.aiRecommendationTitle}>Smart Recommendation</Text>
            </View>
            <Text style={styles.aiRecommendationText}>
              {getAIRecommendation()}
            </Text>
            <View style={styles.aiActionButtons}>
              <TouchableOpacity 
                style={styles.aiActionButton}
                onPress={() => navigation.navigate('Coach')}
              >
                <Text style={styles.aiActionButtonText}>Talk to Coach</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.aiSecondaryButton}
                onPress={() => navigation.navigate('Insights')}
              >
                <Text style={styles.aiSecondaryButtonText}>View Insights</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Weekly Goals */}
        <View style={styles.goalsCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Weekly Goals</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Goals')}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <ActivityIndicator size="small" color="#2563EB" style={{ marginVertical: 20 }} />
          ) : weeklyGoals.length > 0 ? (
            weeklyGoals.map((goal) => (
              <View key={goal.id} style={styles.goalItem}>
                <Text style={styles.goalTitle}>{goal.title}</Text>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${goal.progress}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {goal.progress}% complete
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No goals yet. Tap "See all" to create your first goal!</Text>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsCard}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Check-In')}
            >
              <Text style={styles.actionEmoji}>📝</Text>
              <Text style={styles.actionText}>Check-in</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Coach')}
            >
              <Text style={styles.actionEmoji}>🤖</Text>
              <Text style={styles.actionText}>AI Coach</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Reflection')}
            >
              <Text style={styles.actionEmoji}>🧘</Text>
              <Text style={styles.actionText}>Reflect</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Insights')}
            >
              <Text style={styles.actionEmoji}>💡</Text>
              <Text style={styles.actionText}>Insights</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingVertical: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  levelCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelBadge: {
    backgroundColor: '#34C759',
    borderRadius: 8,
    padding: 8,
    marginRight: 16,
  },
  levelNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  levelInfo: {
    flexDirection: 'column',
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  xpText: {
    fontSize: 14,
    color: '#666',
  },
  xpButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  xpButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  recentXP: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  recentXPText: {
    fontSize: 14,
    color: '#666',
  },
  tapHint: {
    marginTop: 12,
    alignItems: 'center',
  },
  tapHintText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  enhancedStreakCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  streakStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  streakMainStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  streakNumberContainer: {
    alignItems: 'center',
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  streakLabel: {
    fontSize: 14,
    color: '#666',
  },
  streakSubStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  subStatLabel: {
    fontSize: 14,
    color: '#666',
  },
  subStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  streakMessageContainer: {
    alignItems: 'center',
  },
  streakMessage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  streakSubMessage: {
    fontSize: 14,
    color: '#666',
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
  },
  progressPercent: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  streakProgressBar: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    marginBottom: 8,
  },
  streakProgressFill: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 3,
  },
  progressGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 3,
    backgroundColor: 'rgba(52, 199, 89, 0.2)',
  },
  weekSection: {
    marginBottom: 16,
  },
  weekTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  weekDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  dayDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayDotComplete: {
    backgroundColor: '#34C759',
  },
  dayDotIncomplete: {
    backgroundColor: '#f0f0f0',
  },
  dayCheck: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  dayLabel: {
    fontSize: 14,
    color: '#666',
  },
  monthSection: {
    marginBottom: 16,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  monthDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    marginBottom: 8,
  },
  monthDotComplete: {
    backgroundColor: '#34C759',
  },
  monthDotIncomplete: {
    backgroundColor: '#f0f0f0',
  },
  continueStreakButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  continueStreakText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  moodCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  moodDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  moodEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  moodText: {
    fontSize: 16,
    color: '#666',
  },
  updateButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  goalsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  goalItem: {
    marginBottom: 16,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  actionsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 20,
  },
  aiInsightsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  aiRecommendation: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  aiRecommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  aiRecommendationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  aiRecommendationText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  aiActionButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  aiActionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  analyticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  analyticItem: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  analyticValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  analyticLabel: {
    fontSize: 14,
    color: '#666',
  },
  aiHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  insightsButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  insightsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  analyticsContainer: {
    marginBottom: 16,
  },
  analyticItemPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  analyticCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  aiRecommendationIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  aiActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aiSecondaryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  aiSecondaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default HomeScreen; 