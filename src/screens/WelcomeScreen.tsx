import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Welcome: undefined;
  Auth: undefined;
  MainTabs: undefined;
  NotificationSettings: undefined;
};

type WelcomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Welcome'>;

interface Props {
  navigation: WelcomeScreenNavigationProp;
}

const { width } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [userProfile, setUserProfile] = useState({
    name: '',
    primaryGoal: '',
    motivation: '',
    preferredTime: 'morning',
    experience: 'beginner'
  });

  const steps = [
    {
      title: "Welcome to Momentum AI",
      subtitle: "Your personal AI-powered goal achievement companion",
      icon: "rocket-outline"
    },
    {
      title: "What's your name?",
      subtitle: "Let's personalize your experience",
      icon: "person-outline"
    },
    {
      title: "What's your main goal?",
      subtitle: "What would you like to achieve first?",
      icon: "trophy-outline"
    },
    {
      title: "What drives you?",
      subtitle: "Understanding your motivation helps us coach you better",
      icon: "heart-outline"
    },
    {
      title: "When do you work best?",
      subtitle: "We'll optimize your check-ins for peak performance",
      icon: "time-outline"
    },
    {
      title: "You're all set!",
      subtitle: "Ready to start your journey to success?",
      icon: "checkmark-circle-outline"
    }
  ];

  const handleNext = () => {
    if (currentStep === 1 && !userProfile.name.trim()) {
      Alert.alert('Please enter your name', 'We need to know what to call you!');
      return;
    }
    if (currentStep === 2 && !userProfile.primaryGoal.trim()) {
      Alert.alert('Please enter a goal', 'What would you like to achieve?');
      return;
    }
    if (currentStep === 3 && !userProfile.motivation.trim()) {
      Alert.alert('Please share your motivation', 'This helps us provide better coaching!');
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save profile and navigate to dashboard
      completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = async () => {
    try {
      // Here you would typically save the user profile to your backend
      console.log('User profile:', userProfile);
      
      // Navigate to authentication screen instead of MainTabs
      navigation.navigate('Auth');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save your profile. Please try again.');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.welcomeContent}>
            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <Ionicons name="analytics-outline" size={24} color="#4F46E5" />
                <Text style={styles.featureText}>AI-powered pattern recognition</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="trending-up-outline" size={24} color="#4F46E5" />
                <Text style={styles.featureText}>Personalized coaching insights</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="notifications-outline" size={24} color="#4F46E5" />
                <Text style={styles.featureText}>Smart intervention timing</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="people-outline" size={24} color="#4F46E5" />
                <Text style={styles.featureText}>Community support</Text>
              </View>
            </View>
          </View>
        );

      case 1:
        return (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your name"
              value={userProfile.name}
              onChangeText={(text) => setUserProfile({...userProfile, name: text})}
              autoFocus
            />
          </View>
        );

      case 2:
        return (
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              placeholder="e.g., Launch my startup, Get in shape, Learn a new skill..."
              value={userProfile.primaryGoal}
              onChangeText={(text) => setUserProfile({...userProfile, primaryGoal: text})}
              multiline
              numberOfLines={3}
              autoFocus
            />
          </View>
        );

      case 3:
        return (
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              placeholder="e.g., I want to provide for my family, I want to feel confident, I want to make a difference..."
              value={userProfile.motivation}
              onChangeText={(text) => setUserProfile({...userProfile, motivation: text})}
              multiline
              numberOfLines={4}
              autoFocus
            />
          </View>
        );

      case 4:
        return (
          <View style={styles.optionsContainer}>
            {[
              { key: 'morning', label: 'Morning Person', icon: 'sunny-outline', desc: '6AM - 12PM' },
              { key: 'afternoon', label: 'Afternoon Focus', icon: 'partly-sunny-outline', desc: '12PM - 6PM' },
              { key: 'evening', label: 'Night Owl', icon: 'moon-outline', desc: '6PM - 12AM' },
              { key: 'flexible', label: 'Flexible', icon: 'time-outline', desc: 'Varies by day' }
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.optionCard,
                  userProfile.preferredTime === option.key && styles.selectedOption
                ]}
                onPress={() => setUserProfile({...userProfile, preferredTime: option.key})}
              >
                <Ionicons 
                  name={option.icon as any} 
                  size={32} 
                  color={userProfile.preferredTime === option.key ? '#4F46E5' : '#6B7280'} 
                />
                <Text style={[
                  styles.optionLabel,
                  userProfile.preferredTime === option.key && styles.selectedOptionText
                ]}>
                  {option.label}
                </Text>
                <Text style={styles.optionDesc}>{option.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 5:
        return (
          <View style={styles.summaryContainer}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Your Profile</Text>
              <View style={styles.summaryItem}>
                <Ionicons name="person" size={20} color="#4F46E5" />
                <Text style={styles.summaryText}>{userProfile.name}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Ionicons name="trophy" size={20} color="#4F46E5" />
                <Text style={styles.summaryText}>{userProfile.primaryGoal}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Ionicons name="heart" size={20} color="#4F46E5" />
                <Text style={styles.summaryText}>{userProfile.motivation}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Ionicons name="time" size={20} color="#4F46E5" />
                <Text style={styles.summaryText}>
                  {userProfile.preferredTime.charAt(0).toUpperCase() + userProfile.preferredTime.slice(1)} person
                </Text>
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <LinearGradient
      colors={['#FF6B35', '#F7931E', '#FF8C42']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentStep + 1) / steps.length) * 100}%` }
              ]} 
            />
          </View>
          <View style={styles.progressTextContainer}>
            <Text style={styles.progressText}>
              {currentStep + 1} of {steps.length}
            </Text>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.contentContainer}>
          <View style={styles.iconContainer}>
            <Ionicons 
              name={steps[currentStep].icon as any} 
              size={64} 
              color="#FFFFFF" 
            />
          </View>

          <Text style={styles.title}>{steps[currentStep].title}</Text>
          <Text style={styles.subtitle}>{steps[currentStep].subtitle}</Text>

          {renderStepContent()}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          {currentStep > 0 && (
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="chevron-back" size={24} color="#4F46E5" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {currentStep === steps.length - 1 ? "Let's Go!" : "Continue"}
            </Text>
            <Ionicons name="chevron-forward" size={24} color="#4F46E5" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  progressContainer: {
    marginBottom: 40,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  progressTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 40,
    lineHeight: 24,
  },
  welcomeContent: {
    width: '100%',
  },
  featureList: {
    gap: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },
  featureText: {
    color: '#FFFFFF',
    fontSize: 16,
    flex: 1,
  },
  inputContainer: {
    width: '100%',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 56,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  optionsContainer: {
    width: '100%',
    gap: 16,
  },
  optionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: '#FFFFFF',
  },
  optionLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  selectedOptionText: {
    color: '#FFFFFF',
  },
  optionDesc: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  summaryContainer: {
    width: '100%',
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 24,
    borderRadius: 16,
  },
  summaryTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  summaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    flex: 1,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    gap: 8,
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: '600',
  },
}); 