import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, SafeAreaView, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { CoachPersonality, CoachPersonalityEngine } from '../lib/coach-personality';
import { createChallenge, generatePodInviteCode } from '../lib/pod-challenges';
import { useTheme } from '../components/ThemeProvider';
import { LoadingState } from '../components/LoadingState';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 1,
    title: 'Set Your First Goal',
    description: 'What would you like to focus on? This will help us personalize your experience.',
  },
  {
    id: 2,
    title: 'Choose Your Coach Style',
    description: 'Select the coaching personality that resonates with you most.',
  },
  {
    id: 3,
    title: 'Your First Check-in',
    description: 'Tell us how you\'re feeling today and what\'s on your mind.',
  },
  {
    id: 4,
    title: 'Join the Community',
    description: 'Connect with others or create your own accountability pod.',
  },
];

const coachStyles: Array<{ type: CoachPersonality; name: string; emoji: string; description: string }> = [
  {
    type: 'motivational',
    name: 'Motivational Coach',
    emoji: '🔥',
    description: 'Energetic and inspiring, focused on pushing you to achieve your best',
  },
  {
    type: 'analytical',
    name: 'Analytical Coach',
    emoji: '📊',
    description: 'Data-driven and strategic, helps you understand patterns and make informed decisions',
  },
  {
    type: 'supportive',
    name: 'Supportive Coach',
    emoji: '🫂',
    description: 'Empathetic and understanding, helps you navigate challenges with compassion',
  },
];

export function OnboardingFlowScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userPreferences, setUserPreferences] = useState({
    goals: [],
    coachStyle: '',
    reminderTime: '',
  });

  // Step 1: Goal
  const [goalTitle, setGoalTitle] = useState('');
  
  // Step 2: Coach
  const [selectedCoach, setSelectedCoach] = useState<CoachPersonality>('motivational');
  
  // Step 3: Check-in
  const [checkinEntry, setCheckinEntry] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  
  // Step 4: Pod
  const [podChoice, setPodChoice] = useState<'create' | 'join' | 'skip'>('create');
  const [podName, setPodName] = useState('');

  useEffect(() => {
    loadCurrentStep();
  }, [user?.id]);

  const loadCurrentStep = async () => {
    if (!user?.id) return;
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('onboarding_step, onboarding_complete')
      .eq('id', user.id)
      .single();
    
    if (error) {
      console.error('Error loading onboarding step:', error);
      return;
    }
    
    if (profile?.onboarding_complete) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
      return;
    }
    
    setCurrentStep(profile?.onboarding_step || 1);
  };

  const updateOnboardingStep = async (step: number) => {
    if (!user?.id) return;
    
    const { error } = await supabase
      .from('profiles')
      .update({ onboarding_step: step })
      .eq('id', user.id);

    if (error) {
      console.error('Error updating onboarding step:', error);
    }
  };

  const completeOnboarding = async () => {
    if (!user?.id) return;
    
    const { error } = await supabase
      .from('profiles')
      .update({ 
        onboarding_complete: true,
        onboarding_step: 4 
      })
      .eq('id', user.id);

    if (error) {
      console.error('Error completing onboarding:', error);
      return;
    }
    
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };

  const handleNext = async () => {
    try {
      if (currentStep < onboardingSteps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        setLoading(true);
        // Save user preferences
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No authenticated user');

        const { error } = await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            goals: userPreferences.goals,
            coach_style: userPreferences.coachStyle,
            reminder_time: userPreferences.reminderTime,
          });

        if (error) throw error;

        // Navigate to home screen
        navigation.replace('MainTabs');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert('Error', 'Failed to save your preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGoalSubmission = async () => {
    if (!goalTitle.trim()) {
      Alert.alert('Required', 'Please enter a goal to continue.');
      return;
    }
    
    const { error } = await supabase
      .from('goals')
      .insert({
        user_id: user!.id,
        title: goalTitle.trim(),
        description: 'My first goal from onboarding',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  };

  const handleCoachSelection = async () => {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        coach_personality: selectedCoach 
      })
      .eq('id', user!.id);

    if (error) throw error;
  };

  const handleCheckinSubmission = async () => {
    if (!checkinEntry.trim() || !selectedMood) {
      Alert.alert('Required', 'Please complete your check-in to continue.');
      return;
    }
    
    const { error } = await supabase
      .from('checkins')
      .insert({
        user_id: user!.id,
        entry: checkinEntry.trim(),
        mood: parseInt(selectedMood),
        date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  };

  const handlePodSetup = async () => {
    if (podChoice === 'create' && !podName.trim()) {
      Alert.alert('Required', 'Please enter a pod name to continue.');
      return;
    }

    if (podChoice === 'create') {
      const { error } = await supabase
        .from('pods')
        .insert({
          name: podName.trim(),
          created_by: user!.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    }

    await completeOnboarding();
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return goalTitle.trim().length > 0;
      case 2: return true; // Coach is pre-selected
      case 3: return checkinEntry.trim().length > 0 && selectedMood.length > 0;
      case 4: return podChoice === 'skip' || (podChoice === 'create' && podName.trim().length > 0) || podChoice === 'join';
      default: return false;
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      {onboardingSteps.map((_, index) => (
        <View
          key={index}
          style={[
            styles.progressDot,
            {
              backgroundColor: index <= currentStep ? theme.colors.primary : theme.colors.border,
            },
          ]}
        />
      ))}
    </View>
  );

  const renderStepContent = () => {
    if (loading) {
      return <LoadingState type="full" message="Setting up your experience..." />;
    }

    const step = onboardingSteps[currentStep];
    return (
      <View style={styles.stepContent}>
        <Text style={[styles.stepTitle, { color: theme.colors.text }]}>{step.title}</Text>
        <Text style={[styles.stepDescription, { color: theme.colors.text }]}>
          {step.description}
        </Text>
        {/* Add specific step content here */}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderProgressBar()}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderStepContent()}
      </ScrollView>
      <View style={styles.buttonContainer}>
        {currentStep > 0 && (
          <TouchableOpacity
            style={[styles.button, styles.backButton]}
            onPress={handleBack}
          >
            <Text style={[styles.buttonText, { color: theme.colors.text }]}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.button, styles.nextButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleNext}
        >
          <Text style={[styles.buttonText, { color: theme.colors.background }]}>
            {currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  scrollView: {
    flex: 1,
  },
  stepContent: {
    padding: 24,
    flex: 1,
    justifyContent: 'center',
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ccc',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: 'transparent',
  },
  nextButton: {
    flex: 1,
    marginLeft: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 