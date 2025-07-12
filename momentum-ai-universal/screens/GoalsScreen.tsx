import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../components/ThemeProvider';
import { goalServices } from '../lib/services';
import { Goal } from '../lib/supabase';
import { GoalCreationModal } from '../components/GoalCreationModal';

export default function GoalsScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const goalsData = await goalServices.getAll();
      setGoals(Array.isArray(goalsData) ? goalsData : []);
    } catch (error) {
      console.error('Error loading goals:', error);
      Alert.alert('Error', 'Failed to load goals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = () => {
    if (goals.length >= 3) {
      Alert.alert(
        'Goal Limit Reached',
        'You can have a maximum of 3 active goals. Complete or delete an existing goal to add a new one.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }
    setShowCreateModal(true);
  };

  const handleDeleteGoal = (goalId: string) => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await goalServices.delete(goalId);
              await loadGoals();
              Alert.alert('Success', 'Goal deleted successfully!');
            } catch (error) {
              console.error('Error deleting goal:', error);
              Alert.alert('Error', 'Failed to delete goal. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleUpdateProgress = async (goalId: string, newProgress: number) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const updatedGoal = { ...goal, progress: newProgress };
      await goalServices.update(goalId, updatedGoal);
      await loadGoals();

      if (newProgress >= 100) {
        Alert.alert(
          '🎉 Goal Completed!',
          `Congratulations on completing "${goal.title}"!`,
          [{ text: 'Awesome!', style: 'default' }]
        );
      }
    } catch (error) {
      console.error('Error updating goal progress:', error);
      Alert.alert('Error', 'Failed to update progress. Please try again.');
    }
  };

  const handleGoalCreated = (goalData: any) => {
    setShowCreateModal(false);
    loadGoals();
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return theme.colors.success;
    if (progress >= 75) return '#34D399';
    if (progress >= 50) return theme.colors.warning;
    if (progress >= 25) return '#FBBF24';
    return theme.colors.textSecondary;
  };

  const getProgressQuickActions = (currentProgress: number) => {
    const actions = [];
    if (currentProgress < 25) actions.push(25);
    if (currentProgress < 50) actions.push(50);
    if (currentProgress < 75) actions.push(75);
    if (currentProgress < 100) actions.push(100);
    return actions;
  };

  if (loading) {
    return null;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>My Goals</Text>
        <TouchableOpacity onPress={handleCreateGoal} style={styles.addButton}>
          <Text style={[styles.addButtonText, { color: theme.colors.primary }]}>+ New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {goals.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🎯</Text>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Goals Yet</Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
              Create your first goal to start tracking your progress and building momentum.
            </Text>
            <TouchableOpacity
              style={[styles.createFirstGoalButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleCreateGoal}
            >
              <Text style={styles.createFirstGoalButtonText}>Create Your First Goal</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Goals Overview */}
            <View style={[styles.overviewCard, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.overviewTitle, { color: theme.colors.text }]}>Goals Overview</Text>
              <View style={styles.overviewStats}>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
                    {goals.length}
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                    Active Goals
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: theme.colors.success }]}>
                    {goals.filter(g => g.progress >= 100).length}
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                    Completed
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: theme.colors.warning }]}>
                    {Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length) || 0}%
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                    Avg Progress
                  </Text>
                </View>
              </View>
            </View>

            {/* Goals List */}
            {goals.map((goal) => (
              <View key={goal.id} style={[styles.goalCard, { backgroundColor: theme.colors.card }]}>
                <View style={styles.goalHeader}>
                  <View style={styles.goalInfo}>
                    <Text style={[styles.goalTitle, { color: theme.colors.text }]}>
                      {goal.title}
                    </Text>
                    {goal.description && (
                      <Text style={[styles.goalDescription, { color: theme.colors.textSecondary }]}>
                        {goal.description}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressSection}>
                  <View style={styles.progressHeader}>
                    <Text style={[styles.progressLabel, { color: theme.colors.text }]}>
                      Progress
                    </Text>
                    <Text style={[styles.progressPercentage, { color: getProgressColor(goal.progress) }]}>
                      {Math.round(goal.progress)}%
                    </Text>
                  </View>
                  <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          backgroundColor: getProgressColor(goal.progress),
                          width: `${Math.min(goal.progress, 100)}%`,
                        },
                      ]}
                    />
                  </View>
                </View>

                {/* Quick Progress Actions */}
                {goal.progress < 100 && (
                  <View style={styles.quickActionsSection}>
                    <Text style={[styles.quickActionsLabel, { color: theme.colors.textSecondary }]}>
                      Quick Update:
                    </Text>
                    <View style={styles.quickActions}>
                      {getProgressQuickActions(goal.progress).map((percentage) => (
                        <TouchableOpacity
                          key={percentage}
                          style={[
                            styles.quickActionButton,
                            { borderColor: theme.colors.primary }
                          ]}
                          onPress={() => handleUpdateProgress(goal.id, percentage)}
                        >
                          <Text style={[styles.quickActionText, { color: theme.colors.primary }]}>
                            {percentage}%
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {/* Goal Actions */}
                <View style={styles.goalActions}>
                  {goal.progress >= 100 ? (
                    <View style={[styles.completedBadge, { backgroundColor: theme.colors.success }]}>
                      <Text style={styles.completedText}>✓ Completed</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[styles.markCompleteButton, { backgroundColor: theme.colors.success }]}
                      onPress={() => handleUpdateProgress(goal.id, 100)}
                    >
                      <Text style={styles.markCompleteText}>Mark Complete</Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity
                    style={[styles.deleteButton, { borderColor: theme.colors.error }]}
                    onPress={() => handleDeleteGoal(goal.id)}
                  >
                    <Text style={[styles.deleteButtonText, { color: theme.colors.error }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* Add New Goal Card */}
            {goals.length < 3 && (
              <TouchableOpacity
                style={[styles.addGoalCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                onPress={handleCreateGoal}
              >
                <Text style={styles.addGoalEmoji}>➕</Text>
                <Text style={[styles.addGoalText, { color: theme.colors.text }]}>Add New Goal</Text>
                <Text style={[styles.addGoalSubtext, { color: theme.colors.textSecondary }]}>
                  {3 - goals.length} slots remaining
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>

      {/* Goal Creation Modal */}
      <GoalCreationModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleGoalCreated}
      />
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
    justifyContent: 'space-between',
  },
  backButton: {
    flex: 1,
  },
  backButtonText: {
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 2,
    textAlign: 'center',
  },
  addButton: {
    flex: 1,
    alignItems: 'flex-end',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  createFirstGoalButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createFirstGoalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  overviewCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  overviewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  overviewStats: {
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
    fontSize: 14,
    marginTop: 4,
  },
  goalCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  goalInfo: {
    flex: 1,
    marginRight: 12,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  quickActionsSection: {
    marginBottom: 16,
  },
  quickActionsLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
  },
  quickActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  goalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  completedBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  completedText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  markCompleteButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  markCompleteText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  deleteButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  addGoalCard: {
    padding: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  addGoalEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  addGoalText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  addGoalSubtext: {
    fontSize: 14,
  },
}); 