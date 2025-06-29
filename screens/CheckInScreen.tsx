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
import { LinearGradient } from 'expo-linear-gradient';
import { checkinServices, userStatsServices, getXPFromCheckIn, updateUserXP, showToast } from '../lib/services';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../components/ThemeProvider';

const CheckInScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
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
    if (!wins.trim() || !priorities.trim()) {
      Alert.alert('Missing Information', 'Please share at least your wins and priorities for tomorrow.');
      return;
    }

    try {
      setLoading(true);
      
      // Get current user
      const userId = await AsyncStorage.getItem('userId') || 'demo-user';
      
      const checkInData = {
        user_id: userId,
        date: new Date().toISOString(),
        mood,
        energy,
        stress,
        wins: wins.trim(),
        challenges: challenges.trim(),
        reflection: reflection.trim(),
        priorities: priorities.trim(),
      };
      
      // Submit check-in
      const result = await checkinServices.create(checkInData);
      
      if (!result) {
        throw new Error('Failed to create check-in');
      }
      
      // Update user stats
      const stats = await userStatsServices.update(userId);
      
      // Calculate XP reward based on current streak
      const currentStreak = stats?.current_streak || 0;
      const xpGained = getXPFromCheckIn(currentStreak);
      
      // Update XP
      const xpResult = await updateUserXP(userId, xpGained, 'Daily Check-in');
      
      // Haptic feedback
      Vibration.vibrate(100);
      
      // Show success with XP
      Alert.alert(
        'Check-in Complete! 🎉',
        `Great job! You earned ${xpGained} XP${xpResult.leveledUp ? ' and leveled up! 🆙' : ''}`,
        [
          {
            text: 'Awesome!',
            onPress: () => navigation.goBack()
          }
        ]
      );
      
    } catch (error) {
      console.error('Check-in submission error:', error);
      Alert.alert(
        'Error',
        'Unable to submit check-in right now. Your progress has been saved locally.',
        [
          {
            text: 'Try Again',
            onPress: handleSubmit
          },
          {
            text: 'Save & Exit',
            onPress: () => {
              // Save to AsyncStorage for later sync
              AsyncStorage.setItem('pendingCheckIn', JSON.stringify({
                date: new Date().toISOString(),
                data: { mood, energy, stress, wins, challenges, reflection, priorities }
              }));
              navigation.goBack();
            }
          }
        ]
      );
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
      <Text style={[styles.scaleTitle, { color: theme.colors.text }]}>{title}</Text>
      <View style={styles.scaleOptions}>
        {[1, 2, 3, 4, 5].map((num) => (
          <TouchableOpacity
            key={num}
            style={[
              styles.scaleOption,
              { backgroundColor: theme.colors.surface },
              value === num && { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => onChange(num)}
          >
            <Text style={styles.scaleEmoji}>{emojis[num - 1]}</Text>
            <Text style={[
              styles.scaleLabel,
              { color: theme.colors.text },
              value === num && { color: theme.colors.background },
            ]}>
              {labels[num - 1]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} />
      
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backButtonText, { color: theme.colors.text }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Daily Check-In</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ScaleSelector
          title="How are you feeling today?"
          value={mood}
          onChange={setMood}
          emojis={moodEmojis}
          labels={['Terrible', 'Bad', 'Okay', 'Good', 'Amazing']}
        />

        <ScaleSelector
          title="What's your energy level?"
          value={energy}
          onChange={setEnergy}
          emojis={energyEmojis}
          labels={['Drained', 'Low', 'Moderate', 'High', 'Energized']}
        />

        <ScaleSelector
          title="How stressed do you feel?"
          value={stress}
          onChange={setStress}
          emojis={stressEmojis}
          labels={['Relaxed', 'Calm', 'Tense', 'Stressed', 'Overwhelmed']}
        />

        <View style={styles.textSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>🏆 Today's Wins</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>What went well today?</Text>
          <TextInput
            style={[styles.textInput, { 
              backgroundColor: theme.colors.surface,
              color: theme.colors.text,
              borderColor: theme.colors.border
            }]}
            value={wins}
            onChangeText={setWins}
            placeholder="• Completed morning workout&#10;• Had a great meeting&#10;• Tried something new"
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={styles.textSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>🤔 Challenges</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>What was difficult today?</Text>
          <TextInput
            style={[styles.textInput, { 
              backgroundColor: theme.colors.surface,
              color: theme.colors.text,
              borderColor: theme.colors.border
            }]}
            value={challenges}
            onChangeText={setChallenges}
            placeholder="• Felt distracted during work&#10;• Skipped lunch again&#10;• Procrastinated on important task"
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={styles.textSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>📝 Tomorrow's Priorities</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>What do you want to focus on?</Text>
          <TextInput
            style={[styles.textInput, { 
              backgroundColor: theme.colors.surface,
              color: theme.colors.text,
              borderColor: theme.colors.border
            }]}
            value={priorities}
            onChangeText={setPriorities}
            placeholder="• Complete project presentation&#10;• Exercise for 30 minutes&#10;• Call mom"
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: theme.colors.primary },
            loading && { opacity: 0.7 }
          ]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Complete Check-In</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 50,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  scaleContainer: {
    marginBottom: 24,
  },
  scaleTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  scaleOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scaleOption: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
  },
  scaleEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  scaleLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  textSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  textInput: {
    height: 100,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  submitButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 24,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default CheckInScreen; 