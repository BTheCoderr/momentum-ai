import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  targetScreen?: string;
}

interface TutorialOverlayProps {
  visible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Momentum AI! 🚀',
    description: 'Your personal AI coach is here to help you achieve your goals. Let\'s take a quick tour!',
    icon: '👋',
  },
  {
    id: 'checkin',
    title: 'Daily Check-ins 📝',
    description: 'Track your mood, energy, and progress daily. This helps your AI coach understand you better.',
    icon: '✅',
    targetScreen: 'CheckIn',
  },
  {
    id: 'coach',
    title: 'AI Coach Chat 🤖',
    description: 'Chat with 5 different AI coach personalities. They\'ll motivate, support, and guide you.',
    icon: '💬',
    targetScreen: 'AICoach',
  },
  {
    id: 'insights',
    title: 'Smart Insights 💡',
    description: 'Get personalized insights and patterns from your data. Swipe through TikTok-style cards!',
    icon: '📊',
    targetScreen: 'Insights',
  },
  {
    id: 'goals',
    title: 'Goal Management 🎯',
    description: 'Set, track, and achieve your goals with AI-powered recommendations and progress tracking.',
    icon: '🏆',
    targetScreen: 'Goals',
  },
  {
    id: 'ready',
    title: 'You\'re All Set! 🎉',
    description: 'Ready to start your journey? Your AI coach is excited to help you succeed!',
    icon: '🌟',
  },
];

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ visible, onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    await AsyncStorage.setItem('hasSeenTutorial', 'true');
    onComplete();
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('hasSeenTutorial', 'true');
    onSkip();
  };

  const step = tutorialSteps[currentStep];
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {currentStep + 1} of {tutorialSteps.length}
            </Text>
          </View>

          {/* Skip Button */}
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip Tour</Text>
          </TouchableOpacity>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.icon}>{step.icon}</Text>
            <Text style={styles.title}>{step.title}</Text>
            <Text style={styles.description}>{step.description}</Text>
          </View>

          {/* Navigation */}
          <View style={styles.navigation}>
            {currentStep > 0 && (
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Text style={styles.backButtonText}>← Back</Text>
              </TouchableOpacity>
            )}
            
            <View style={styles.spacer} />
            
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>
                {currentStep === tutorialSteps.length - 1 ? 'Get Started! 🚀' : 'Next →'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Dots Indicator */}
          <View style={styles.dotsContainer}>
            {tutorialSteps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentStep && styles.dotActive,
                ]}
              />
            ))}
          </View>

        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 20,
    padding: 30,
    maxWidth: Dimensions.get('window').width - 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  skipButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
  },
  skipText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    alignItems: 'center',
    marginVertical: 30,
  },
  icon: {
    fontSize: 64,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  backButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  spacer: {
    flex: 1,
  },
  nextButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#FF6B35',
  },
});

export default TutorialOverlay; 