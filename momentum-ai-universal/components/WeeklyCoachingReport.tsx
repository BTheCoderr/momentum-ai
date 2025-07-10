import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { aiService } from '../lib/ai-service';
import { CoachPersonalityEngine } from '../lib/coach-personality';

interface Props {
  userId: string;
}

export function WeeklyCoachingReport({ userId }: Props) {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState('');
  const [error, setError] = useState('');
  
  const coachEngine = new CoachPersonalityEngine();

  useEffect(() => {
    async function loadReport() {
      try {
        setLoading(true);
        const summary = await aiService.getWeeklySummary(userId);
        const coachFeedback = await coachEngine.analyzeProgress(userId);
        
        setReport(`${summary}\n\n👨‍🏫 Coach's Feedback:\n${coachFeedback}`);
        setError('');
      } catch (err) {
        console.error('Error loading weekly report:', err);
        setError('Unable to load your weekly report. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    loadReport();
  }, [userId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Analyzing your week...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Weekly Coaching Report</Text>
      <View style={styles.card}>
        <Text style={styles.reportText}>{report}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportText: {
    fontSize: 16,
    lineHeight: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    color: '#FF3B30',
    textAlign: 'center',
  },
}); 