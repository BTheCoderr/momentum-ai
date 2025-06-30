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
import { supabase } from '../lib/supabase';

interface CoachingSession {
  id: string;
  title: string;
  description: string;
  type: 'motivation' | 'strategy' | 'reflection' | 'challenge';
  completed: boolean;
  xp_reward: number;
}

export const DailyCoachingScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<CoachingSession[]>([]);

  useEffect(() => {
    loadDailyCoaching();
  }, []);

  const loadDailyCoaching = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No user found');

      // Get user's goals and recent check-ins
      const [goalsResponse, checkInsResponse] = await Promise.all([
        supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active'),
        supabase
          .from('checkins')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      if (goalsResponse.error) throw goalsResponse.error;
      if (checkInsResponse.error) throw checkInsResponse.error;

      // Generate personalized coaching sessions
      const goals = goalsResponse.data || [];
      const checkIns = checkInsResponse.data || [];

      const generatedSessions: CoachingSession[] = [
        {
          id: 'morning-motivation',
          title: 'Morning Motivation',
          description: 'Start your day with purpose and energy',
          type: 'motivation',
          completed: false,
          xp_reward: 50,
        },
        {
          id: 'goal-strategy',
          title: 'Goal Strategy Session',
          description: `Focus on your goal: ${goals[0]?.title || 'Setting new goals'}`,
          type: 'strategy',
          completed: false,
          xp_reward: 75,
        },
        {
          id: 'daily-reflection',
          title: 'Daily Reflection',
          description: 'Review your progress and learn from today',
          type: 'reflection',
          completed: false,
          xp_reward: 50,
        },
        {
          id: 'daily-challenge',
          title: 'Daily Challenge',
          description: 'Push yourself with a personalized challenge',
          type: 'challenge',
          completed: false,
          xp_reward: 100,
        },
      ];

      setSessions(generatedSessions);
    } catch (error) {
      console.error('Error loading coaching sessions:', error);
      Alert.alert('Error', 'Failed to load coaching sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = (session: CoachingSession) => {
    navigation.navigate('Chat', {
      initialPrompt: `Let's start my ${session.title.toLowerCase()} session. ${session.description}`,
      sessionId: session.id,
      xpReward: session.xp_reward,
    });
  };

  const SessionCard = ({ session }: { session: CoachingSession }) => {
    const getEmoji = (type: string) => {
      switch (type) {
        case 'motivation': return '🌟';
        case 'strategy': return '🎯';
        case 'reflection': return '🧘';
        case 'challenge': return '💪';
        default: return '✨';
      }
    };

    return (
      <TouchableOpacity
        style={styles.sessionCard}
        onPress={() => handleStartSession(session)}
      >
        <View style={styles.sessionHeader}>
          <Text style={styles.sessionEmoji}>{getEmoji(session.type)}</Text>
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionTitle}>{session.title}</Text>
            <Text style={styles.sessionDescription}>{session.description}</Text>
          </View>
        </View>
        <View style={styles.sessionFooter}>
          <Text style={styles.xpReward}>+{session.xp_reward} XP</Text>
          <Text style={styles.startButton}>Start →</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Daily Coaching</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Preparing your coaching sessions...</Text>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {sessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1b1e',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2b2e',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    color: '#4F46E5',
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
  },
  sessionCard: {
    backgroundColor: '#2a2b2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sessionEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  sessionDescription: {
    fontSize: 14,
    color: '#9ca3af',
  },
  sessionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#3a3b3e',
  },
  xpReward: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: 'bold',
  },
  startButton: {
    color: '#fff',
    fontSize: 16,
  },
}); 