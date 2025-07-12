import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Platform, SafeAreaView } from 'react-native';
import { checkinServices } from '../lib/services';
import { useAuth } from '../hooks/useAuth';
import analytics from '../lib/analytics';
import { useTheme } from '../components/ThemeProvider';
import { LinearGradient } from 'expo-linear-gradient';

interface CheckInScreenProps {
  navigation: any;
}

const moods = [
  { emoji: '😢', label: 'Very Bad', value: 1, color: '#ef4444' },
  { emoji: '😞', label: 'Bad', value: 2, color: '#f97316' },
  { emoji: '😐', label: 'Okay', value: 3, color: '#eab308' },
  { emoji: '😊', label: 'Good', value: 4, color: '#22c55e' },
  { emoji: '😄', label: 'Very Good', value: 5, color: '#10b981' },
];

const energyLevels = [
  { icon: '🔋', label: 'Very Low', value: 1 },
  { icon: '🔋🔋', label: 'Low', value: 2 },
  { icon: '🔋🔋🔋', label: 'Medium', value: 3 },
  { icon: '🔋🔋🔋🔋', label: 'High', value: 4 },
  { icon: '🔋🔋🔋🔋🔋', label: 'Very High', value: 5 },
];

const stressLevels = [
  { emoji: '😌', label: 'Very Low', value: 1, color: '#10b981' },
  { emoji: '🙂', label: 'Low', value: 2, color: '#22c55e' },
  { emoji: '😐', label: 'Medium', value: 3, color: '#eab308' },
  { emoji: '😰', label: 'High', value: 4, color: '#f97316' },
  { emoji: '😱', label: 'Very High', value: 5, color: '#ef4444' },
];

export const CheckInScreen: React.FC<CheckInScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [mood, setMood] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [stress, setStress] = useState<number | null>(null);
  const [wentWell, setWentWell] = useState('');
  const [couldImprove, setCouldImprove] = useState('');
  const [gratitude, setGratitude] = useState('');
  const [tomorrowGoals, setTomorrowGoals] = useState('');
  const [loading, setLoading] = useState(false);

  const getMoodDescription = (value: number): string => {
    const descriptions = {
      1: "It's okay to have tough days. Tomorrow is a new opportunity! 💪",
      2: "Rough day? You're stronger than you know. Keep going! 🌟",
      3: "Steady progress is still progress. You're doing great! ⚡",
      4: "Good vibes! You're on the right track. Keep it up! 🎉",
      5: "Amazing energy! You're crushing it today! 🚀"
    };
    return descriptions[value as keyof typeof descriptions] || '';
  };

  const handleSubmit = async () => {
    if (!mood || !energy || !stress) {
      Alert.alert('Missing Information', 'Please select your mood, energy, and stress levels.');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'Please sign in to submit a check-in.');
      return;
    }

    setLoading(true);
    try {
      const checkinData = {
        mood,
        energy,
        stress,
        went_well: wentWell.trim(),
        could_improve: couldImprove.trim(),
        gratitude: gratitude.trim(),
        tomorrow_goals: tomorrowGoals.trim(),
        user_id: user.id,
      };

      // Calculate XP reward (10-40 XP based on completion)
      const xpReward = 10 + 
        (wentWell.length > 0 ? 5 : 0) + 
        (couldImprove.length > 0 ? 5 : 0) + 
        (gratitude.length > 0 ? 10 : 0) + 
        (tomorrowGoals.length > 0 ? 10 : 0);

      // Save check-in
      await checkinServices.create(user.id, checkinData);

      // Track analytics
      await analytics.track('checkin_completed', {
        mood,
        energy,
        stress,
        fields_completed: {
          went_well: wentWell.length > 0,
          could_improve: couldImprove.length > 0,
          gratitude: gratitude.length > 0,
          tomorrow_goals: tomorrowGoals.length > 0
        },
        xp_earned: xpReward
      });

      // Show success message
      Alert.alert(
        'Check-in Complete! 🎉',
        `You earned ${xpReward} XP! ${getMoodDescription(mood)}`,
        [
          {
            text: 'Talk to Coach',
            onPress: () => navigation.navigate('Coach', { 
              context: { 
                mood, 
                energy, 
                stress, 
                went_well: wentWell,
                could_improve: couldImprove,
                gratitude,
                tomorrow_goals: tomorrowGoals,
                checkInCompleted: true 
              }
            })
          },
          {
            text: 'Continue',
            onPress: () => navigation.goBack()
          }
        ]
      );

    } catch (error) {
      console.error('Check-in error:', error);
      Alert.alert('Error', 'Failed to save check-in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#FF6B35', '#F7931E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.title}>Daily Check-In</Text>
        <Text style={styles.subtitle}>How are you feeling today?</Text>
      </LinearGradient>

      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Mood Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mood</Text>
          <View style={styles.optionsContainer}>
            {moods.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.optionCard,
                  mood === item.value && { backgroundColor: item.color + '20', borderColor: item.color }
                ]}
                onPress={() => setMood(item.value)}
              >
                <Text style={styles.optionEmoji}>{item.emoji}</Text>
                <Text style={[
                  styles.optionLabel,
                  mood === item.value && { color: item.color }
                ]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {mood && (
            <Text style={[styles.description, { color: moods[mood - 1].color }]}>
              {getMoodDescription(mood)}
            </Text>
          )}
        </View>

        {/* Energy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Energy Level</Text>
          <View style={styles.optionsContainer}>
            {energyLevels.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.optionCard,
                  energy === item.value && { backgroundColor: '#3b82f620', borderColor: '#3b82f6' }
                ]}
                onPress={() => setEnergy(item.value)}
              >
                <Text style={styles.optionEmoji}>{item.icon}</Text>
                <Text style={[
                  styles.optionLabel,
                  energy === item.value && { color: '#3b82f6' }
                ]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Stress Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stress Level</Text>
          <View style={styles.optionsContainer}>
            {stressLevels.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.optionCard,
                  stress === item.value && { backgroundColor: item.color + '20', borderColor: item.color }
                ]}
                onPress={() => setStress(item.value)}
              >
                <Text style={styles.optionEmoji}>{item.emoji}</Text>
                <Text style={[
                  styles.optionLabel,
                  stress === item.value && { color: item.color }
                ]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Reflection Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Wins 🌟</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="What went well today? Share your achievements..."
            placeholderTextColor="#9ca3af"
            value={wentWell}
            onChangeText={setWentWell}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Areas for Growth 🌱</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="What could have gone better? Be honest but kind to yourself..."
            placeholderTextColor="#9ca3af"
            value={couldImprove}
            onChangeText={setCouldImprove}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gratitude 🙏</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="What are you grateful for today?"
            placeholderTextColor="#9ca3af"
            value={gratitude}
            onChangeText={setGratitude}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tomorrow's Goals 🎯</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="What do you want to accomplish tomorrow?"
            placeholderTextColor="#9ca3af"
            value={tomorrowGoals}
            onChangeText={setTomorrowGoals}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!mood || !energy || !stress || loading) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={!mood || !energy || !stress || loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Saving...' : 'Complete Check-In'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.9,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  optionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '18%',
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  optionEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
  },
  noteInput: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#374151',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
    ...Platform.select({
      ios: {
        shadowOpacity: 0.1,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default CheckInScreen;