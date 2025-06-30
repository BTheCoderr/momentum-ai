import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { goalServices } from '../lib/services';
import { GoalCreationModal } from '../components/GoalCreationModal';
import { ProgressVisualizations } from '../components/ProgressVisualizations';
import { useTheme } from '../components/ThemeProvider';
import { trackEvent } from '../lib/analytics';

interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  progress: number;
  created_at: string;
  target_date?: string;
  priority?: 'low' | 'medium' | 'high';
  reminder_frequency?: 'daily' | 'weekly' | 'none';
  milestones?: Array<{ title: string; completed: boolean; }>;
}

interface Stats {
  current_streak: number;
  best_streak: number;
  total_checkins: number;
  total_goals: number;
  completed_goals: number;
  totalXP: number;
  level: number;
  motivationScore: number;
}

export default function GoalsScreen({ navigation }: any) {
  const { theme } = useTheme();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [stats, setStats] = useState<Stats>({
    current_streak: 0,
    best_streak: 0,
    total_checkins: 0,
    total_goals: 0,
    completed_goals: 0,
    totalXP: 0,
    level: 1,
    motivationScore: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [userGoals, userStats] = await Promise.all([
        goalServices.getAll(),
        goalServices.getStats(),
      ]);
      setGoals(Array.isArray(userGoals) ? userGoals : []);
      setStats(userStats || {
        current_streak: 0,
        best_streak: 0,
        total_checkins: 0,
        total_goals: 0,
        completed_goals: 0,
        totalXP: 0,
        level: 1,
        motivationScore: 0,
      });
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert(
        'Error',
        'Failed to load goals. Please try again.',
        [
          {
            text: 'Retry',
            onPress: loadData
          }
        ]
      );
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await goalServices.delete(goalId);
              loadData();
            } catch (error) {
              console.error('Error deleting goal:', error);
              Alert.alert('Error', 'Failed to delete goal. Please try again.');
            }
          },
        },
      ]
    );
  };

  const updateProgress = async (goalId: string, newProgress: number) => {
    try {
      await goalServices.update(goalId, { progress: newProgress });
      if (newProgress >= 100) {
        Alert.alert('Congratulations! 🎯', 'Goal completed! +100 XP');
      }
      loadData();
    } catch (error) {
      console.error('Error updating progress:', error);
      Alert.alert('Error', 'Failed to update progress. Please try again.');
    }
  };

  const handleAddGoal = async (goalData: any) => {
    try {
      setGoals(prev => [...prev, goalData]);
      setShowAddModal(false);
      
      // Track goal creation
      analytics.trackGoalCreated(goalData.category, goalData.priority);
    } catch (error) {
      console.error('Error adding goal:', error);
      Alert.alert('Error', 'Failed to add goal. Please try again.');
    }
  };

  const handleShareProgress = async (goal: Goal) => {
    try {
      const shareMessage = `I'm ${goal.progress}% through my goal: ${goal.title}! 🎯\n\nTracking my progress with Momentum AI.`;
      
      // Use the Share API
      const result = await Share.share({
        message: shareMessage,
        title: 'Share Goal Progress',
      });

      if (result.action === Share.sharedAction) {
        // Track sharing analytics
        trackEvent('goal_shared', {
          goalId: goal.id,
          progress: goal.progress,
        });
      }
    } catch (error) {
      console.error('Error sharing progress:', error);
      Alert.alert('Error', 'Failed to share progress. Please try again.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          style={styles.header}
        >
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Goals</Text>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading goals...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backButtonText, { color: theme.colors.text }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Goals</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={[styles.statsButton, { backgroundColor: theme.colors.surface }]}
            onPress={() => setShowStats(!showStats)}
          >
            <Text style={styles.statsButtonText}>📊</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: '#FF6B35' }]}
            onPress={() => setShowAddModal(true)}
          >
            <Text style={[styles.addButtonText, { color: theme.colors.text }]}>+ Add</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        style={[styles.scrollView, { backgroundColor: theme.colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        {showStats ? (
          <ProgressVisualizations goals={goals} stats={stats} />
        ) : goals.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>🎯</Text>
            <Text style={[styles.emptyStateTitle, { color: theme.colors.text }]}>No Goals Yet</Text>
            <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
              Create your first goal to start your journey!
            </Text>
            <TouchableOpacity 
              style={[styles.createFirstGoalButton, { backgroundColor: '#FF6B35' }]}
              onPress={() => setShowAddModal(true)}
            >
              <Text style={[styles.createFirstGoalButtonText, { color: theme.colors.text }]}>
                Create First Goal
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          goals.map((goal) => (
            <View key={goal.id} style={[styles.goalCard, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.goalHeader}>
                <Text style={[styles.goalTitle, { color: theme.colors.text }]}>{goal.title}</Text>
                <TouchableOpacity
                  onPress={() => handleDeleteGoal(goal.id)}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteButtonText}>×</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.goalDescription, { color: theme.colors.textSecondary }]}>
                {goal.description}
              </Text>

              <View style={styles.progressSection}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill,
                      { width: `${goal.progress}%`, backgroundColor: '#FF6B35' }
                    ]} 
                  />
                </View>
                <Text style={[styles.progressText, { color: theme.colors.text }]}>
                  {goal.progress}%
                </Text>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.checkInButton]}
                  onPress={() => navigation.navigate('Check-In', { goalId: goal.id })}
                >
                  <Text style={styles.checkInButtonText}>Daily Check-In</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.shareButton]}
                  onPress={() => handleShareProgress(goal)}
                >
                  <Text style={styles.shareButtonText}>Share Progress</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <GoalCreationModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddGoal}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressSection: {
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  checkInButton: {
    backgroundColor: '#FF6B35',
  },
  shareButton: {
    backgroundColor: '#10B981',
  },
  checkInButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsButton: {
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  statsButtonText: {
    fontSize: 20,
  },
  addButton: {
    padding: 8,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  createFirstGoalButton: {
    padding: 16,
    borderRadius: 12,
  },
  createFirstGoalButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  goalCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  goalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalCategory: {
    fontSize: 14,
    marginRight: 8,
  },
  goalPriority: {
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 4,
  },
  deleteButtonText: {
    fontSize: 20,
  },
  goalDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    width: 40,
    textAlign: 'right',
  },
  milestonesContainer: {
    marginTop: 8,
  },
  milestone: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  milestoneText: {
    fontSize: 14,
  },
});