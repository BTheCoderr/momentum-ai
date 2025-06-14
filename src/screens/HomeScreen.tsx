import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, RefreshControl, Dimensions } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import api from '../api/axios';
import { LinearGradient } from 'expo-linear-gradient';
import MomentumLogo from '../components/MomentumLogo';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: Props) {
  const [refreshing, setRefreshing] = useState(false);
  const [insights, setInsights] = useState([
    {
      id: 1,
      type: 'warning',
      title: 'Motivation Dip Detected',
      description: 'Your fitness goal shows 20% less activity this week. Consider scheduling a workout buddy session.',
      action: 'Schedule Intervention'
    },
    {
      id: 2,
      type: 'success',
      title: 'Strong Momentum',
      description: 'Your SaaS project is ahead of schedule! This aligns with your pattern of weekend productivity.',
      action: 'Keep Going'
    },
    {
      id: 3,
      type: 'info',
      title: 'Pattern Recognition',
      description: 'You tend to be most productive on Tuesday mornings. Consider scheduling important tasks then.',
      action: 'Optimize Schedule'
    }
  ]);

  const [stats, setStats] = useState({
    activeGoals: 2,
    avgProgress: 53,
    overallProgress: 85,
    aiInterventions: 12,
    motivationScore: 94
  });

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const handleStartCheckIn = () => {
    navigation.navigate('Chat', { 
      initialPrompt: "I'm ready for my daily check-in! Let's review my progress and set intentions for today." 
    });
  };

  const handleChatWithAI = () => {
    navigation.navigate('Chat', {});
  };

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
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <View style={styles.logoSection}>
                <MomentumLogo size={40} color="#fff" />
                <Text style={styles.headerTitle}>Momentum AI</Text>
              </View>
              <View style={styles.aiPoweredBadge}>
                <Text style={styles.aiPoweredText}>🤖 AI-Powered Accountability</Text>
              </View>
            </View>
            <Text style={styles.headerSubtitle}>Stay Emotionally Connected</Text>
            <Text style={styles.headerMainTitle}>To Your Goals</Text>
            <Text style={styles.headerDescription}>
              Your AI accountability agent predicts when you'll drift from your goals and intervenes proactively. Like having a mini-therapist + detective that keeps your dreams alive.
            </Text>
          </View>
        </LinearGradient>

        {/* Daily Check-in CTA */}
        <LinearGradient
          colors={['#FF6B35', '#F7931E', '#FFB74D']}
          style={styles.checkInCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.checkInContent}>
            <Text style={styles.checkInTitle}>🔥 Ready for your daily check-in?</Text>
            <Text style={styles.checkInSubtitle}>Keep your momentum going! Track your habits and celebrate today's wins.</Text>
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
              <Text style={[styles.statNumber, { color: '#16A34A' }]}>{stats.overallProgress}%</Text>
              <Text style={styles.statLabel}>Overall Progress</Text>
              <Text style={styles.statSubtext}>You're crushing it this month!</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#EEF2FF' }]}>
              <Text style={styles.statIcon}>🎯</Text>
              <Text style={[styles.statNumber, { color: '#4F46E5' }]}>{stats.activeGoals}</Text>
              <Text style={styles.statLabel}>Active Goals</Text>
              <Text style={styles.statSubtext}>Currently tracking</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
              <Text style={styles.statIcon}>🤖</Text>
              <Text style={[styles.statNumber, { color: '#D97706' }]}>{stats.aiInterventions}</Text>
              <Text style={styles.statLabel}>AI Interventions</Text>
              <Text style={styles.statSubtext}>Timely nudges this week</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#FCE7F3' }]}>
              <Text style={styles.statIcon}>💜</Text>
              <Text style={[styles.statNumber, { color: '#BE185D' }]}>{stats.motivationScore}%</Text>
              <Text style={styles.statLabel}>Motivation Score</Text>
              <Text style={styles.statSubtext}>Emotional connection strong</Text>
            </View>
          </View>
        </View>

        {/* AI Insights & Interventions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🤖</Text>
            <Text style={styles.sectionTitle}>AI Insights & Interventions</Text>
          </View>
          
          {insights.map((insight) => (
            <View key={insight.id} style={styles.insightCard}>
              <View style={styles.insightHeader}>
                <View style={[
                  styles.insightIndicator,
                  { backgroundColor: insight.type === 'warning' ? '#FEF3C7' : insight.type === 'success' ? '#E8F5E8' : '#EEF2FF' }
                ]}>
                  <Text style={styles.insightIndicatorText}>
                    {insight.type === 'warning' ? '⚠️' : insight.type === 'success' ? '✅' : 'ℹ️'}
                  </Text>
                </View>
                <Text style={styles.insightTitle}>{insight.title}</Text>
              </View>
              <Text style={styles.insightDescription}>{insight.description}</Text>
              <TouchableOpacity 
                style={[
                  styles.insightButton,
                  { backgroundColor: insight.type === 'warning' ? '#F59E0B' : insight.type === 'success' ? '#16A34A' : '#4F46E5' }
                ]}
                onPress={handleChatWithAI}
              >
                <Text style={styles.insightButtonText}>{insight.action}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('Chat', {})}
            >
              <Text style={styles.quickActionIcon}>💬</Text>
              <Text style={styles.quickActionTitle}>AI Coach</Text>
              <Text style={styles.quickActionSubtitle}>Chat with your accountability agent</Text>
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
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 12,
  },
  aiPoweredBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  aiPoweredText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#E0E7FF',
    textAlign: 'center',
    marginBottom: 4,
  },
  headerMainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  headerDescription: {
    fontSize: 16,
    color: '#C7D2FE',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  checkInCard: {
    margin: 20,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  checkInContent: {
    flex: 1,
  },
  checkInTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  checkInSubtitle: {
    fontSize: 14,
    color: '#FFF3E0',
    marginBottom: 16,
    lineHeight: 20,
  },
  checkInButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  checkInButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  checkInIcon: {
    marginLeft: 16,
  },
  checkInIconText: {
    fontSize: 40,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
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
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
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
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  insightCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
  insightIndicatorText: {
    fontSize: 16,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
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
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  bottomPadding: {
    height: 20,
  },
});