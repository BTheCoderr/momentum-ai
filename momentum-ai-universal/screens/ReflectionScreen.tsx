import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { reflectionServices, utils, updateUserXP, getXPFromGoal, showToast } from '../lib/services';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ReflectionScreen = ({ navigation }: any) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>(['', '', '', '', '']);
  const [isCompleted, setIsCompleted] = useState(false);
  const [saving, setSaving] = useState(false);

  const reflectionQuestions = [
    {
      id: 1,
      question: "What am I most grateful for today?",
      prompt: "Think about the small and big things that brought you joy or peace...",
      emoji: "🙏"
    },
    {
      id: 2,
      question: "What challenged me today, and what did I learn from it?",
      prompt: "Consider both external challenges and internal struggles...",
      emoji: "💪"
    },
    {
      id: 3,
      question: "How did I grow or change today?",
      prompt: "Reflect on any insights, new perspectives, or personal development...",
      emoji: "🌱"
    },
    {
      id: 4,
      question: "What would I do differently if I could replay today?",
      prompt: "Be honest but compassionate with yourself...",
      emoji: "🔄"
    },
    {
      id: 5,
      question: "What intention do I want to set for tomorrow?",
      prompt: "Focus on how you want to feel and what you want to prioritize...",
      emoji: "🎯"
    }
  ];

  const handleAnswerChange = (text: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = text;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < reflectionQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleComplete = async () => {
    try {
      setSaving(true);
      
      // Get current user
      const user = await AsyncStorage.getItem('user');
      const userId = user ? JSON.parse(user).id : 'demo-user';
      
      const reflectionData = {
        userId,
        date: new Date().toISOString(),
        answers: answers,
        word_count: answers.join(' ').split(' ').filter(word => word.length > 0).length,
      };

      const savedReflection = await reflectionServices.create(reflectionData);
      
      if (savedReflection) {
        // Award XP for completing reflection
        const xpGained = getXPFromGoal('milestone');
        const xpResult = await updateUserXP(userId, xpGained, 'Reflection Complete');
        
        setIsCompleted(true);
        
        // Generate AI insight from reflection
        const aiInsight = await generateAIInsight(answers);
        
        Alert.alert(
          'Reflection Complete! 🌟',
          `Thank you for reflecting. You earned ${xpResult.xpGained} XP!${xpResult.leveledUp ? ' Level up! 🆙' : ''}\n\n💡 AI Insight: ${aiInsight}`,
          [
            {
              text: 'View More Insights',
              onPress: () => navigation.navigate('Insights'),
            },
            {
              text: 'Continue',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        throw new Error('Failed to save reflection');
      }
    } catch (error) {
      console.error('Error saving reflection:', error);
      Alert.alert('Error', 'Failed to save reflection. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const generateAIInsight = async (answers: string[]): Promise<string> => {
    try {
      // Simple AI insight generation based on reflection content
      const allText = answers.join(' ').toLowerCase();
      
      if (allText.includes('grateful') || allText.includes('thankful')) {
        return "Your gratitude practice is strengthening your positive mindset. Keep it up!";
      } else if (allText.includes('challenge') || allText.includes('difficult')) {
        return "You're showing great resilience by reflecting on challenges. Growth happens in discomfort.";
      } else if (allText.includes('goal') || allText.includes('tomorrow')) {
        return "Your forward-thinking approach shows strong goal orientation. Focus on one step at a time.";
      } else {
        return "Your self-awareness through reflection is a powerful tool for personal growth.";
      }
    } catch (error) {
      return "Your reflection shows thoughtful self-awareness. Keep up this valuable practice.";
    }
  };

  const currentQ = reflectionQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / reflectionQuestions.length) * 100;

  if (isCompleted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.completedContainer}>
          <Text style={styles.completedEmoji}>✨</Text>
          <Text style={styles.completedTitle}>Reflection Complete</Text>
          <Text style={styles.completedSubtitle}>
            Your insights have been saved and will help guide your journey.
          </Text>
          <TouchableOpacity 
            style={styles.doneButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reflection</Text>
        <TouchableOpacity 
          style={styles.skipButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {currentQuestion + 1} of {reflectionQuestions.length}
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Question Card */}
        <View style={styles.questionCard}>
          <Text style={styles.questionEmoji}>{currentQ.emoji}</Text>
          <Text style={styles.questionText}>{currentQ.question}</Text>
          <Text style={styles.questionPrompt}>{currentQ.prompt}</Text>
        </View>

        {/* Answer Input */}
        <View style={styles.answerContainer}>
          <TextInput
            style={styles.answerInput}
            value={answers[currentQuestion]}
            onChangeText={handleAnswerChange}
            placeholder="Take your time... there's no right or wrong answer."
            placeholderTextColor="#999"
            multiline
            textAlignVertical="top"
            autoFocus
          />
          
          <View style={styles.wordCountContainer}>
            <Text style={styles.wordCount}>
              {answers[currentQuestion].split(' ').filter(word => word.length > 0).length} words
            </Text>
          </View>
        </View>

        {/* Reflection Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Reflection Tips</Text>
          <Text style={styles.tipsText}>
            • Be honest and authentic with yourself{'\n'}
            • There's no judgment here - just exploration{'\n'}
            • Take as much time as you need{'\n'}
            • Let your thoughts flow naturally
          </Text>
        </View>

      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity 
          style={[styles.navButton, styles.previousButton]}
          onPress={handlePrevious}
          disabled={currentQuestion === 0}
        >
          <Text style={[
            styles.navButtonText,
            currentQuestion === 0 && styles.navButtonDisabled
          ]}>
            ← Previous
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navButton, styles.nextButton]}
          onPress={handleNext}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.navButtonText}>
              {currentQuestion === reflectionQuestions.length - 1 ? 'Complete ✨' : 'Next →'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  skipButton: {
    padding: 8,
  },
  skipButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginTop: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  questionEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 28,
  },
  questionPrompt: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  answerContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  answerInput: {
    fontSize: 16,
    color: '#1a1a1a',
    lineHeight: 24,
    minHeight: 200,
    textAlignVertical: 'top',
  },
  wordCountContainer: {
    alignItems: 'flex-end',
    marginTop: 12,
  },
  wordCount: {
    fontSize: 12,
    color: '#999',
  },
  tipsContainer: {
    backgroundColor: '#f0f7ff',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 12,
  },
  tipsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  navButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  previousButton: {
    backgroundColor: '#f0f0f0',
  },
  nextButton: {
    backgroundColor: '#007AFF',
  },
  nextButtonDisabled: {
    backgroundColor: '#ccc',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  navButtonDisabled: {
    color: '#ccc',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  completedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  completedEmoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  completedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
    textAlign: 'center',
  },
  completedSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  doneButton: {
    backgroundColor: '#34C759',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReflectionScreen; 