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
  Vibration,
} from 'react-native';
import { checkinServices, userStatsServices, getXPFromCheckIn, updateUserXP, showToast } from '../lib/services';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CheckInScreen = ({ navigation }: any) => {
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [stress, setStress] = useState(3);
  const [wins, setWins] = useState('');
  const [challenges, setChallenges] = useState('');
  const [reflection, setReflection] = useState('');
  const [priorities, setPriorities] = useState('');
  const [loading, setLoading] = useState(false);

  const moodEmojis = ['😔', '😕', '😐', '🙂', '😊'];
  const energyEmojis = ['🔋', '🪫', '⚡', '🔥', '⭐'];
  const stressEmojis = ['😌', '😐', '😰', '😫', '🤯'];

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const user = await AsyncStorage.getItem('user');
      const userId = user ? JSON.parse(user).id : 'demo-user';
      
      const checkInData = {
        userId,
        date: new Date().toISOString(),
        mood,
        energy,
        stress,
        wins,
        challenges,
        reflection,
        priorities,
      };
      
      // Submit check-in
      await checkinServices.create(checkInData);
      
      // Update user stats
      await userStatsServices.update('demo-user');
      
      // Calculate XP reward based on current streak
      const currentStreak = 3; // You'd get this from user stats
      const xpGained = getXPFromCheckIn(currentStreak);
      const xpResult = await updateUserXP(userId, xpGained, 'Daily Check-in');
      
      // Haptic feedback
      Vibration.vibrate(100);
      
      // Show success with XP
      Alert.alert(
        'Check-in Complete! 🎉',
        `Great job! You earned ${xpResult.xpGained} XP${xpResult.leveledUp ? ' and leveled up! 🆙' : ''}`,
        [
          {
            text: 'Awesome!',
            onPress: () => navigation.goBack()
          }
        ]
      );
      
    } catch (error) {
      console.error('Check-in submission error:', error);
      Alert.alert('Error', 'Failed to submit check-in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const ScaleSelector = ({ 
    title, 
    value, 
    onChange, 
    emojis, 
    labels 
  }: {
    title: string;
    value: number;
    onChange: (val: number) => void;
    emojis: string[];
    labels: string[];
  }) => (
    <View style={styles.scaleContainer}>
      <Text style={styles.scaleTitle}>{title}</Text>
      <View style={styles.scaleOptions}>
        {[1, 2, 3, 4, 5].map((num) => (
          <TouchableOpacity
            key={num}
            style={[
              styles.scaleOption,
              value === num && styles.scaleOptionSelected,
            ]}
            onPress={() => onChange(num)}
          >
            <Text style={styles.scaleEmoji}>{emojis[num - 1]}</Text>
            <Text style={[
              styles.scaleLabel,
              value === num && styles.scaleLabelSelected,
            ]}>
              {labels[num - 1]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daily Check-In</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Mood Scale */}
        <ScaleSelector
          title="How are you feeling today?"
          value={mood}
          onChange={setMood}
          emojis={moodEmojis}
          labels={['Terrible', 'Bad', 'Okay', 'Good', 'Amazing']}
        />

        {/* Energy Scale */}
        <ScaleSelector
          title="What's your energy level?"
          value={energy}
          onChange={setEnergy}
          emojis={energyEmojis}
          labels={['Drained', 'Low', 'Moderate', 'High', 'Energized']}
        />

        {/* Stress Scale */}
        <ScaleSelector
          title="How stressed do you feel?"
          value={stress}
          onChange={setStress}
          emojis={stressEmojis}
          labels={['Relaxed', 'Calm', 'Tense', 'Stressed', 'Overwhelmed']}
        />

        {/* Wins */}
        <View style={styles.textSection}>
          <Text style={styles.sectionTitle}>🏆 Today's Wins</Text>
          <Text style={styles.sectionSubtitle}>What went well today?</Text>
          <TextInput
            style={styles.textInput}
            value={wins}
            onChangeText={setWins}
            placeholder="• Completed morning workout&#10;• Had a great meeting&#10;• Tried something new"
            placeholderTextColor="#999"
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Challenges */}
        <View style={styles.textSection}>
          <Text style={styles.sectionTitle}>🤔 Challenges</Text>
          <Text style={styles.sectionSubtitle}>What was difficult today?</Text>
          <TextInput
            style={styles.textInput}
            value={challenges}
            onChangeText={setChallenges}
            placeholder="• Felt distracted during work&#10;• Skipped lunch again&#10;• Procrastinated on important task"
            placeholderTextColor="#999"
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Tomorrow's Priorities */}
        <View style={styles.textSection}>
          <Text style={styles.sectionTitle}>🎯 Tomorrow's Priorities</Text>
          <Text style={styles.sectionSubtitle}>What are your top 3 priorities?</Text>
          <TextInput
            style={styles.textInput}
            value={priorities}
            onChangeText={setPriorities}
            placeholder="• Finish project proposal&#10;• Call mom&#10;• 30-minute walk"
            placeholderTextColor="#999"
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Reflection */}
        <View style={styles.textSection}>
          <Text style={styles.sectionTitle}>💭 Reflection</Text>
          <Text style={styles.sectionSubtitle}>Any other thoughts or insights?</Text>
          <TextInput
            style={[styles.textInput, styles.reflectionInput]}
            value={reflection}
            onChangeText={setReflection}
            placeholder="How did today make you feel? What did you learn? What would you do differently?"
            placeholderTextColor="#999"
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.submitButtonText}>Saving...</Text>
            </View>
          ) : (
            <Text style={styles.submitButtonText}>Complete Check-In ✨</Text>
          )}
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
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
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  placeholder: {
    width: 60,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scaleContainer: {
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
  scaleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
    textAlign: 'center',
  },
  scaleOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scaleOption: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    minWidth: 60,
  },
  scaleOptionSelected: {
    backgroundColor: '#007AFF',
  },
  scaleEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  scaleLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  scaleLabelSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  textSection: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1a1a1a',
    minHeight: 100,
    backgroundColor: '#f8f9fa',
  },
  reflectionInput: {
    minHeight: 120,
  },
  submitButton: {
    backgroundColor: '#34C759',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  bottomPadding: {
    height: 40,
  },
  submitButtonDisabled: {
    backgroundColor: '#999',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CheckInScreen; 