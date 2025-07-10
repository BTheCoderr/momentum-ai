import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from './ThemeProvider';
import { useAuth } from '../hooks/useAuth';
import { enhancedInsightsServices } from '../lib/services-rag-enhanced';
import { PatternInsight } from '../lib/pattern-engine';
import { Goal } from '../lib/supabase';

const { width } = Dimensions.get('window');

interface CheckInData {
  id: string;
  mood: number;
  energy: number;
  stress: number;
  productivity: number;
  date: string;
  dayOfWeek: string;
  timeOfDay: string;
  notes?: string;
}

interface SmartSuggestion {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  icon: string;
  actionText: string;
}

interface AIInsightsProps {
  goals?: Goal[];
  showSuggestions?: boolean;
  compact?: boolean;
}

export const AIInsights: React.FC<AIInsightsProps> = ({ 
  goals = [], 
  showSuggestions = true,
  compact = false 
}) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [insights, setInsights] = useState<PatternInsight[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'patterns' | 'suggestions' | 'predictions'>('patterns');
  const [predictions, setPredictions] = useState<{ nextWeek: string; confidence: number } | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadInsights();
    }
  }, [user?.id]);

  const loadInsights = async () => {
    try {
      setLoading(true);
      
      // Get personalized insights with enhanced pattern recognition
      const personalizedInsights = await enhancedInsightsServices.getPersonalizedInsights(user?.id);
      
      if (personalizedInsights) {
        setInsights(personalizedInsights.behavioral_insights || []);
        setSuggestions(personalizedInsights.personalized_recommendations);
        setPredictions(personalizedInsights.predictions || null);
      }

    } catch (error) {
      console.error('Error loading AI insights:', error);
      setFallbackData();
    } finally {
      setLoading(false);
    }
  };

  const setFallbackData = () => {
    setInsights([{
      id: 'getting-started',
      title: 'Building Your Pattern Profile',
      description: "Keep logging check-ins for personalized insights! I'll learn your patterns as you use the app.",
      confidence: 0.9,
      category: 'behavioral',
      actionable: true,
      recommendations: ['Complete daily check-ins', 'Be consistent with timing', 'Add detailed reflections']
    }]);
    setSuggestions([
      'Complete your first check-in to get personalized suggestions',
      'Try checking in at the same time each day',
      'Add detailed notes about your activities'
    ]);
    setPredictions(null);
  };

  const getCategoryColor = (category: string): string[] => {
    switch (category) {
      case 'mood':
        return ['#FF6B6B22', '#4ECDC422'];
      case 'energy':
        return ['#FFE66D22', '#4ECDC422'];
      case 'productivity':
        return ['#4ECDC422', '#95E1D322'];
      case 'behavioral':
        return ['#95E1D322', '#4ECDC422'];
      case 'temporal':
        return ['#4ECDC422', '#FFE66D22'];
      case 'correlation':
        return ['#FF6B6B22', '#95E1D322'];
      case 'prediction':
        return ['#95E1D322', '#FFE66D22'];
      default:
        return ['#4ECDC422', '#95E1D322'];
    }
  };

  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case 'mood': return '😊';
      case 'energy': return '⚡';
      case 'productivity': return '📈';
      case 'behavioral': return '🎯';
      case 'temporal': return '⏰';
      case 'correlation': return '🔄';
      case 'prediction': return '🔮';
      default: return '💡';
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[
            styles.tab, 
            selectedTab === 'patterns' && styles.activeTab,
            { borderColor: theme.colors.border }
          ]}
          onPress={() => setSelectedTab('patterns')}
        >
          <Text style={[
            styles.tabText,
            selectedTab === 'patterns' && styles.activeTabText,
            { color: theme.colors.text }
          ]}>Patterns</Text>
        </TouchableOpacity>
        
        {showSuggestions && (
          <TouchableOpacity 
            style={[
              styles.tab, 
              selectedTab === 'suggestions' && styles.activeTab,
              { borderColor: theme.colors.border }
            ]}
            onPress={() => setSelectedTab('suggestions')}
          >
            <Text style={[
              styles.tabText,
              selectedTab === 'suggestions' && styles.activeTabText,
              { color: theme.colors.text }
            ]}>Suggestions</Text>
          </TouchableOpacity>
        )}

        {predictions && (
          <TouchableOpacity 
            style={[
              styles.tab, 
              selectedTab === 'predictions' && styles.activeTab,
              { borderColor: theme.colors.border }
            ]}
            onPress={() => setSelectedTab('predictions')}
          >
            <Text style={[
              styles.tabText,
              selectedTab === 'predictions' && styles.activeTabText,
              { color: theme.colors.text }
            ]}>Forecast</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content}>
        {selectedTab === 'patterns' && (
          insights.map((insight) => (
            <LinearGradient
              key={insight.id}
              colors={getCategoryColor(insight.category)}
              style={[styles.card, { marginBottom: 10 }]}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.icon}>{getCategoryIcon(insight.category)}</Text>
                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{insight.title}</Text>
              </View>
              <Text style={[styles.insight, { color: theme.colors.text }]}>{insight.description}</Text>
              {insight.actionable && (
                <View style={styles.recommendationsContainer}>
                  {insight.recommendations.map((rec, index) => (
                    <Text key={index} style={[styles.recommendation, { color: theme.colors.text }]}>
                      • {rec}
                    </Text>
                  ))}
                </View>
              )}
              <View style={styles.confidenceContainer}>
                <Text style={[styles.confidenceText, { color: theme.colors.text }]}>
                  Confidence: {(insight.confidence * 100).toFixed(0)}%
                </Text>
              </View>
            </LinearGradient>
          ))
        )}

        {selectedTab === 'suggestions' && (
          <View style={styles.suggestionsContainer}>
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.suggestionCard, { backgroundColor: theme.colors.card }]}
                onPress={() => {/* Handle suggestion action */}}
              >
                <Text style={styles.icon}>💡</Text>
                <View style={styles.suggestionContent}>
                  <Text style={[styles.suggestionText, { color: theme.colors.text }]}>
                    {suggestion}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {selectedTab === 'predictions' && predictions && (
          <LinearGradient
            colors={getCategoryColor('prediction')}
            style={[styles.card, { marginBottom: 10 }]}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.icon}>🔮</Text>
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Next Week's Forecast</Text>
            </View>
            <Text style={[styles.insight, { color: theme.colors.text }]}>{predictions.nextWeek}</Text>
            <View style={styles.confidenceContainer}>
              <Text style={[styles.confidenceText, { color: theme.colors.text }]}>
                Confidence: {(predictions.confidence * 100).toFixed(0)}%
              </Text>
            </View>
          </LinearGradient>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
  },
  activeTabText: {
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  card: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  icon: {
    fontSize: 24,
  },
  insight: {
    fontSize: 16,
    lineHeight: 22,
  },
  recommendationsContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ffffff22',
  },
  recommendation: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 5,
  },
  confidenceContainer: {
    marginTop: 10,
    alignItems: 'flex-end',
  },
  confidenceText: {
    fontSize: 12,
    opacity: 0.8,
  },
  suggestionsContainer: {
    flex: 1,
  },
  suggestionCard: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  suggestionContent: {
    flex: 1,
    marginLeft: 10,
  },
  suggestionText: {
    fontSize: 16,
    lineHeight: 22,
  },
});

export default AIInsights; 