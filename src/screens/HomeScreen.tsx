import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, RefreshControl, Dimensions } from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootTabParamList } from '../navigation';
import { LinearGradient } from 'expo-linear-gradient';
import MomentumLogo from '../components/MomentumLogo';
import { userAPI, UserStats, goalsAPI, Goal, patternAPI, UserPatterns, aiReflectionAPI, AIReflection } from '../api/services';
import { Ionicons } from '@expo/vector-icons';

type HomeScreenNavigationProp = BottomTabNavigationProp<RootTabParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: Props) {
  const [refreshing, setRefreshing] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({
    overallProgress: 85,
    activeGoals: 2,
    aiInterventions: 12,
    motivationScore: 94
  });
  const [goals, setGoals] = useState<Goal[]>([]);
  const [userPatterns, setUserPatterns] = useState<UserPatterns | null>(null);
  const [aiReflection, setAIReflection] = useState<AIReflection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      // Load user stats and goals in parallel
      const [statsData, goalsData] = await Promise.all([
        userAPI.getUserStats(),
        goalsAPI.getGoals()
      ]);
      
      setUserStats(statsData);
      setGoals(goalsData);

      // Load patterns and AI reflection
      const patterns = await patternAPI.getUserPatterns();
      setUserPatterns(patterns);

      // Get AI reflection based on patterns and goals
      const reflection = await aiReflectionAPI.getPersonalizedInsights({
        goals: goalsData,
        patterns,
        recentActivity: [] // Could include recent check-ins, etc.
      });
      setAIReflection(reflection);

    } catch (error) {
      console.log('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  }, []);

  const handleStartCheckIn = () => {
    navigation.navigate('Chat', { 
      initialPrompt: "I'm ready for my daily check-in! Let's review my progress and set intentions for today." 
    });
  };

  const handleChatWithAI = () => {
    navigation.navigate('Chat', {});
  };

  const handleInsightAction = (insight: any) => {
    // Navigate to chat with context about the specific insight
    navigation.navigate('Chat', {
      initialPrompt: `I'd like to work on: ${insight.title}. ${insight.description}`
    });
  };

  // Use AI-generated insights if available, otherwise fall back to static ones
  const displayInsights = aiReflection?.insights || [
    {
      type: 'warning' as const,
      title: 'Motivation Dip Detected',
      description: 'Your fitness goal shows 20% less activity this week. Consider scheduling a workout buddy session.',
      confidence: 0.8,
      actionable: true,
      suggestedActions: ['Schedule workout buddy session', 'Review fitness goals']
    },
    {
      type: 'success' as const,
      title: 'Strong Momentum',
      description: 'Your SaaS project is ahead of schedule! This aligns with your pattern of weekend productivity.',
      confidence: 0.9,
      actionable: true,
      suggestedActions: ['Continue current approach', 'Plan next milestone']
    },
    {
      type: 'pattern' as const,
      title: 'Pattern Recognition',
      description: 'You tend to be most productive on Tuesday mornings. Consider scheduling important tasks then.',
      confidence: 0.85,
      actionable: true,
      suggestedActions: ['Block Tuesday mornings', 'Schedule important tasks then']
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={['#4F46E5', '#7C3AED']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text style={styles.logo}>Momentum AI</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>BETA</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.profileButton}>
              <Ionicons name="person-circle-outline" size={32} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>
            Ready to crush your goals today?
          </Text>
          <Text style={styles.heroSubtitle}>
            Your AI coach is here to help you stay on track and achieve greatness.
          </Text>
        </View>

        {/* Daily Check-in CTA */}
        <LinearGradient
          colors={['#FF6B35', '#F7931E', '#FFB74D']}
          style={styles.checkInCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.checkInContent}>
            <Text style={styles.checkInTitle}>🔥 Ready for your daily check-in?</Text>
            <Text style={styles.checkInSubtitle}>
              {userPatterns?.behaviorTrends?.bestPerformanceTime 
                ? `Your peak performance time is ${userPatterns.behaviorTrends.bestPerformanceTime}. Perfect timing!`
                : "Keep your momentum going! Track your habits and celebrate today's wins."
              }
            </Text>
            <TouchableOpacity style={styles.checkInButton} onPress={handleStartCheckIn}>
              <Text style={styles.checkInButtonText}>Start Check-In 🎯</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.checkInIcon}>
            <Text style={styles.checkInIconText}>🎯</Text>
          </View>
        </LinearGradient>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: '#E8F5E8' }]}>
              <Text style={styles.statIcon}>📈</Text>
              <Text style={[styles.statNumber, { color: '#16A34A' }]}>{userStats.overallProgress}%</Text>
              <Text style={styles.statLabel}>Overall Progress</Text>
              <Text style={styles.statSubtext}>
                {aiReflection?.predictions?.riskOfGoalAbandonment 
                  ? `${Math.round((1 - aiReflection.predictions.riskOfGoalAbandonment) * 100)}% success likelihood`
                  : "You're crushing it this month!"
                }
              </Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#EEF2FF' }]}>
              <Text style={styles.statIcon}>🎯</Text>
              <Text style={[styles.statNumber, { color: '#4F46E5' }]}>{userStats.activeGoals}</Text>
              <Text style={styles.statLabel}>Active Goals</Text>
              <Text style={styles.statSubtext}>Currently tracking</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
              <Text style={styles.statIcon}>🤖</Text>
              <Text style={[styles.statNumber, { color: '#D97706' }]}>{userStats.aiInterventions}</Text>
              <Text style={styles.statLabel}>AI Interventions</Text>
              <Text style={styles.statSubtext}>
                {userPatterns?.interventionHistory?.successfulInterventions?.length 
                  ? `${userPatterns.interventionHistory.successfulInterventions.length} successful this week`
                  : "Timely nudges this week"
                }
              </Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#FCE7F3' }]}>
              <Text style={styles.statIcon}>💜</Text>
              <Text style={[styles.statNumber, { color: '#BE185D' }]}>{userStats.motivationScore}%</Text>
              <Text style={styles.statLabel}>Motivation Score</Text>
              <Text style={styles.statSubtext}>
                {userPatterns?.behaviorTrends?.monthlyTrend === 'up' 
                  ? "Trending upward!"
                  : "Emotional connection strong"
                }
              </Text>
            </View>
          </View>
        </View>

        {/* AI Insights & Interventions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🤖</Text>
            <Text style={styles.sectionTitle}>AI Insights & Interventions</Text>
          </View>
          
          {displayInsights.map((insight, index) => (
            <View key={index} style={styles.insightCard}>
              <View style={styles.insightHeader}>
                <View style={[
                  styles.insightIndicator,
                  { backgroundColor: 
                    insight.type === 'warning' ? '#FEF3C7' : 
                    insight.type === 'success' ? '#E8F5E8' : 
                    insight.type === 'pattern' ? '#F3E8FF' :
                    '#EEF2FF' 
                  }
                ]}>
                  <Text style={styles.insightIndicatorText}>
                    {insight.type === 'warning' ? '⚠️' : 
                     insight.type === 'success' ? '✅' : 
                     insight.type === 'pattern' ? '🧠' :
                     'ℹ️'}
                  </Text>
                </View>
                <Text style={styles.insightTitle}>{insight.title}</Text>
              </View>
              <Text style={styles.insightDescription}>{insight.description}</Text>
              {insight.suggestedActions && (
                <View style={styles.suggestedActions}>
                  {insight.suggestedActions.slice(0, 2).map((action: string, actionIndex: number) => (
                    <Text key={actionIndex} style={styles.suggestedAction}>• {action}</Text>
                  ))}
                </View>
              )}
              <TouchableOpacity 
                style={[
                  styles.insightButton,
                  { backgroundColor: 
                    insight.type === 'warning' ? '#F59E0B' : 
                    insight.type === 'success' ? '#16A34A' : 
                    insight.type === 'pattern' ? '#7C3AED' :
                    '#4F46E5' 
                  }
                ]}
                onPress={() => handleInsightAction(insight)}
              >
                <Text style={styles.insightButtonText}>
                  Discuss with AI
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Personalized Coaching Section */}
        {aiReflection?.personalizedCoaching && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>💭</Text>
              <Text style={styles.sectionTitle}>Your Personal Coach</Text>
            </View>
            
            <View style={styles.coachingCard}>
              <Text style={styles.coachingMessage}>
                {aiReflection.personalizedCoaching.emotionalSupport}
              </Text>
              
              {aiReflection.personalizedCoaching.nextSteps.length > 0 && (
                <View style={styles.nextStepsContainer}>
                  <Text style={styles.nextStepsTitle}>Next Steps:</Text>
                  {aiReflection.personalizedCoaching.nextSteps.map((step, index) => (
                    <Text key={index} style={styles.nextStep}>• {step}</Text>
                  ))}
                </View>
              )}
              
              <TouchableOpacity 
                style={styles.coachingButton}
                onPress={handleChatWithAI}
              >
                <Text style={styles.coachingButtonText}>Continue Conversation</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>⚡</Text>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>
          
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={handleChatWithAI}
            >
              <Text style={styles.quickActionIcon}>🤖</Text>
              <Text style={styles.quickActionTitle}>AI Coach</Text>
              <Text style={styles.quickActionSubtitle}>Get personalized guidance</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('Goals')}
            >
              <Text style={styles.quickActionIcon}>🎯</Text>
              <Text style={styles.quickActionTitle}>Goals</Text>
              <Text style={styles.quickActionSubtitle}>Track your progress</Text>
            </TouchableOpacity>
          </View>
        </View>

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
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginRight: 12,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  profileButton: {
    padding: 8,
  },
  heroSection: {
    padding: 20,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 34,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  checkInCard: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 32,
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  checkInContent: {
    flex: 1,
    paddingRight: 16,
  },
  checkInTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  checkInSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 20,
    lineHeight: 20,
  },
  checkInButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  checkInButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  checkInIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkInIconText: {
    fontSize: 28,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    marginHorizontal: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
    textAlign: 'center',
  },
  statSubtext: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  insightCard: {
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
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  insightIndicatorText: {
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
    marginBottom: 16,
  },
  insightButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  insightButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  bottomPadding: {
    height: 20,
  },
  primaryActionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryActionIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  primaryActionText: {
    flex: 1,
  },
  primaryActionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  primaryActionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  primaryActionArrow: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  suggestedActions: {
    marginBottom: 16,
  },
  suggestedAction: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  coachingCard: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  coachingMessage: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  nextStepsContainer: {
    marginBottom: 16,
  },
  nextStepsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  nextStep: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  coachingButton: {
    backgroundColor: '#4F46E5',
    padding: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  coachingButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});