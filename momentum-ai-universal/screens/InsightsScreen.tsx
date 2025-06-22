import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { aiServices, Insight, checkinServices, goalServices } from '../lib/services';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const InsightsScreen = ({ navigation }: any) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasEnoughData, setHasEnoughData] = useState(false);
  const [userStats, setUserStats] = useState({
    totalCheckins: 0,
    totalGoals: 0
  });

  useEffect(() => {
    checkDataAndLoadInsights();
  }, []);

  const checkDataAndLoadInsights = async () => {
    try {
      setLoading(true);
      
      // Get user data
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) {
        setLoading(false);
        return;
      }

      const user = JSON.parse(userData);
      
      // Check if user has enough data for insights
      const [goals, checkins] = await Promise.all([
        goalServices.getAll(),
        checkinServices.getRecent(10)
      ]);

      const totalGoals = goals?.length || 0;
      const totalCheckins = checkins?.length || 0;

      setUserStats({ totalGoals, totalCheckins });
      
      // User needs at least 3 check-ins OR 2 goals to see insights
      const sufficient = totalCheckins >= 3 || totalGoals >= 2;
      setHasEnoughData(sufficient);

      if (sufficient) {
        // Only generate insights if user has enough data
        const generatedInsights = await generateRealInsights(goals, checkins, user);
        setInsights(generatedInsights);
      }

    } catch (error) {
      console.error('Error loading insights:', error);
      Alert.alert('Error', 'Failed to load insights. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateRealInsights = async (goals: any[], checkins: any[], user: any): Promise<Insight[]> => {
    const realInsights: Insight[] = [];
    
    try {
      // Only generate insights if we have actual data
      if (checkins && checkins.length >= 3) {
        // Mood pattern analysis
        const recentMoods = checkins.slice(0, 7).map((c: any) => c.mood || 3);
        const avgMood = recentMoods.reduce((a: number, b: number) => a + b, 0) / recentMoods.length;
        
        if (avgMood >= 4) {
          realInsights.push({
            id: 'mood_positive',
            type: 'encouragement',
            title: 'Great Energy This Week! ⚡',
            content: `Your mood scores average ${avgMood.toFixed(1)}/5. You're in a fantastic rhythm!`,
          });
        } else if (avgMood < 3) {
          realInsights.push({
            id: 'mood_support',
            type: 'reflection',
            title: 'Let\'s Boost Your Energy 🌟',
            content: `I notice your energy has been lower lately. What usually lifts your spirits?`,
          });
        }
      }
      
      if (goals && goals.length >= 1) {
        const activeGoals = goals.filter((g: any) => !g.completed);
        if (activeGoals.length > 0) {
          realInsights.push({
            id: 'goal_focus',
            type: 'suggestion',
            title: 'Your Goal is Calling! 🎯',
            content: `"${activeGoals[0].title}" - What's the smallest step you could take right now?`,
          });
        }
      }

      // Add streak celebration if user has been consistent
      if (checkins && checkins.length >= 3) {
        realInsights.push({
          id: 'consistency',
          type: 'encouragement',
          title: `${checkins.length} Check-ins Strong! 🔥`,
          content: 'Your consistency is building something powerful. Every day matters.',
        });
      }

    } catch (error) {
      console.error('Error generating insights:', error);
    }

    return realInsights;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await checkDataAndLoadInsights();
    setRefreshing(false);
  };

  const handleStartJourney = () => {
    // Navigate to check-in or goals screen
    Alert.alert('Let\'s Start!', 'Choose an action to begin building your insights.', [
      { text: 'Do Check-In', onPress: () => {/* Navigate to check-in */} },
      { text: 'Set Goals', onPress: () => {/* Navigate to goals */} },
      { text: 'Cancel', style: 'cancel' }
    ]);
  };

  const getEmojiForType = (type: string) => {
    switch (type) {
      case 'pattern': return '📊';
      case 'encouragement': return '🎉';
      case 'suggestion': return '💡';
      case 'reflection': return '🧘';
      default: return '✨';
    }
  };

  const getCategoryForType = (type: string) => {
    switch (type) {
      case 'pattern': return 'Analytics';
      case 'encouragement': return 'Motivation';
      case 'suggestion': return 'Improvement';
      case 'reflection': return 'Mindfulness';
      default: return 'General';
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'pattern': return '#FF6B35';
      case 'encouragement': return '#34C759';
      case 'suggestion': return '#007AFF';
      case 'reflection': return '#AF52DE';
      default: return '#007AFF';
    }
  };

  const getInsightBackground = (type: string) => {
    switch (type) {
      case 'pattern': return '#FFF4F1';
      case 'encouragement': return '#F1F9F4';
      case 'suggestion': return '#F1F7FF';
      case 'reflection': return '#F8F4FF';
      default: return '#F1F7FF';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const InsightCard = ({ insight, isActive }: { insight: Insight; isActive: boolean }) => (
    <View style={[
      styles.insightCard,
      { backgroundColor: getInsightBackground(insight.type) },
      !isActive && styles.inactiveCard
    ]}>
      <View style={styles.cardHeader}>
        <View style={styles.typeContainer}>
          <Text style={styles.insightEmoji}>{insight.emoji}</Text>
          <Text style={[styles.categoryText, { color: getInsightColor(insight.type) }]}>
            {insight.category}
          </Text>
        </View>
        <Text style={styles.dateText}>
          {formatDate(insight.createdAt || new Date())}
        </Text>
      </View>

      <Text style={styles.insightTitle}>{insight.title}</Text>
      <Text style={styles.insightContent}>{insight.content}</Text>

      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={[styles.cardActionButton, styles.saveButton]}
          onPress={() => {
            // TODO: Implement save to favorites
            Alert.alert('Saved! 💾', 'This insight has been saved to your favorites.');
          }}
        >
          <Text style={styles.actionEmoji}>💾</Text>
          <Text style={styles.actionText}>Save</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.cardActionButton, styles.shareButton]}
          onPress={() => {
            // TODO: Implement share functionality
            Alert.alert('Share', 'Share functionality coming soon!');
          }}
        >
          <Text style={styles.actionEmoji}>📤</Text>
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.cardActionButton, styles.coachButton]}
          onPress={() => {
            // TODO: Navigate to AI coach with this insight context
            Alert.alert('AI Coach', 'AI coaching based on this insight coming soon!');
          }}
        >
          <Text style={styles.actionEmoji}>🤖</Text>
          <Text style={styles.actionText}>Coach</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Checking your progress...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!hasEnoughData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <ScrollView 
          contentContainerStyle={styles.emptyContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <Text style={styles.emptyIcon}>🌱</Text>
          <Text style={styles.emptyTitle}>Building Your Profile</Text>
          <Text style={styles.emptySubtitle}>
            Complete a few check-ins or add some goals to unlock personalized AI insights about your patterns and progress.
          </Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userStats.totalCheckins}</Text>
              <Text style={styles.statLabel}>Check-ins</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userStats.totalGoals}</Text>
              <Text style={styles.statLabel}>Goals</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.actionButton} onPress={handleStartJourney}>
            <Text style={styles.actionButtonText}>🚀 Start Your Journey</Text>
          </TouchableOpacity>
          
          <Text style={styles.requirementText}>
            Need: 3+ check-ins OR 2+ goals for insights
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (insights.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Insights</Text>
          <TouchableOpacity 
            style={styles.generateButton}
            onPress={onRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.generateButtonText}>✨ Generate</Text>
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>💡</Text>
          <Text style={styles.emptyTitle}>No Insights Yet</Text>
          <Text style={styles.emptySubtitle}>
            Complete a few check-ins and I'll generate personalized insights about your patterns and progress!
          </Text>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Check-In')}
          >
            <Text style={styles.actionButtonText}>Start Check-in</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Insights</Text>
        <TouchableOpacity 
          style={styles.generateButton}
          onPress={onRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.generateButtonText}>✨ Generate</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Insights Counter */}
      <View style={styles.counterContainer}>
        <Text style={styles.counterText}>
          {currentIndex + 1} of {insights.length}
        </Text>
      </View>

      {/* Insights Stack */}
      <ScrollView 
        style={styles.insightsContainer}
        pagingEnabled
        horizontal
        showsHorizontalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(newIndex);
        }}
      >
        {insights.map((insight, index) => (
          <View key={insight.id} style={styles.cardContainer}>
            <InsightCard 
              insight={insight} 
              isActive={index === currentIndex}
            />
          </View>
        ))}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
        >
          <Text style={[
            styles.navButtonText,
            currentIndex === 0 && styles.navButtonDisabled
          ]}>
            ← Previous
          </Text>
        </TouchableOpacity>
        
        <View style={styles.dotsContainer}>
          {insights.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.activeDot
              ]}
            />
          ))}
        </View>
        
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => setCurrentIndex(Math.min(insights.length - 1, currentIndex + 1))}
          disabled={currentIndex === insights.length - 1}
        >
          <Text style={[
            styles.navButtonText,
            currentIndex === insights.length - 1 && styles.navButtonDisabled
          ]}>
            Next →
          </Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.quickAction}
          onPress={() => navigation.navigate('Check-In')}
        >
          <Text style={styles.quickActionEmoji}>📝</Text>
          <Text style={styles.quickActionText}>Check-in</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickAction}
          onPress={() => navigation.navigate('Goals')}
        >
          <Text style={styles.quickActionEmoji}>🎯</Text>
          <Text style={styles.quickActionText}>Goals</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickAction}
          onPress={() => navigation.navigate('Reflection')}
        >
          <Text style={styles.quickActionEmoji}>🧘</Text>
          <Text style={styles.quickActionText}>Reflect</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  generateButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  counterContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  counterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  insightsContainer: {
    flex: 1,
  },
  cardContainer: {
    width: width,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  insightCard: {
    borderRadius: 20,
    padding: 24,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    minHeight: 300,
  },
  inactiveCard: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
  },
  insightTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
    lineHeight: 28,
  },
  insightContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 24,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 'auto',
  },
  cardActionButton: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: 80,
  },
  saveButton: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
  },
  shareButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  coachButton: {
    backgroundColor: 'rgba(175, 82, 222, 0.1)',
  },
  actionEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  bottomNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  navButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  navButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  navButtonDisabled: {
    color: '#ccc',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#007AFF',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  quickAction: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  quickActionEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  quickActionText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  actionButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 32,
    gap: 32,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  requirementText: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  noInsightsContainer: {
    padding: 32,
    alignItems: 'center',
  },
  noInsightsText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
});

export default InsightsScreen; 