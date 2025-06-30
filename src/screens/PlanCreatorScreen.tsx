import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, TextInput, Alert } from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootTabParamList } from '../navigation';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { goalsAPI, Goal } from '../api/services';

type PlanCreatorNavigationProp = BottomTabNavigationProp<RootTabParamList, 'Chat'>;

interface Props {
  navigation: PlanCreatorNavigationProp;
}

interface PlanTemplate {
  id: string;
  title: string;
  description: string;
  icon: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  categories: string[];
}

const planTemplates: PlanTemplate[] = [
  {
    id: 'fitness',
    title: 'Fitness & Health',
    description: 'Build consistent workout habits and improve your health',
    icon: '💪',
    duration: '4-8 weeks',
    difficulty: 'Beginner',
    categories: ['Exercise', 'Nutrition', 'Sleep']
  },
  {
    id: 'business',
    title: 'Business Growth',
    description: 'Launch or scale your business with actionable steps',
    icon: '🚀',
    duration: '8-12 weeks',
    difficulty: 'Intermediate',
    categories: ['Strategy', 'Marketing', 'Revenue']
  },
  {
    id: 'learning',
    title: 'Skill Development',
    description: 'Master new skills and advance your career',
    icon: '📚',
    duration: '6-10 weeks',
    difficulty: 'Beginner',
    categories: ['Learning', 'Practice', 'Application']
  },
  {
    id: 'financial',
    title: 'Financial Freedom',
    description: 'Build wealth, save money, and achieve financial goals',
    icon: '💰',
    duration: '12+ weeks',
    difficulty: 'Intermediate',
    categories: ['Saving', 'Investing', 'Income']
  },
  {
    id: 'relationships',
    title: 'Relationships',
    description: 'Improve personal and professional relationships',
    icon: '❤️',
    duration: '4-6 weeks',
    difficulty: 'Beginner',
    categories: ['Communication', 'Connection', 'Boundaries']
  },
  {
    id: 'custom',
    title: 'Custom Plan',
    description: 'Create a completely personalized plan for your unique goals',
    icon: '🎯',
    duration: 'Flexible',
    difficulty: 'Advanced',
    categories: ['Custom']
  }
];

export default function PlanCreatorScreen({ navigation }: Props) {
  const [selectedTemplate, setSelectedTemplate] = useState<PlanTemplate | null>(null);
  const [customGoal, setCustomGoal] = useState('');
  const [timeframe, setTimeframe] = useState('4 weeks');
  const [userGoals, setUserGoals] = useState<Goal[]>([]);
  const [step, setStep] = useState<'template' | 'customize' | 'review'>('template');

  useEffect(() => {
    loadUserGoals();
  }, []);

  const loadUserGoals = async () => {
    try {
      const goals = await goalsAPI.getGoals();
      setUserGoals(goals);
    } catch (error) {
      console.log('Error loading goals:', error);
    }
  };

  const handleTemplateSelect = (template: PlanTemplate) => {
    setSelectedTemplate(template);
    if (template.id === 'custom') {
      setStep('customize');
    } else {
      setStep('customize');
    }
  };

  const handleCreatePlan = async () => {
    if (!selectedTemplate) return;

    try {
      // Navigate to chat with detailed plan creation prompt
      const planPrompt = selectedTemplate.id === 'custom' 
        ? `Create a detailed ${timeframe} plan for: "${customGoal}". Include weekly milestones, daily actions, and success metrics.`
        : `Create a detailed ${timeframe} ${selectedTemplate.title} plan. Include weekly milestones, daily actions, and success metrics. Focus on: ${selectedTemplate.categories.join(', ')}.`;

      navigation.navigate('Chat', { 
        initialPrompt: planPrompt
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to create plan. Please try again.');
    }
  };

  const renderTemplateSelection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Choose Your Plan Type</Text>
      <Text style={styles.sectionSubtitle}>Select a template or create a custom plan</Text>
      
      <View style={styles.templatesGrid}>
        {planTemplates.map((template) => (
          <TouchableOpacity
            key={template.id}
            style={[
              styles.templateCard,
              selectedTemplate?.id === template.id && styles.templateCardSelected
            ]}
            onPress={() => handleTemplateSelect(template)}
          >
            <Text style={styles.templateIcon}>{template.icon}</Text>
            <Text style={styles.templateTitle}>{template.title}</Text>
            <Text style={styles.templateDescription}>{template.description}</Text>
            <View style={styles.templateMeta}>
              <Text style={styles.templateDuration}>{template.duration}</Text>
              <Text style={[
                styles.templateDifficulty,
                { color: template.difficulty === 'Beginner' ? '#16A34A' : 
                         template.difficulty === 'Intermediate' ? '#D97706' : '#DC2626' }
              ]}>
                {template.difficulty}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderCustomization = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Customize Your Plan</Text>
      <Text style={styles.sectionSubtitle}>
        {selectedTemplate?.id === 'custom' 
          ? 'Tell us about your specific goal'
          : `Customize your ${selectedTemplate?.title} plan`
        }
      </Text>

      {selectedTemplate?.id === 'custom' && (
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>What's your goal?</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., Learn Spanish, Start a podcast, Run a marathon..."
            value={customGoal}
            onChangeText={setCustomGoal}
            multiline
          />
        </View>
      )}

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Timeframe</Text>
        <View style={styles.timeframeOptions}>
          {['2 weeks', '4 weeks', '8 weeks', '12 weeks', '6 months'].map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.timeframeOption,
                timeframe === option && styles.timeframeOptionSelected
              ]}
              onPress={() => setTimeframe(option)}
            >
              <Text style={[
                styles.timeframeText,
                timeframe === option && styles.timeframeTextSelected
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {userGoals.length > 0 && (
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Related Goals</Text>
          <Text style={styles.inputSubtext}>
            This plan will help with your existing goals:
          </Text>
          {userGoals.slice(0, 3).map((goal) => (
            <View key={goal.id} style={styles.relatedGoal}>
              <Text style={styles.relatedGoalText}>🎯 {goal.title}</Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.createButton} onPress={handleCreatePlan}>
        <LinearGradient
          colors={['#FF6B35', '#F7931E']}
          style={styles.createButtonGradient}
        >
          <Text style={styles.createButtonText}>Create My Plan 🚀</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Plan Creator</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {step === 'template' && renderTemplateSelection()}
        {step === 'customize' && renderCustomization()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  placeholder: {
    width: 24,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  templatesGrid: {
    gap: 16,
  },
  templateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  templateCardSelected: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  templateIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  templateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  templateDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  templateMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  templateDuration: {
    fontSize: 12,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  templateDifficulty: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  inputSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  timeframeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeframeOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  timeframeOptionSelected: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  timeframeText: {
    fontSize: 14,
    color: '#6B7280',
  },
  timeframeTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  relatedGoal: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  relatedGoalText: {
    fontSize: 14,
    color: '#16A34A',
  },
  createButton: {
    marginTop: 32,
  },
  createButtonGradient: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
}); 