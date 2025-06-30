import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { StreakDisplay, DailyChallenges } from '../components/DuolingoStyleFeatures';
import { useGamification } from '../hooks/useGamification';
import { userStatsServices, goalServices } from '../lib/services';
import { useTheme } from '../components/ThemeProvider';

interface DuolingoHomeScreenProps {
  navigation: any;
}

export default function DuolingoHomeScreen({ navigation }: DuolingoHomeScreenProps) {
  const { theme } = useTheme();
  const { userXP, addXP, loading: xpLoading } = useGamification();
  const [userStats, setUserStats] = useState<any>(null);
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, goalsData] = await Promise.all([
        userStatsServices.get(),
        goalServices.getAll(),
      ]);
      
      setUserStats(statsData);
      setGoals(goalsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChallengeComplete = async (challenge: any) => {
    try {
      const result = await addXP(challenge.xpReward, challenge.title);
      
      Alert.alert(
        '🎉 Challenge Complete!',
        `You earned ${challenge.xpReward} XP for completing "${challenge.title}"!`,
        [{ text: 'Awesome!', style: 'default' }]
      );
    } catch (error) {
      console.error('Error completing challenge:', error);
    }
  };

  const streakData = {
    current: userStats?.current_streak || 0,
    longest: userStats?.best_streak || 0,
    lastCheckin: new Date().toISOString(),
    freezeUsed: false,
    freezeAvailable: Math.floor((userXP.level || 1) / 5),
  };

  const levelProgress = (userXP.totalXP % 100) / 100;

  if (loading || xpLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar style={theme.dark ? "light" : "dark"} />
        <LinearGradient colors={[theme.colors.primary, theme.colors.secondary]} style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading your progress...</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={theme.dark ? "light" : "dark"} />
      
      <LinearGradient colors={[theme.colors.primary, theme.colors.secondary]} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <Text style={[styles.welcomeText, { color: theme.colors.text }]}>Welcome back! 👋</Text>
            <Text style={[styles.levelText, { color: theme.colors.text }]}>Level {userXP.level}</Text>
          </View>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
            <View style={[styles.progressFill, { backgroundColor: theme.colors.text, width: `${levelProgress * 100}%` }]} />
          </View>
          <Text style={[styles.xpText, { color: theme.colors.text }]}>
            {userXP.totalXP % 100} / 100 XP to Level {userXP.level + 1}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView 
        style={[styles.content, { backgroundColor: theme.colors.background }]}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}
      >
        <View style={styles.section}>
          <StreakDisplay streakData={streakData} />
        </View>

        <View style={styles.section}>
          <DailyChallenges onChallengeComplete={handleChallengeComplete} />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={[styles.actionCard, styles.checkinCard, { backgroundColor: theme.colors.card }]}
              onPress={() => navigation.navigate('CheckIn')}
            >
              <Text style={styles.actionEmoji}>📝</Text>
              <Text style={[styles.actionTitle, { color: theme.colors.text }]}>Daily Check-in</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionCard, styles.goalsCard, { backgroundColor: theme.colors.card }]}
              onPress={() => navigation.navigate('Goals')}
            >
              <Text style={styles.actionEmoji}>🎯</Text>
              <Text style={[styles.actionTitle, { color: theme.colors.text }]}>My Goals</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    marginBottom: 4,
  },
  levelText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 4,
  },
  xpText: {
    fontSize: 14,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  checkinCard: {
    borderTopWidth: 4,
    borderTopColor: '#FF6B35',
  },
  goalsCard: {
    borderTopWidth: 4,
    borderTopColor: '#2196F3',
  },
  actionEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
