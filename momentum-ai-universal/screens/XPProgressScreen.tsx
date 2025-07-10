import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../components/ThemeProvider';
import { useGamification } from '../hooks/useGamification';
import { userStatsServices, checkinServices } from '../lib/services';

const { width } = Dimensions.get('window');

interface CheckInData {
  date: string;
  completed: boolean;
  xp: number;
}

export default function XPProgressScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { userXP, loading: xpLoading } = useGamification();
  const [userStats, setUserStats] = useState<any>(null);
  const [weeklyData, setWeeklyData] = useState<CheckInData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    try {
      setLoading(true);
      const [stats, recentCheckins] = await Promise.all([
        userStatsServices.get(),
        checkinServices.getRecent(30), // Get last 30 days
      ]);
      
      setUserStats(stats);
      
      // Generate weekly check-in data
      const weekData = generateWeeklyData(recentCheckins);
      setWeeklyData(weekData);
    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateWeeklyData = (checkins: any[]): CheckInData[] => {
    const today = new Date();
    const weekData: CheckInData[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const checkin = checkins.find(c => c.date === dateStr);
      weekData.push({
        date: dateStr,
        completed: !!checkin,
        xp: checkin?.xp_earned || 0,
      });
    }
    
    return weekData;
  };

  const getDayLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };

  const currentLevel = userXP.level || 1;
  const currentXP = userXP.totalXP || 0;
  const xpToNextLevel = 100;
  const progressToNextLevel = (currentXP % 100) / 100;

  if (loading || xpLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading your progress...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>XP & Progress</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Level & XP Card */}
        <View style={[styles.levelCard, { backgroundColor: theme.colors.card }]}>
          <View style={styles.levelInfo}>
            <Text style={[styles.levelNumber, { color: theme.colors.text }]}>Level {currentLevel}</Text>
            <Text style={[styles.xpText, { color: theme.colors.textSecondary }]}>{currentXP} XP Total</Text>
          </View>
          <Text style={styles.levelEmoji}>⚡️</Text>
        </View>

        {/* Progress to Next Level */}
        <View style={[styles.progressCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.progressTitle, { color: theme.colors.text }]}>Progress to Level {currentLevel + 1}</Text>
          <View style={[styles.progressContainer, { backgroundColor: theme.colors.border }]}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  backgroundColor: theme.colors.primary,
                  width: `${progressToNextLevel * 100}%` 
                }
              ]} 
            />
          </View>
          <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
            {currentXP % 100} / {xpToNextLevel} XP
          </Text>
        </View>

        {/* Weekly Activity */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>This Week's Activity</Text>
          <View style={styles.weeklyGrid}>
            {weeklyData.map((day, index) => (
              <View key={index} style={styles.dayColumn}>
                <Text style={[styles.dayLabel, { color: theme.colors.textSecondary }]}>
                  {getDayLabel(day.date)}
                </Text>
                <View 
                  style={[
                    styles.daySquare,
                    {
                      backgroundColor: day.completed 
                        ? theme.colors.success 
                        : theme.colors.border
                    }
                  ]}
                >
                  {day.completed && (
                    <Text style={styles.checkMark}>✓</Text>
                  )}
                </View>
                {day.completed && (
                  <Text style={[styles.xpEarned, { color: theme.colors.primary }]}>
                    +{day.xp}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Stats Overview */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Your Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
                {userStats?.current_streak || 0}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Current Streak
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
                {userStats?.best_streak || 0}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Best Streak
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
                {userStats?.total_checkins || 0}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Total Check-ins
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
                {userStats?.total_goals || 0}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Goals Created
              </Text>
            </View>
          </View>
        </View>

        {/* Achievements */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent Achievements</Text>
          <View style={styles.achievementsList}>
            {currentLevel >= 2 && (
              <View style={styles.achievementItem}>
                <Text style={styles.achievementEmoji}>🏆</Text>
                <Text style={[styles.achievementText, { color: theme.colors.text }]}>
                  Reached Level {currentLevel}
                </Text>
              </View>
            )}
            {(userStats?.current_streak || 0) >= 3 && (
              <View style={styles.achievementItem}>
                <Text style={styles.achievementEmoji}>🔥</Text>
                <Text style={[styles.achievementText, { color: theme.colors.text }]}>
                  3+ Day Streak
                </Text>
              </View>
            )}
            {(userStats?.total_checkins || 0) >= 10 && (
              <View style={styles.achievementItem}>
                <Text style={styles.achievementEmoji}>📝</Text>
                <Text style={[styles.achievementText, { color: theme.colors.text }]}>
                  10+ Check-ins
                </Text>
              </View>
            )}
            {(userStats?.current_streak || 0) >= 7 && (
              <View style={styles.achievementItem}>
                <Text style={styles.achievementEmoji}>🌟</Text>
                <Text style={[styles.achievementText, { color: theme.colors.text }]}>
                  Week Warrior
                </Text>
              </View>
            )}
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
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  levelCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
  },
  levelInfo: {
    flex: 1,
  },
  levelNumber: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  xpText: {
    fontSize: 16,
    marginTop: 4,
  },
  levelEmoji: {
    fontSize: 48,
  },
  progressCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  progressContainer: {
    height: 10,
    borderRadius: 5,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 14,
    textAlign: 'center',
  },
  section: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  weeklyGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayColumn: {
    alignItems: 'center',
    flex: 1,
  },
  dayLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  daySquare: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  checkMark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  xpEarned: {
    fontSize: 10,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  achievementsList: {
    gap: 12,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  achievementText: {
    fontSize: 16,
    fontWeight: '500',
  },
}); 