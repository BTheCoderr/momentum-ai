import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { ProgressVisualizations } from '../components/ProgressVisualizations';
import { goalServices, userStatsServices } from '../lib/services';

export default function AnalysisScreen() {
  const [loading, setLoading] = React.useState(true);
  const [goals, setGoals] = React.useState([]);
  const [stats, setStats] = React.useState({
    current_streak: 0,
    best_streak: 0,
    total_checkins: 0,
    total_goals: 0,
    completed_goals: 0,
    totalXP: 0,
    level: 1,
    motivationScore: 0,
  });

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [goalsData, statsData] = await Promise.all([
        goalServices.getAll(),
        userStatsServices.get(),
      ]);
      setGoals(goalsData || []);
      setStats(statsData || {
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
      console.error('Error loading analysis data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <ProgressVisualizations goals={goals} stats={stats} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
}); 