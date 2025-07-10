import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from './ThemeProvider';
import { generateInsights, getSuggestions, getComprehensiveAnalysis } from '../lib/ai-insights';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AIInsightsCardProps {
  userId?: string;
  compact?: boolean;
  onRefresh?: () => void;
}

export const AIInsightsCard: React.FC<AIInsightsCardProps> = ({ 
  userId, 
  compact = false, 
  onRefresh 
}) => {
  const { theme } = useTheme();
  const [insights, setInsights] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [coachingMessage, setCoachingMessage] = useState<string>('');
  const [stats, setStats] = useState({
    checkInCount: 0,
    averageMood: 0,
    averageEnergy: 0,
    averageStress: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTab, setCurrentTab] = useState<'insights' | 'suggestions' | 'coaching'>('insights');

  useEffect(() => {
    loadAnalysis();
  }, []);

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      const currentUserId = userId || await AsyncStorage.getItem('userId') || 'demo-user';
      
      const analysis = await getComprehensiveAnalysis(currentUserId);
      
      setInsights(analysis.insights);
      setSuggestions(analysis.suggestions);
      setCoachingMessage(analysis.coachingMessage);
      setStats(analysis.stats);
    } catch (error) {
      console.error('Error loading AI analysis:', error);
      // Set fallback data
      setInsights(['Start daily check-ins to unlock AI insights about your patterns']);
      setSuggestions(['Complete your first check-in to get personalized suggestions']);
      setCoachingMessage('Welcome to your self-awareness journey! 🚀');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalysis();
    setRefreshing(false);
    onRefresh?.();
  };

  const renderInsights = () => (
    <View style={styles.contentSection}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        🧠 Pattern Recognition
      </Text>
      {insights.map((insight, index) => (
        <View key={index} style={[styles.insightItem, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.insightText, { color: theme.colors.text }]}>
            • {insight}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderSuggestions = () => (
    <View style={styles.contentSection}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        💡 Smart Suggestions
      </Text>
      {suggestions.map((suggestion, index) => (
        <View key={index} style={[styles.suggestionItem, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.suggestionText, { color: theme.colors.text }]}>
            • {suggestion}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderCoaching = () => (
    <View style={styles.contentSection}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        🤝 Your AI Coach
      </Text>
      <View style={[styles.coachingCard, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.coachingText, { color: theme.colors.text }]}>
          {coachingMessage}
        </Text>
      </View>
      
      {stats.checkInCount > 0 && (
        <View style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.statsTitle, { color: theme.colors.text }]}>Your Progress</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
                {stats.checkInCount}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Check-ins
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
                {stats.averageMood.toFixed(1)}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Avg Mood
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
                {stats.averageEnergy.toFixed(1)}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Avg Energy
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Analyzing your patterns...
          </Text>
        </View>
      </View>
    );
  }

  if (compact) {
    return (
      <View style={[styles.compactContainer, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.compactTitle, { color: theme.colors.text }]}>
          🧠 Latest Insight
        </Text>
        <Text style={[styles.compactContent, { color: theme.colors.textSecondary }]}>
          {insights[0] || 'Complete check-ins to unlock insights'}
        </Text>
        <TouchableOpacity 
          style={[styles.compactButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleRefresh}
        >
          <Text style={styles.compactButtonText}>View All</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primary + '90']}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>AI-Powered Insights</Text>
          <Text style={styles.headerSubtitle}>
            Powered by Claude 3 • {stats.checkInCount} check-ins analyzed
          </Text>
        </LinearGradient>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {[
            { key: 'insights', label: '🧠 Patterns', count: insights.length },
            { key: 'suggestions', label: '💡 Tips', count: suggestions.length },
            { key: 'coaching', label: '🤝 Coach', count: 1 }
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                { backgroundColor: theme.colors.surface },
                currentTab === tab.key && { backgroundColor: theme.colors.primary }
              ]}
              onPress={() => setCurrentTab(tab.key as any)}
            >
              <Text style={[
                styles.tabText,
                { color: theme.colors.text },
                currentTab === tab.key && { color: '#FFFFFF' }
              ]}>
                {tab.label}
              </Text>
              <Text style={[
                styles.tabCount,
                { color: theme.colors.textSecondary },
                currentTab === tab.key && { color: '#FFFFFF' }
              ]}>
                {tab.count}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        {currentTab === 'insights' && renderInsights()}
        {currentTab === 'suggestions' && renderSuggestions()}
        {currentTab === 'coaching' && renderCoaching()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  compactContainer: {
    borderRadius: 12,
    padding: 16,
    margin: 8,
  },
  compactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  compactContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  compactButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  compactButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  header: {
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  tabCount: {
    fontSize: 12,
  },
  contentSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  insightItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    lineHeight: 20,
  },
  suggestionItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  coachingCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  coachingText: {
    fontSize: 16,
    lineHeight: 24,
  },
  statsCard: {
    padding: 16,
    borderRadius: 12,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
}); 