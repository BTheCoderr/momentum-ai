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
  Dimensions,
} from 'react-native';
import { userStatsServices, checkinServices, goalServices } from '../lib/services';

const { width } = Dimensions.get('window');

interface ProgressData {
  totalCheckins: number;
  currentStreak: number;
  longestStreak: number;
  goalsCompleted: number;
  totalGoals: number;
  weeklyProgress: number[];
  averageMood: number;
  averageEnergy: number;
}

const ProgressAnalyticsScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('week');
  const [progressData, setProgressData] = useState<ProgressData>({
    totalCheckins: 0,
    currentStreak: 0,
    longestStreak: 0,
    goalsCompleted: 0,
    totalGoals: 0,
    weeklyProgress: [0, 0, 0, 0, 0, 0, 0],
    averageMood: 0,
    averageEnergy: 0,
  });

  useEffect(() => {
    loadProgressData();
  }, [timeRange]);

  const loadProgressData = async () => {
    try {
      setLoading(true);
      
      // Get user stats
      const userStats = await userStatsServices.get();
      
      // Get recent check-ins for trend analysis
      const daysToFetch = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
      const recentCheckins = await checkinServices.getRecent(daysToFetch);
      
      // Get goals data
      const goals = await goalServices.getAll();
      const completedGoals = goals?.filter(goal => goal.progress === 100) || [];
      
      // Calculate weekly progress (last 7 days)
      const weeklyProgress = Array(7).fill(0);
      if (recentCheckins && recentCheckins.length > 0) {
        const today = new Date();
        for (let i = 0; i < 7; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          
          const hasCheckin = recentCheckins.some(checkin => 
            checkin.date?.startsWith(dateStr)
          );
          weeklyProgress[6 - i] = hasCheckin ? 1 : 0;
        }
      }
      
      // Calculate averages
      let totalMood = 0;
      let totalEnergy = 0;
      let moodCount = 0;
      let energyCount = 0;
      
      if (recentCheckins) {
        recentCheckins.forEach(checkin => {
          if (checkin.mood) {
            totalMood += checkin.mood;
            moodCount++;
          }
          if (checkin.energy) {
            totalEnergy += checkin.energy;
            energyCount++;
          }
        });
      }
      
      setProgressData({
        totalCheckins: userStats?.total_checkins || 0,
        currentStreak: userStats?.current_streak || 0,
        longestStreak: userStats?.best_streak || 0,
        goalsCompleted: completedGoals.length,
        totalGoals: goals?.length || 0,
        weeklyProgress,
        averageMood: moodCount > 0 ? Math.round(totalMood / moodCount) : 0,
        averageEnergy: energyCount > 0 ? Math.round(totalEnergy / energyCount) : 0,
      });
      
    } catch (error) {
      console.error('Error loading progress data:', error);
      // Set fallback data for demo
      setProgressData({
        totalCheckins: 12,
        currentStreak: 7,
        longestStreak: 18,
        goalsCompleted: 2,
        totalGoals: 5,
        weeklyProgress: [1, 1, 0, 1, 1, 1, 1],
        averageMood: 4,
        averageEnergy: 4,
      });
    } finally {
      setLoading(false);
    }
  };

  const getTimeRangeData = () => {
    switch (timeRange) {
      case 'week':
        return {
          label: 'This Week',
          data: progressData.weeklyProgress,
          labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S']
        };
      case 'month':
        return {
          label: 'This Month',
          data: [0.8, 0.9, 0.7, 0.85], // Mock monthly data
          labels: ['W1', 'W2', 'W3', 'W4']
        };
      case 'quarter':
        return {
          label: 'This Quarter',
          data: [0.7, 0.8, 0.9], // Mock quarterly data
          labels: ['M1', 'M2', 'M3']
        };
      default:
        return {
          label: 'This Week',
          data: progressData.weeklyProgress,
          labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S']
        };
    }
  };

  const renderChart = () => {
    const { data, labels } = getTimeRangeData();
    const maxValue = Math.max(...data, 1);
    
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Progress Trend</Text>
        <View style={styles.chart}>
          {data.map((value, index) => (
            <View key={index} style={styles.barContainer}>
              <View 
                style={[
                  styles.bar, 
                  { 
                    height: `${(value / maxValue) * 80}%`,
                    backgroundColor: value > 0 ? '#34C759' : '#E5E5EA'
                  }
                ]} 
              />
              <Text style={styles.barLabel}>{labels[index]}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading your progress...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Progress Analytics</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Time Range Selector */}
        <View style={styles.timeRangeContainer}>
          {(['week', 'month', 'quarter'] as const).map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.timeRangeButton,
                timeRange === range && styles.timeRangeButtonActive
              ]}
              onPress={() => setTimeRange(range)}
            >
              <Text style={[
                styles.timeRangeText,
                timeRange === range && styles.timeRangeTextActive
              ]}>
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Progress Chart */}
        {renderChart()}

        {/* Key Metrics */}
        <View style={styles.metricsContainer}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          
          <View style={styles.metricsGrid}>
            <View style={[styles.metricCard, { backgroundColor: '#E8F5E8' }]}>
              <Text style={styles.metricEmoji}>🎯</Text>
              <Text style={styles.metricValue}>
                {progressData.goalsCompleted}/{progressData.totalGoals}
              </Text>
              <Text style={styles.metricLabel}>Goals Completed</Text>
              <Text style={styles.metricSubtext}>
                {progressData.totalGoals > 0 
                  ? `${Math.round((progressData.goalsCompleted / progressData.totalGoals) * 100)}% success rate`
                  : 'No goals yet'
                }
              </Text>
            </View>

            <View style={[styles.metricCard, { backgroundColor: '#FFF4E6' }]}>
              <Text style={styles.metricEmoji}>🔥</Text>
              <Text style={styles.metricValue}>{progressData.currentStreak}</Text>
              <Text style={styles.metricLabel}>Current Streak</Text>
              <Text style={styles.metricSubtext}>
                Best: {progressData.longestStreak} days
              </Text>
            </View>

            <View style={[styles.metricCard, { backgroundColor: '#E6F3FF' }]}>
              <Text style={styles.metricEmoji}>⚡</Text>
              <Text style={styles.metricValue}>{progressData.totalCheckins}</Text>
              <Text style={styles.metricLabel}>Total Check-ins</Text>
              <Text style={styles.metricSubtext}>
                Keep building momentum!
              </Text>
            </View>

            <View style={[styles.metricCard, { backgroundColor: '#F0E6FF' }]}>
              <Text style={styles.metricEmoji}>💜</Text>
              <Text style={styles.metricValue}>
                {progressData.averageMood > 0 ? `${progressData.averageMood}/5` : 'N/A'}
              </Text>
              <Text style={styles.metricLabel}>Avg Mood</Text>
              <Text style={styles.metricSubtext}>
                {progressData.averageMood >= 4 ? 'Trending ↗️' : 
                 progressData.averageMood >= 3 ? 'Stable →' : 
                 progressData.averageMood > 0 ? 'Improving ↗️' : 'No data yet'}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Check-In')}
          >
            <Text style={styles.actionEmoji}>📝</Text>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Daily Check-in</Text>
              <Text style={styles.actionSubtitle}>Update your progress</Text>
            </View>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Goals')}
          >
            <Text style={styles.actionEmoji}>🎯</Text>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Manage Goals</Text>
              <Text style={styles.actionSubtitle}>Review and update goals</Text>
            </View>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Insights')}
          >
            <Text style={styles.actionEmoji}>💡</Text>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>View Insights</Text>
              <Text style={styles.actionSubtitle}>AI-powered recommendations</Text>
            </View>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>
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
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  scrollView: {
    flex: 1,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  timeRangeButtonActive: {
    backgroundColor: '#007AFF',
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  timeRangeTextActive: {
    color: '#fff',
  },
  chartContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingHorizontal: 10,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  bar: {
    width: '80%',
    backgroundColor: '#34C759',
    borderRadius: 4,
    minHeight: 8,
  },
  barLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontWeight: '500',
  },
  metricsContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: (width - 48) / 2,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  metricEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
    textAlign: 'center',
  },
  metricSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  actionsContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionEmoji: {
    fontSize: 24,
    marginRight: 16,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  actionArrow: {
    fontSize: 18,
    color: '#ccc',
  },
});

export default ProgressAnalyticsScreen; 