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
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { useTheme } from '../components/ThemeProvider';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface AnalyticsData {
  checkInStreak: number;
  totalCheckIns: number;
  averageMood: number;
  averageEnergy: number;
  completedGoals: number;
  activeGoals: number;
  xpGained: number;
  moodTrend: number[];
  energyTrend: number[];
  weeklyProgress: number[];
}

export const ProgressAnalyticsScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    checkInStreak: 0,
    totalCheckIns: 0,
    averageMood: 0,
    averageEnergy: 0,
    completedGoals: 0,
    activeGoals: 0,
    xpGained: 0,
    moodTrend: [],
    energyTrend: [],
    weeklyProgress: [],
  });
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No user found');

      // Get user's check-ins
      const { data: checkIns, error: checkInsError } = await supabase
        .from('checkins')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (checkInsError) throw checkInsError;

      // Get user's goals
      const { data: goals, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id);

      if (goalsError) throw goalsError;

      // Calculate analytics
      const activeGoals = goals?.filter(g => g.status === 'active').length || 0;
      const completedGoals = goals?.filter(g => g.status === 'completed').length || 0;

      const moodTrend = checkIns?.slice(0, 7).map(c => c.mood).reverse() || [];
      const energyTrend = checkIns?.slice(0, 7).map(c => c.energy).reverse() || [];
      const weeklyProgress = Array(7).fill(0).map((_, i) => {
        const dayCheckIns = checkIns?.filter(c => {
          const date = new Date(c.created_at);
          return date.getDay() === i;
        });
        return dayCheckIns?.length || 0;
      });

      setAnalytics({
        checkInStreak: checkIns?.[0]?.streak || 0,
        totalCheckIns: checkIns?.length || 0,
        averageMood: moodTrend.reduce((a, b) => a + b, 0) / moodTrend.length || 0,
        averageEnergy: energyTrend.reduce((a, b) => a + b, 0) / energyTrend.length || 0,
        completedGoals,
        activeGoals,
        xpGained: checkIns?.reduce((total, c) => total + (c.xp_gained || 0), 0) || 0,
        moodTrend,
        energyTrend,
        weeklyProgress,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
      Alert.alert('Error', 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle }: { title: string, value: string | number, subtitle?: string }) => (
    <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
      <Text style={[styles.statTitle, { color: theme.colors.textSecondary }]}>{title}</Text>
      <Text style={[styles.statValue, { color: theme.colors.text }]}>{value}</Text>
      {subtitle && <Text style={[styles.statSubtitle, { color: theme.colors.textSecondary }]}>{subtitle}</Text>}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backButton, { backgroundColor: theme.colors.card }]}
        >
          <Text style={[styles.backButtonText, { color: theme.colors.text }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Progress Analytics</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Time Range Selector */}
        <View style={[styles.timeRangeContainer, { backgroundColor: theme.colors.border }]}>
          {['week', 'month', 'year'].map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.timeRangeButton,
                timeRange === range && [styles.timeRangeButtonActive, { backgroundColor: theme.colors.card }]
              ]}
              onPress={() => setTimeRange(range as 'week' | 'month' | 'year')}
            >
              <Text style={[
                styles.timeRangeText,
                { color: theme.colors.textSecondary },
                timeRange === range && { color: theme.colors.primary }
              ]}>
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Key Stats */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Check-in Streak"
            value={`${analytics.checkInStreak} days`}
            subtitle="Keep it up! 🔥"
          />
          <StatCard
            title="Total XP"
            value={analytics.xpGained}
            subtitle="Points earned"
          />
          <StatCard
            title="Goals"
            value={`${analytics.completedGoals}/${analytics.activeGoals + analytics.completedGoals}`}
            subtitle="Completed"
          />
          <StatCard
            title="Avg. Mood"
            value={analytics.averageMood.toFixed(1)}
            subtitle="Out of 5"
          />
        </View>

        {/* Mood & Energy Trends */}
        <View style={[styles.chartSection, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.chartTitle, { color: theme.colors.text }]}>Mood & Energy Trends</Text>
          <LineChart
            data={{
              labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              datasets: [
                {
                  data: analytics.moodTrend,
                  color: () => theme.colors.primary,
                },
                {
                  data: analytics.energyTrend,
                  color: () => theme.colors.success,
                },
              ],
            }}
            width={width - 32}
            height={220}
            chartConfig={{
              backgroundColor: theme.colors.card,
              backgroundGradientFrom: theme.colors.card,
              backgroundGradientTo: theme.colors.card,
              decimalPlaces: 1,
              color: () => theme.colors.text,
              labelColor: () => theme.colors.textSecondary,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: theme.colors.background,
              },
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: theme.colors.primary }]} />
              <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Mood</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: theme.colors.success }]} />
              <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Energy</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    borderRadius: 12,
    padding: 4,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  timeRangeButtonActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
  },
  chartSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
  },
});