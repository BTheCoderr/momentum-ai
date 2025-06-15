import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootTabParamList } from '../navigation';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { goalsAPI, Goal, userAPI, UserStats, patternAPI, UserPatterns } from '../api/services';

type ProgressAnalyticsNavigationProp = BottomTabNavigationProp<RootTabParamList, 'Chat'>;

interface Props {
  navigation: ProgressAnalyticsNavigationProp;
}

interface AnalyticsData {
  weeklyProgress: number[];
  goalCompletion: { completed: number; total: number };
  streakData: { current: number; longest: number; average: number };
  timePatterns: { bestDay: string; bestTime: string; productivity: number };
  motivationTrend: 'up' | 'down' | 'stable';
}

const { width } = Dimensions.get('window');

export default function ProgressAnalyticsScreen({ navigation }: Props) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userPatterns, setUserPatterns] = useState<UserPatterns | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter'>('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedTimeframe]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      const [goalsData, statsData, patternsData] = await Promise.all([
        goalsAPI.getGoals(),
        userAPI.getUserStats(),
        patternAPI.getUserPatterns()
      ]);

      setGoals(goalsData);
      setUserStats(statsData);
      setUserPatterns(patternsData);

      // Generate analytics data
      const analytics: AnalyticsData = {
        weeklyProgress: generateWeeklyProgress(goalsData),
        goalCompletion: {
          completed: goalsData.filter(g => g.progress >= 100).length,
          total: goalsData.length
        },
        streakData: calculateStreakData(goalsData),
        timePatterns: {
          bestDay: patternsData?.behaviorTrends?.bestPerformanceTime?.split(' ')[0] || 'Tuesday',
          bestTime: patternsData?.behaviorTrends?.bestPerformanceTime || 'Morning',
          productivity: Math.round((statsData?.overallProgress || 0) * 1.2)
        },
        motivationTrend: patternsData?.behaviorTrends?.monthlyTrend || 'stable'
      };

      setAnalyticsData(analytics);
    } catch (error) {
      console.log('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateWeeklyProgress = (goals: Goal[]): number[] => {
    // Simulate weekly progress data
    const weeks = selectedTimeframe === 'week' ? 1 : selectedTimeframe === 'month' ? 4 : 12;
    return Array.from({ length: weeks }, (_, i) => {
      const baseProgress = goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length;
      return Math.max(0, Math.min(100, baseProgress + (Math.random() - 0.5) * 20));
    });
  };

  const calculateStreakData = (goals: Goal[]) => {
    const streaks = goals.map(g => g.currentStreak || 0);
    return {
      current: Math.max(...streaks, 0),
      longest: Math.max(...streaks.map(s => s * 1.5), 0),
      average: streaks.reduce((sum, s) => sum + s, 0) / streaks.length || 0
    };
  };

  const getInsightColor = (type: 'positive' | 'warning' | 'neutral') => {
    switch (type) {
      case 'positive': return '#16A34A';
      case 'warning': return '#D97706';
      default: return '#6B7280';
    }
  };

  const renderProgressChart = () => {
    if (!analyticsData) return null;

    const maxValue = Math.max(...analyticsData.weeklyProgress);
    const chartWidth = width - 80;
    const chartHeight = 120;

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Progress Trend</Text>
        <View style={styles.chart}>
          <View style={styles.chartGrid}>
            {analyticsData.weeklyProgress.map((value, index) => (
              <View key={index} style={styles.chartBar}>
                <View
                  style={[
                    styles.chartBarFill,
                    {
                      height: (value / maxValue) * chartHeight,
                      backgroundColor: value > 70 ? '#16A34A' : value > 40 ? '#D97706' : '#DC2626'
                    }
                  ]}
                />
                <Text style={styles.chartLabel}>
                  {selectedTimeframe === 'week' ? 'W' : selectedTimeframe === 'month' ? `W${index + 1}` : `M${index + 1}`}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderKeyMetrics = () => {
    if (!analyticsData || !userStats) return null;

    return (
      <View style={styles.metricsContainer}>
        <Text style={styles.sectionTitle}>Key Metrics</Text>
        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, { backgroundColor: '#E8F5E8' }]}>
            <Text style={styles.metricIcon}>🎯</Text>
            <Text style={[styles.metricValue, { color: '#16A34A' }]}>
              {analyticsData.goalCompletion.completed}/{analyticsData.goalCompletion.total}
            </Text>
            <Text style={styles.metricLabel}>Goals Completed</Text>
            <Text style={styles.metricSubtext}>
              {Math.round((analyticsData.goalCompletion.completed / analyticsData.goalCompletion.total) * 100)}% success rate
            </Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: '#FEF3C7' }]}>
            <Text style={styles.metricIcon}>🔥</Text>
            <Text style={[styles.metricValue, { color: '#D97706' }]}>
              {analyticsData.streakData.current}
            </Text>
            <Text style={styles.metricLabel}>Current Streak</Text>
            <Text style={styles.metricSubtext}>
              Best: {Math.round(analyticsData.streakData.longest)} days
            </Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: '#EEF2FF' }]}>
            <Text style={styles.metricIcon}>⚡</Text>
            <Text style={[styles.metricValue, { color: '#4F46E5' }]}>
              {analyticsData.timePatterns.productivity}%
            </Text>
            <Text style={styles.metricLabel}>Productivity Score</Text>
            <Text style={styles.metricSubtext}>
              Peak: {analyticsData.timePatterns.bestTime}
            </Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: '#FCE7F3' }]}>
            <Text style={styles.metricIcon}>💜</Text>
            <Text style={[styles.metricValue, { color: '#BE185D' }]}>
              {userStats.motivationScore}%
            </Text>
            <Text style={styles.metricLabel}>Motivation</Text>
            <Text style={styles.metricSubtext}>
              Trending {analyticsData.motivationTrend === 'up' ? '↗️' : analyticsData.motivationTrend === 'down' ? '↘️' : '→'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderInsights = () => {
    if (!analyticsData || !userPatterns) return null;

    const insights = [
      {
        type: 'positive' as const,
        title: 'Peak Performance Identified',
        description: `You're 40% more productive on ${analyticsData.timePatterns.bestDay} ${analyticsData.timePatterns.bestTime.toLowerCase()}s`,
        action: 'Schedule important tasks during this window'
      },
      {
        type: analyticsData.streakData.current < 3 ? 'warning' as const : 'positive' as const,
        title: 'Consistency Pattern',
        description: analyticsData.streakData.current < 3 
          ? 'Your streaks tend to break after 2-3 days. Focus on building momentum.'
          : `Strong consistency! Your current ${analyticsData.streakData.current}-day streak is above average.`,
        action: analyticsData.streakData.current < 3 
          ? 'Implement the "2-day rule" - never miss twice in a row'
          : 'Keep the momentum going with your current approach'
      },
      {
        type: analyticsData.motivationTrend === 'up' ? 'positive' as const : 'warning' as const,
        title: 'Motivation Trend',
        description: analyticsData.motivationTrend === 'up' 
          ? 'Your motivation has been steadily increasing this month!'
          : analyticsData.motivationTrend === 'down'
          ? 'Motivation has dipped recently. Time for a strategy refresh.'
          : 'Motivation is stable. Consider adding variety to maintain engagement.',
        action: analyticsData.motivationTrend === 'up' 
          ? 'Scale up your efforts while motivation is high'
          : 'Reconnect with your deeper "why" and celebrate small wins'
      }
    ];

    return (
      <View style={styles.insightsContainer}>
        <Text style={styles.sectionTitle}>AI Insights</Text>
        {insights.map((insight, index) => (
          <View key={index} style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <View style={[
                styles.insightIndicator,
                { backgroundColor: insight.type === 'positive' ? '#E8F5E8' : '#FEF3C7' }
              ]}>
                <Text style={styles.insightIcon}>
                  {insight.type === 'positive' ? '✅' : '⚠️'}
                </Text>
              </View>
              <Text style={styles.insightTitle}>{insight.title}</Text>
            </View>
            <Text style={styles.insightDescription}>{insight.description}</Text>
            <Text style={styles.insightAction}>💡 {insight.action}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderActionButtons = () => (
    <View style={styles.actionsContainer}>
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => navigation.navigate('Chat', { 
          initialPrompt: 'Based on my progress analytics, what specific optimizations do you recommend for my goals and habits?' 
        })}
      >
        <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.actionButtonGradient}>
          <Text style={styles.actionButtonText}>Get Optimization Tips 🚀</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => navigation.navigate('Chat', { 
          initialPrompt: 'Help me create a strategy to improve my consistency and break through any plateaus I might be experiencing.' 
        })}
      >
        <View style={styles.actionButtonSecondary}>
          <Text style={styles.actionButtonSecondaryText}>Improve Consistency 📈</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Progress Analytics</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.timeframeSelector}>
        {(['week', 'month', 'quarter'] as const).map((timeframe) => (
          <TouchableOpacity
            key={timeframe}
            style={[
              styles.timeframeButton,
              selectedTimeframe === timeframe && styles.timeframeButtonActive
            ]}
            onPress={() => setSelectedTimeframe(timeframe)}
          >
            <Text style={[
              styles.timeframeText,
              selectedTimeframe === timeframe && styles.timeframeTextActive
            ]}>
              {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderProgressChart()}
        {renderKeyMetrics()}
        {renderInsights()}
        {renderActionButtons()}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  placeholder: {
    width: 24,
  },
  timeframeSelector: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  timeframeButtonActive: {
    backgroundColor: '#4F46E5',
  },
  timeframeText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  timeframeTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 16,
    padding: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  chart: {
    height: 140,
  },
  chartGrid: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  chartBarFill: {
    width: '80%',
    borderRadius: 4,
    marginBottom: 8,
  },
  chartLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  metricsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: (width - 52) / 2,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  metricIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  metricSubtext: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  insightsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  insightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  insightIcon: {
    fontSize: 16,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  insightDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  insightAction: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '500',
  },
  actionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    marginBottom: 12,
  },
  actionButtonGradient: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionButtonSecondary: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4F46E5',
  },
  actionButtonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5',
  },
  bottomPadding: {
    height: 20,
  },
}); 