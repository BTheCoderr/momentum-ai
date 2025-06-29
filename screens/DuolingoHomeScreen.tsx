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
  Image,
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

// Progress Grid Component - GitHub-style contribution graph
const GitHubStyleProgress: React.FC<{ goals: any[]; userXP: any }> = ({ goals, userXP }) => {
  const { theme } = useTheme();
  
  interface ContributionDay {
    date: string;
    level: number;
    day: number;
    week: number;
  }
  
  // Generate last 365 days
  const generateContributionData = (): ContributionDay[] => {
    const days: ContributionDay[] = [];
    const today = new Date();
    
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Simulate activity level based on XP and randomness
      const baseActivity = Math.floor((userXP.totalXP || 0) / 100) % 5; // 0-4 activity level
      const randomVariation = Math.floor(Math.random() * 3); // 0-2 variation
      const activityLevel = Math.min(4, Math.max(0, baseActivity + randomVariation - 1));
      
      days.push({
        date: date.toISOString().split('T')[0],
        level: activityLevel, // 0 = no activity, 1-4 = increasing activity
        day: date.getDay(),
        week: Math.floor(i / 7),
      });
    }
    return days;
  };

  const contributionData = generateContributionData();
  const weeks: ContributionDay[][] = Array.from({ length: 53 }, (_, weekIndex) => 
    contributionData.filter(day => Math.floor((364 - contributionData.indexOf(day)) / 7) === weekIndex)
  );

  const getBoxColor = (level: number): string => {
    const colors = [
      theme.colors.border, // No activity
      '#c6e48b', // Low activity  
      '#7bc96f', // Medium low
      '#39d353', // Medium high
      '#196127', // High activity
    ];
    return colors[level] || colors[0];
  };

  return (
    <View style={styles.contributionContainer}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Your Progress Journey</Text>
      
      <View style={styles.contributionGraph}>
        <View style={styles.monthLabels}>
          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => (
            <Text key={month} style={[styles.monthLabel, { color: theme.colors.textSecondary }]}>
              {month}
            </Text>
          ))}
        </View>
        
        <View style={styles.contributionGrid}>
          <View style={styles.dayLabels}>
            {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((day, index) => (
              <Text key={index} style={[styles.dayLabel, { color: theme.colors.textSecondary }]}>
                {day}
              </Text>
            ))}
          </View>
          
          <View style={styles.gridContainer}>
            {weeks.map((week, weekIndex) => (
              <View key={weekIndex} style={styles.week}>
                {Array.from({ length: 7 }, (_, dayIndex) => {
                  const dayData = week.find(d => d.day === dayIndex);
                  return (
                    <View
                      key={dayIndex}
                      style={[
                        styles.contributionBox,
                        {
                          backgroundColor: dayData ? getBoxColor(dayData.level) : theme.colors.border,
                        },
                      ]}
                    />
                  );
                })}
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.contributionLegend}>
          <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Less</Text>
          {[0, 1, 2, 3, 4].map(level => (
            <View
              key={level}
              style={[
                styles.legendBox,
                { backgroundColor: getBoxColor(level) },
              ]}
            />
          ))}
          <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>More</Text>
        </View>
        
        <Text style={[styles.contributionStats, { color: theme.colors.textSecondary }]}>
          {contributionData.filter(d => d.level > 0).length} contributions in the last year
        </Text>
      </View>
    </View>
  );
};

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
          <Image 
            source={require('../assets/icon.png')} 
            style={styles.loadingLogo}
          />
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
          {/* Your actual logo instead of rocket */}
          <View style={styles.logoContainer}>
            <View style={styles.logoShadowWrapper}>
              <Image 
                source={require('../assets/icon.png')} 
                style={styles.headerLogo}
              />
            </View>
          </View>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
            <View style={[styles.progressFill, { backgroundColor: theme.colors.text, width: `${Math.min(100, Math.max(0, (levelProgress || 0) * 100))}%` }]} />
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

        {/* The visual boxes/grid you wanted back */}
        <View style={styles.section}>
          <GitHubStyleProgress goals={goals} userXP={userXP} />
        </View>

        <View style={styles.section}>
          <DailyChallenges onChallengeComplete={handleChallengeComplete} />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={[styles.actionCard, styles.checkinCard, { backgroundColor: theme.colors.card }]}
              onPress={() => navigation.navigate('Check-In')}
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
  loadingLogo: {
    width: 80,
    height: 80,
    marginBottom: 20,
    borderRadius: 20,
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
  logoContainer: {
    marginLeft: 20,
  },
  logoShadowWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  headerLogo: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
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
  // Progress Grid Styles - The "boxes" visual
  contributionContainer: {
    paddingHorizontal: 20,
  },
  contributionGraph: {
    marginBottom: 24,
  },
  monthLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  monthLabel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  contributionGrid: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayLabels: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginRight: 8,
  },
  dayLabel: {
    fontSize: 12,
  },
  gridContainer: {
    flexDirection: 'column',
  },
  week: {
    flexDirection: 'row',
  },
  contributionBox: {
    width: 10,
    height: 10,
    margin: 1,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  contributionLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  legendText: {
    fontSize: 12,
    marginHorizontal: 4,
  },
  legendBox: {
    width: 10,
    height: 10,
    marginHorizontal: 2,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  contributionStats: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 8,
  },
  recentBox: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  progressGridLabel: {
    textAlign: 'center',
    fontSize: 14,
    opacity: 0.7,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFF',
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
