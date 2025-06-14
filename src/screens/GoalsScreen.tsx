import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootTabParamList } from '../navigation';
import { LinearGradient } from 'expo-linear-gradient';
import { goalsAPI, Goal as APIGoal } from '../api/services';

type GoalsScreenNavigationProp = BottomTabNavigationProp<RootTabParamList, 'Goals'>;

interface Props {
  navigation: GoalsScreenNavigationProp;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  progress: number;
  currentStreak: number;
  bestStreak: number;
  dueDate: string;
  status: 'on-track' | 'at-risk' | 'completed';
  habits: Habit[];
  motivation: string;
}

interface Habit {
  id: string;
  title: string;
  completed: boolean;
}

export default function GoalsScreen({ navigation }: Props) {
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const goalsData = await goalsAPI.getGoals();
      setGoals(goalsData);
    } catch (error) {
      console.log('Error loading goals:', error);
      // Set mock data as fallback
      setGoals([
    {
      id: '1',
      title: 'Launch My SaaS Product',
      description: 'Build and launch my productivity app by Q2',
      progress: 65,
      currentStreak: 12,
      bestStreak: 18,
      dueDate: 'Dec 30, 2025',
      status: 'on-track',
      habits: [
        { id: '1a', title: 'Code for 2 hours', completed: true },
        { id: '1b', title: 'Write 1 blog post', completed: false },
        { id: '1c', title: 'Talk to 1 potential user', completed: true },
      ],
      motivation: 'This represents my dream of financial freedom and creative fulfillment'
    },
    {
      id: '2',
      title: 'Get in Best Shape of My Life',
      description: 'Lose 25 pounds and run a half marathon',
      progress: 40,
      currentStreak: 3,
      bestStreak: 14,
      dueDate: 'Oct 14, 2025',
      status: 'at-risk',
      habits: [
        { id: '2a', title: 'Workout for 30 minutes', completed: false },
        { id: '2b', title: 'Eat healthy meals', completed: true },
        { id: '2c', title: 'Track calories', completed: false },
      ],
      motivation: 'I want to feel confident and energetic for my family'
    }
      ]);
    }
  };

  const toggleHabit = async (goalId: string, habitId: string) => {
    try {
      await goalsAPI.toggleHabit(goalId, habitId);
      // Update local state
      setGoals(goals.map(goal => 
        goal.id === goalId 
          ? {
              ...goal,
              habits: (goal.habits || []).map(habit =>
                habit.id === habitId ? { ...habit, completed: !habit.completed } : habit
              )
            }
          : goal
      ));
         } catch (error) {
       console.log('Error toggling habit:', error);
       // Still update local state as fallback
       setGoals(goals.map(goal => 
         goal.id === goalId 
           ? {
               ...goal,
               habits: (goal.habits || []).map(habit =>
                 habit.id === habitId ? { ...habit, completed: !habit.completed } : habit
               )
             }
           : goal
       ));
     }
   };

  const handleDailyCheckIn = (goalId: string) => {
    navigation.navigate('Chat', { 
      initialPrompt: `Let's do a daily check-in for my goal: ${goals.find(g => g.id === goalId)?.title}. How am I progressing?` 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return '#16A34A';
      case 'at-risk': return '#F59E0B';
      case 'completed': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on-track': return '✅';
      case 'at-risk': return '⚠️';
      case 'completed': return '🎉';
      default: return '⏳';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={['#4F46E5', '#7C3AED']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Your Goals</Text>
            <Text style={styles.headerSubtitle}>Track your progress and stay motivated</Text>
          </View>
        </LinearGradient>

        {/* Add New Goal Button */}
        <View style={styles.addGoalContainer}>
          <TouchableOpacity 
            style={styles.addGoalButton}
            onPress={() => Alert.alert('Coming Soon', 'Goal creation feature coming soon!')}
          >
            <Text style={styles.addGoalText}>+ Add New Goal</Text>
          </TouchableOpacity>
        </View>

        {/* Goals List */}
        <View style={styles.goalsContainer}>
          {goals.map((goal) => (
            <View key={goal.id} style={styles.goalCard}>
              {/* Goal Header */}
              <View style={styles.goalHeader}>
                <View style={styles.goalTitleSection}>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(goal.status) + '20' }]}>
                    <Text style={styles.statusIcon}>{getStatusIcon(goal.status)}</Text>
                    <Text style={[styles.statusText, { color: getStatusColor(goal.status) }]}>
                      {goal.status === 'on-track' ? 'On Track' : goal.status === 'at-risk' ? 'At Risk' : 'Completed'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.goalDescription}>{goal.description}</Text>
              </View>

              {/* Progress Section */}
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Overall Progress</Text>
                  <Text style={styles.progressPercentage}>{goal.progress}%</Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBarBackground}>
                    <LinearGradient
                      colors={['#4F46E5', '#7C3AED']}
                      style={[styles.progressBarFill, { width: `${goal.progress}%` }]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    />
                  </View>
                </View>
              </View>

              {/* Stats Row */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statIcon}>🔥</Text>
                  <Text style={styles.statNumber}>{goal.currentStreak}</Text>
                  <Text style={styles.statLabel}>Current</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statIcon}>⭐</Text>
                  <Text style={styles.statNumber}>{goal.bestStreak}</Text>
                  <Text style={styles.statLabel}>Best</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statIcon}>📅</Text>
                  <Text style={styles.statNumber}>{(goal.habits || []).filter(h => h.completed).length}/{(goal.habits || []).length}</Text>
                  <Text style={styles.statLabel}>Today's Habits</Text>
                </View>
              </View>

              {/* Today's Habits */}
              <View style={styles.habitsSection}>
                <Text style={styles.habitsTitle}>Today's Habits</Text>
                {(goal.habits || []).map((habit) => (
                  <TouchableOpacity 
                    key={habit.id} 
                    style={styles.habitItem}
                    onPress={() => toggleHabit(goal.id, habit.id)}
                  >
                    <View style={[
                      styles.habitCheckbox, 
                      { backgroundColor: habit.completed ? '#16A34A' : '#E5E7EB' }
                    ]}>
                      {habit.completed && <Text style={styles.habitCheckmark}>✓</Text>}
                    </View>
                    <Text style={[
                      styles.habitText,
                      { textDecorationLine: habit.completed ? 'line-through' : 'none',
                        color: habit.completed ? '#6B7280' : '#111827' }
                    ]}>
                      {habit.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Why This Matters */}
              <View style={styles.motivationSection}>
                <Text style={styles.motivationTitle}>💜 Why This Matters</Text>
                <Text style={styles.motivationText}>"{goal.motivation}"</Text>
              </View>

              {/* Due Date */}
              <View style={styles.dueDateSection}>
                <Text style={styles.dueDateIcon}>📅</Text>
                <Text style={styles.dueDateText}>Due: {goal.dueDate}</Text>
                {goal.status === 'at-risk' && <Text style={styles.overdueText}>⚠️ Yesterday</Text>}
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.checkInButton]}
                  onPress={() => handleDailyCheckIn(goal.id)}
                >
                  <Text style={styles.checkInButtonText}>Daily Check-In</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.shareButton]}
                  onPress={() => Alert.alert('Coming Soon', 'Share progress feature coming soon!')}
                >
                  <Text style={styles.shareButtonText}>Share Progress</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#C7D2FE',
    textAlign: 'center',
  },
  addGoalContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  addGoalButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  addGoalText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  goalsContainer: {
    paddingHorizontal: 20,
  },
  goalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  goalHeader: {
    marginBottom: 20,
  },
  goalTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  goalDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  progressSection: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  progressBarContainer: {
    marginBottom: 8,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  habitsSection: {
    marginBottom: 20,
  },
  habitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  habitCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitCheckmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  habitText: {
    fontSize: 14,
    flex: 1,
  },
  motivationSection: {
    backgroundColor: '#FCE7F3',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  motivationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#BE185D',
    marginBottom: 8,
  },
  motivationText: {
    fontSize: 14,
    color: '#BE185D',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  dueDateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dueDateIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  dueDateText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  overdueText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  checkInButton: {
    backgroundColor: '#4F46E5',
  },
  checkInButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  shareButton: {
    backgroundColor: '#F3F4F6',
  },
  shareButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 20,
  },
}); 