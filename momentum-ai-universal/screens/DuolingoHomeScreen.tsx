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
import { AIInsights } from '../components/AIInsights';
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

  const GitHubStyleProgress: React.FC<{ goals: any[]; userXP: any }> = ({ goals, userXP }) => {
    const { theme } = useTheme();

    interface ContributionDay {
      date: string;
      level: number;
      day: number;
      week: number;
    }

    const generateContributionData = (): ContributionDay[] => {
      const data: ContributionDay[] = [];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 84); // 12 weeks * 7 days

      for (let i = 0; i < 84; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        
        // Simulate activity levels (0-4)
        const dayOfWeek = currentDate.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        
        let activityLevel = 0;
        if (Math.random() > 0.3) { // 70% chance of activity
          if (isWeekend) {
            activityLevel = Math.floor(Math.random() * 3) + 1; // 1-3 for weekends
          } else {
            activityLevel = Math.floor(Math.random() * 4) + 1; // 1-4 for weekdays
          }
        }

        data.push({
          date: currentDate.toISOString().split('T')[0],
          level: activityLevel,
          day: dayOfWeek,
          week: Math.floor(i / 7),
        });
      }
      return data;
    };

    const contributionData = generateContributionData();
    
    // Group data into weeks for display
    const weeks: ContributionDay[][] = [];
    for (let i = 0; i < 12; i++) {
      weeks.push(contributionData.slice(i * 7, (i + 1) * 7));
    }

    const getBoxColor = (level: number): string => {
      const colors = [
        '#F0F0F0', // No activity (light gray)
        '#FFE4D6', // Very low (very light orange)
        '#FFCC99', // Low activity (light orange)
        '#FF8C42', // Medium high (bright orange)
        '#FF6B35', // High activity (main orange)
      ];
      return colors[level] || colors[0];
    };

    const totalContributions = contributionData.filter(d => d.level > 0).length;
    const weeklyAverage = Math.round(totalContributions / 12);

    return (
      <View style={styles.contributionContainer}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Your 12-Week Progress Journey</Text>
        
        <View style={styles.contributionGraph}>
          {/* Horizontal grid layout - more compact */}
          <View style={styles.horizontalGrid}>
            {/* Month labels at top */}
            <View style={styles.monthLabels}>
              <Text style={[styles.monthLabel, { color: theme.colors.textSecondary }]}>3 months ago</Text>
              <Text style={[styles.monthLabel, { color: theme.colors.textSecondary }]}>2 months ago</Text>
              <Text style={[styles.monthLabel, { color: theme.colors.textSecondary }]}>1 month ago</Text>
              <Text style={[styles.monthLabel, { color: theme.colors.textSecondary }]}>Today</Text>
            </View>

            {/* Grid rows by day of week */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName, dayIndex) => (
              <View key={dayIndex} style={styles.gridRow}>
                <Text style={[styles.dayLabelHorizontal, { color: theme.colors.textSecondary }]}>
                  {dayName}
                </Text>
                <View style={styles.dayRow}>
                  {weeks.map((week, weekIndex) => {
                    const dayData = week.find(d => d.day === dayIndex);
                    return (
                      <TouchableOpacity
                        key={weekIndex}
                        style={[
                          styles.contributionBoxHorizontal,
                          {
                            backgroundColor: dayData ? getBoxColor(dayData.level) : '#F3F4F6',
                          },
                        ]}
                        activeOpacity={0.7}
                      />
                    );
                  })}
                </View>
              </View>
            ))}
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
            {totalContributions} active days • {weeklyAverage} per week average
          </Text>
        </View>
      </View>
    );
  };

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

        <View style={styles.section}>
          <AIInsights 
            checkIns={[]} // TODO: Load actual check-in data
            goals={goals}
            showSuggestions={true}
            compact={false}
          />
        </View>

        <View style={styles.section}>
          <GitHubStyleProgress goals={goals} userXP={userXP} />
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
    borderTopColor: '#FF6B35',
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
  contributionContainer: {
    paddingHorizontal: 20,
  },
  contributionGraph: {
    marginBottom: 16,
  },
  horizontalGrid: {
    marginBottom: 12,
  },
  monthLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 40,
    paddingRight: 10,
    marginBottom: 8,
  },
  monthLabel: {
    fontSize: 11,
    textAlign: 'center',
    flex: 1,
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  dayRow: {
    flexDirection: 'row',
    flex: 1,
  },
  contributionBoxHorizontal: {
    width: 11,
    height: 11,
    marginHorizontal: 1,
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 107, 53, 0.1)',
  },
  contributionLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 6,
  },
  legendText: {
    fontSize: 11,
    marginHorizontal: 4,
  },
  legendBox: {
    width: 9,
    height: 9,
    marginHorizontal: 2,
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  contributionStats: {
    textAlign: 'center',
    fontSize: 11,
    marginTop: 4,
  },
  dayLabelHorizontal: {
    fontSize: 11,
    width: 35,
    textAlign: 'right',
    marginRight: 8,
  },
});
