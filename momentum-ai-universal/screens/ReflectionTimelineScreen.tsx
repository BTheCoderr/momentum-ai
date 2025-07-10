import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { aiService } from '../lib/ai-service';

interface TimelineEntry {
  id: string;
  date: string;
  type: 'checkin' | 'goal' | 'challenge' | 'vault';
  mood?: string;
  entry?: string;
  title?: string;
  description?: string;
  created_at: string;
}

interface InsightCard {
  title: string;
  content: string;
  type: 'pattern' | 'growth' | 'suggestion';
}

export function ReflectionTimelineScreen() {
  const { user } = useAuth();
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [insights, setInsights] = useState<InsightCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  useEffect(() => {
    if (user?.id) {
      loadTimeline();
      generateInsights();
    }
  }, [user?.id, selectedMonth]);

  const loadTimeline = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const timelineData: TimelineEntry[] = [];

      // Get date range (default to last 30 days or selected month)
      const endDate = new Date();
      const startDate = selectedMonth 
        ? new Date(`${selectedMonth}-01`)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      // Fetch check-ins
      const { data: checkins } = await supabase
        .from('checkins')
        .select('id, entry, mood, created_at')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false });

      if (checkins) {
        timelineData.push(...checkins.map(c => ({
          id: c.id,
          date: new Date(c.created_at).toLocaleDateString(),
          type: 'checkin' as const,
          mood: c.mood,
          entry: c.entry,
          created_at: c.created_at
        })));
      }

      // Fetch goals created in this period
      const { data: goals } = await supabase
        .from('goals')
        .select('id, title, description, created_at')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false });

      if (goals) {
        timelineData.push(...goals.map(g => ({
          id: g.id,
          date: new Date(g.created_at).toLocaleDateString(),
          type: 'goal' as const,
          title: g.title,
          description: g.description,
          created_at: g.created_at
        })));
      }

      // Fetch vault entries
      const { data: vaultEntries } = await supabase
        .from('vault_entries')
        .select('id, highlight, entry_type, created_at')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false });

      if (vaultEntries) {
        timelineData.push(...vaultEntries.map(v => ({
          id: v.id,
          date: new Date(v.created_at).toLocaleDateString(),
          type: 'vault' as const,
          entry: v.highlight,
          title: `${v.entry_type.charAt(0).toUpperCase()}${v.entry_type.slice(1)} Achievement`,
          created_at: v.created_at
        })));
      }

      // Sort by date
      timelineData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setTimeline(timelineData);
    } catch (error) {
      console.error('Error loading timeline:', error);
      Alert.alert('Error', 'Failed to load your reflection timeline.');
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = async () => {
    if (!user?.id || timeline.length === 0) return;

    try {
      // Generate AI insights based on timeline data
      const checkins = timeline.filter(t => t.type === 'checkin');
      const moods = checkins.map(c => c.mood).filter(Boolean);
      
      const insightsData: InsightCard[] = [];

      // Mood pattern analysis
      if (moods.length > 0) {
        const moodCounts = moods.reduce((acc, mood) => {
          acc[mood!] = (acc[mood!] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const dominantMood = Object.entries(moodCounts)
          .sort(([,a], [,b]) => b - a)[0][0];

        insightsData.push({
          title: 'Mood Patterns',
          content: `Your most frequent mood this period was "${dominantMood}". You logged ${moods.length} check-ins with emotional awareness.`,
          type: 'pattern'
        });
      }

      // Growth tracking
      const goalCount = timeline.filter(t => t.type === 'goal').length;
      const vaultCount = timeline.filter(t => t.type === 'vault').length;

      if (goalCount > 0 || vaultCount > 0) {
        insightsData.push({
          title: 'Growth Milestones',
          content: `You set ${goalCount} new goals and celebrated ${vaultCount} achievements. Your commitment to growth is showing!`,
          type: 'growth'
        });
      }

      // Weekly summary for AI suggestions
      const weeklyData = await aiService.getWeeklySummary(user.id);
      if (weeklyData && weeklyData !== 'Unable to generate summary at this time.') {
        insightsData.push({
          title: 'AI Insight',
          content: weeklyData.split('\n')[0] || 'Keep maintaining your momentum!',
          type: 'suggestion'
        });
      }

      setInsights(insightsData);
    } catch (error) {
      console.error('Error generating insights:', error);
    }
  };

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case 'checkin': return '💭';
      case 'goal': return '🎯';
      case 'challenge': return '🏆';
      case 'vault': return '⭐';
      default: return '📝';
    }
  };

  const getMoodEmoji = (mood?: string) => {
    const moodEmojis: Record<string, string> = {
      'down': '😔',
      'okay': '😐',
      'good': '🙂',
      'great': '😊',
      'amazing': '🤩',
      'tired': '😴',
      'anxious': '😰',
      'motivated': '💪',
      'energized': '⚡',
      'stressed': '😤',
      'happy': '😊',
      'confident': '😎'
    };
    return mood ? moodEmojis[mood] || '🙂' : '';
  };

  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your reflection timeline...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🗓️ Reflection Timeline</Text>
        <Text style={styles.subtitle}>Your journey of growth and self-discovery</Text>
      </View>

      {/* Insights Section */}
      {insights.length > 0 && (
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>💡 Insights</Text>
          {insights.map((insight, index) => (
            <View key={index} style={[styles.insightCard, styles[`${insight.type}Card`]]}>
              <Text style={styles.insightTitle}>{insight.title}</Text>
              <Text style={styles.insightContent}>{insight.content}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Timeline Section */}
      <View style={styles.timelineSection}>
        <Text style={styles.sectionTitle}>📚 Your Story</Text>
        {timeline.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Your reflection timeline will appear here as you continue your journey.
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Start by checking in or setting a goal!
            </Text>
          </View>
        ) : (
          timeline.map((entry, index) => (
            <View key={entry.id} style={styles.timelineItem}>
              <View style={styles.timelineIcon}>
                <Text style={styles.iconText}>{getTimelineIcon(entry.type)}</Text>
              </View>
              
              <View style={styles.timelineContent}>
                <View style={styles.timelineHeader}>
                  <Text style={styles.timelineDate}>
                    {formatRelativeDate(entry.created_at)}
                  </Text>
                  {entry.mood && (
                    <Text style={styles.moodIndicator}>
                      {getMoodEmoji(entry.mood)} {entry.mood}
                    </Text>
                  )}
                </View>
                
                {entry.title && (
                  <Text style={styles.timelineTitle}>{entry.title}</Text>
                )}
                
                {entry.entry && (
                  <Text style={styles.timelineEntry} numberOfLines={4}>
                    {entry.entry}
                  </Text>
                )}
                
                {entry.description && (
                  <Text style={styles.timelineDescription}>
                    {entry.description}
                  </Text>
                )}
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  insightsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  insightCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  patternCard: {
    backgroundColor: '#F0F8FF',
    borderLeftColor: '#007AFF',
  },
  growthCard: {
    backgroundColor: '#F0FFF0',
    borderLeftColor: '#34C759',
  },
  suggestionCard: {
    backgroundColor: '#FFF8E1',
    borderLeftColor: '#FF9500',
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  insightContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  timelineSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconText: {
    fontSize: 18,
  },
  timelineContent: {
    flex: 1,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timelineDate: {
    fontSize: 12,
    color: '#999',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  moodIndicator: {
    fontSize: 12,
    color: '#666',
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  timelineEntry: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  timelineDescription: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
}); 