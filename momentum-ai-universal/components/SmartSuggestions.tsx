import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from './ThemeProvider';
import { getSuggestions, getCoachingMessage } from '../lib/ai-insights';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface CheckInData {
  mood: number;
  energy: number;
  stress: number;
  productivity: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  notes?: string;
}

interface Suggestion {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'wellness' | 'productivity' | 'energy' | 'mindfulness';
  urgency: 'high' | 'medium' | 'low';
  duration: string;
  actionText: string;
}

interface SmartSuggestionsProps {
  visible: boolean;
  checkInData: CheckInData;
  onClose: () => void;
  onActionTaken?: (suggestion: Suggestion) => void;
}

export const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({
  visible,
  checkInData,
  onClose,
  onActionTaken
}) => {
  const { theme } = useTheme();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const slideAnim = new Animated.Value(Dimensions.get('window').height);

  useEffect(() => {
    if (visible) {
      generateSmartSuggestions();
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: Dimensions.get('window').height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, checkInData]);

  const generateSmartSuggestions = () => {
    const suggestions: Suggestion[] = [];
    const { mood, energy, stress, productivity, timeOfDay } = checkInData;

    // High stress suggestions
    if (stress >= 8) {
      suggestions.push({
        id: 'stress-relief-urgent',
        title: 'Immediate Stress Relief',
        description: 'Your stress level is high. Take 5 deep breaths and try a quick grounding exercise.',
        icon: '🧘',
        category: 'wellness',
        urgency: 'high',
        duration: '5 minutes',
        actionText: 'Start Breathing Exercise'
      });
    } else if (stress >= 6) {
      suggestions.push({
        id: 'stress-management',
        title: 'Stress Management',
        description: 'Feeling a bit stressed? A short walk or stretching can help reset your mind.',
        icon: '🚶',
        category: 'wellness',
        urgency: 'medium',
        duration: '10 minutes',
        actionText: 'Take a Break'
      });
    }

    // Low energy suggestions
    if (energy <= 3) {
      if (timeOfDay === 'morning') {
        suggestions.push({
          id: 'morning-energy-boost',
          title: 'Morning Energy Boost',
          description: 'Low energy this morning? Try some light stretching and drink a glass of water.',
          icon: '☀️',
          category: 'energy',
          urgency: 'medium',
          duration: '10 minutes',
          actionText: 'Energize Now'
        });
      } else if (timeOfDay === 'afternoon') {
        suggestions.push({
          id: 'afternoon-recharge',
          title: 'Afternoon Recharge',
          description: 'Beat the afternoon slump! A 5-minute walk or healthy snack can re-energize you.',
          icon: '🍎',
          category: 'energy',
          urgency: 'medium',
          duration: '5-10 minutes',
          actionText: 'Recharge'
        });
      } else {
        suggestions.push({
          id: 'evening-wind-down',
          title: 'Evening Wind-down',
          description: 'Low energy in the evening is natural. Consider preparing for quality rest.',
          icon: '🌙',
          category: 'wellness',
          urgency: 'low',
          duration: '15 minutes',
          actionText: 'Prepare for Rest'
        });
      }
    } else if (energy >= 8) {
      suggestions.push({
        id: 'harness-high-energy',
        title: 'Harness Your Energy',
        description: 'Great energy levels! This is perfect time to tackle your most challenging task.',
        icon: '⚡',
        category: 'productivity',
        urgency: 'high',
        duration: '25-45 minutes',
        actionText: 'Tackle Priority Task'
      });
    }

    // Low mood suggestions
    if (mood <= 4) {
      suggestions.push({
        id: 'mood-lifter',
        title: 'Quick Mood Lifter',
        description: 'Feeling down? Try listening to uplifting music, calling a friend, or doing something creative.',
        icon: '🌈',
        category: 'wellness',
        urgency: 'medium',
        duration: '10-15 minutes',
        actionText: 'Lift Spirits'
      });
    } else if (mood >= 8) {
      suggestions.push({
        id: 'maintain-good-mood',
        title: 'Maintain This Momentum',
        description: 'Your mood is great! Consider tackling a goal or doing something meaningful while you feel positive.',
        icon: '🌟',
        category: 'productivity',
        urgency: 'medium',
        duration: '20-30 minutes',
        actionText: 'Use This Energy'
      });
    }

    // Low productivity suggestions
    if (productivity <= 4) {
      if (energy >= 6) {
        suggestions.push({
          id: 'productivity-boost',
          title: 'Productivity Reset',
          description: 'Having trouble focusing? Try the Pomodoro technique: 25 minutes focused work, then 5 minute break.',
          icon: '🍅',
          category: 'productivity',
          urgency: 'medium',
          duration: '30 minutes',
          actionText: 'Start Pomodoro'
        });
      } else {
        suggestions.push({
          id: 'energy-first',
          title: 'Energy Before Productivity',
          description: 'Low energy affects productivity. Address your energy first with movement or nutrition.',
          icon: '🔋',
          category: 'energy',
          urgency: 'medium',
          duration: '15 minutes',
          actionText: 'Boost Energy First'
        });
      }
    }

    // Time-based suggestions
    if (timeOfDay === 'morning') {
      if (mood >= 6 && energy >= 6) {
        suggestions.push({
          id: 'morning-power-hour',
          title: 'Morning Power Hour',
          description: 'Perfect morning energy! Consider dedicating the next hour to your most important goal.',
          icon: '🎯',
          category: 'productivity',
          urgency: 'high',
          duration: '60 minutes',
          actionText: 'Start Power Hour'
        });
      }
    } else if (timeOfDay === 'evening') {
      suggestions.push({
        id: 'evening-reflection',
        title: 'Evening Reflection',
        description: 'End your day mindfully. Reflect on wins, lessons learned, and tomorrow\'s priorities.',
        icon: '📔',
        category: 'mindfulness',
        urgency: 'low',
        duration: '10 minutes',
        actionText: 'Reflect & Plan'
      });
    }

    // Balanced state suggestions
    if (mood >= 6 && energy >= 6 && stress <= 5 && productivity >= 6) {
      suggestions.push({
        id: 'optimal-state',
        title: 'You\'re in Flow State!',
        description: 'Everything looks balanced! This is an ideal time for creative work or learning something new.',
        icon: '🌊',
        category: 'productivity',
        urgency: 'medium',
        duration: '45-60 minutes',
        actionText: 'Enter Deep Work'
      });
    }

    // Wellness reminders
    suggestions.push({
      id: 'hydration-reminder',
      title: 'Hydration Check',
      description: 'When did you last drink water? Staying hydrated boosts energy and mood.',
      icon: '💧',
      category: 'wellness',
      urgency: 'low',
      duration: '1 minute',
      actionText: 'Drink Water'
    });

    // Prioritize suggestions by urgency and relevance
    const prioritizedSuggestions = suggestions
      .sort((a, b) => {
        const urgencyOrder = { high: 3, medium: 2, low: 1 };
        return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
      })
      .slice(0, 3); // Show top 3 suggestions

    setSuggestions(prioritizedSuggestions);
  };

  const handleSuggestionSelect = (suggestion: Suggestion) => {
    setSelectedSuggestion(suggestion);
  };

  const handleActionTaken = () => {
    if (selectedSuggestion && onActionTaken) {
      onActionTaken(selectedSuggestion);
    }
    onClose();
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'wellness': return '#10B981';
      case 'productivity': return '#3B82F6';
      case 'energy': return '#F59E0B';
      case 'mindfulness': return '#8B5CF6';
      default: return theme.colors.primary;
    }
  };

  const getUrgencyColor = (urgency: string): string => {
    switch (urgency) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            { 
              backgroundColor: theme.colors.background,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Header */}
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>AI Recommendations</Text>
              <Text style={styles.headerSubtitle}>
                Based on your check-in, here are some personalized suggestions
              </Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </LinearGradient>

          {/* Suggestions List */}
          <View style={styles.content}>
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={suggestion.id}
                style={[
                  styles.suggestionCard,
                  { 
                    backgroundColor: theme.colors.surface,
                    borderLeftColor: getCategoryColor(suggestion.category)
                  },
                  selectedSuggestion?.id === suggestion.id && {
                    backgroundColor: theme.colors.primary + '20',
                    borderColor: theme.colors.primary
                  }
                ]}
                onPress={() => handleSuggestionSelect(suggestion)}
              >
                <View style={styles.suggestionHeader}>
                  <Text style={styles.suggestionIcon}>{suggestion.icon}</Text>
                  <View style={styles.badges}>
                    <View style={[
                      styles.urgencyBadge,
                      { backgroundColor: getUrgencyColor(suggestion.urgency) }
                    ]}>
                      <Text style={styles.badgeText}>{suggestion.urgency}</Text>
                    </View>
                    <Text style={[styles.duration, { color: theme.colors.textSecondary }]}>
                      {suggestion.duration}
                    </Text>
                  </View>
                </View>
                
                <Text style={[styles.suggestionTitle, { color: theme.colors.text }]}>
                  {suggestion.title}
                </Text>
                
                <Text style={[styles.suggestionDescription, { color: theme.colors.textSecondary }]}>
                  {suggestion.description}
                </Text>

                {selectedSuggestion?.id === suggestion.id && (
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                    onPress={handleActionTaken}
                  >
                    <Text style={styles.actionButtonText}>
                      {suggestion.actionText}
                    </Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))}

            {/* Bottom actions */}
            <View style={styles.bottomActions}>
              <TouchableOpacity
                style={[styles.skipButton, { borderColor: theme.colors.border }]}
                onPress={onClose}
              >
                <Text style={[styles.skipButtonText, { color: theme.colors.textSecondary }]}>
                  Maybe Later
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.exploreButton, { backgroundColor: theme.colors.surface }]}
                onPress={() => {
                  // Navigate to more suggestions or insights
                  onClose();
                }}
              >
                <Text style={[styles.exploreButtonText, { color: theme.colors.text }]}>
                  💡 Explore More Tips
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    minHeight: '60%',
  },
  header: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    position: 'relative',
  },
  headerContent: {
    alignItems: 'center',
    paddingRight: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 18,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  suggestionCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  suggestionIcon: {
    fontSize: 32,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  duration: {
    fontSize: 12,
    fontWeight: '500',
  },
  suggestionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  suggestionDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  exploreButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  exploreButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SmartSuggestions; 