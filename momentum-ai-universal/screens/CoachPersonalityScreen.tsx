import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../components/ThemeProvider';
import { userSettingsServices } from '../lib/services';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PersonalityTrait {
  id: string;
  name: string;
  description: string;
  emoji: string;
  value: number;
}

interface CoachPersonality {
  primaryStyle: string;
  traits: PersonalityTrait[];
  communicationPreferences: {
    formality: number; // 0-100 (casual to formal)
    directness: number; // 0-100 (gentle to direct)
    enthusiasm: number; // 0-100 (calm to enthusiastic)
    supportiveness: number; // 0-100 (challenging to supportive)
  };
  responseLength: 'brief' | 'balanced' | 'detailed';
  useEmojis: boolean;
  useHumor: boolean;
}

const personalityStyles = [
  {
    id: 'encouraging',
    name: 'Encouraging',
    emoji: '🌟',
    description: 'Supportive and uplifting, focuses on positive reinforcement and motivation',
    example: '"You\'re making great progress! I believe in your ability to reach your goals."'
  },
  {
    id: 'strict',
    name: 'Strict',
    emoji: '🎯',
    description: 'Direct and focused, emphasizes discipline and accountability',
    example: '"Let\'s get serious about your commitment. No excuses, just action."'
  },
  {
    id: 'motivational',
    name: 'Motivational',
    emoji: '🔥',
    description: 'High-energy and inspiring, pushes you to exceed your limits',
    example: '"You\'ve got this! Push through and show yourself what you\'re capable of!"'
  },
  {
    id: 'analytical',
    name: 'Analytical',
    emoji: '📊',
    description: 'Data-driven and logical, focuses on strategies and insights',
    example: '"Based on your patterns, adjusting this approach could improve your success rate by 30%."'
  },
  {
    id: 'friendly',
    name: 'Friendly',
    emoji: '😊',
    description: 'Warm and conversational, like talking to a supportive friend',
    example: '"Hey there! How are you feeling about your progress today?"'
  },
  {
    id: 'wise',
    name: 'Wise Mentor',
    emoji: '🧙‍♂️',
    description: 'Thoughtful and philosophical, shares deeper insights and life wisdom',
    example: '"Growth often happens in the space between comfort and challenge. What will you choose?"'
  }
];

export default function CoachPersonalityScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [personality, setPersonality] = useState<CoachPersonality>({
    primaryStyle: 'encouraging',
    traits: [],
    communicationPreferences: {
      formality: 40,
      directness: 50,
      enthusiasm: 70,
      supportiveness: 80,
    },
    responseLength: 'balanced',
    useEmojis: true,
    useHumor: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPersonalitySettings();
  }, []);

  const loadPersonalitySettings = async () => {
    try {
      setLoading(true);
      const savedSettings = await userSettingsServices.getCoachPersonality();
      if (savedSettings) {
        setPersonality(savedSettings);
      }
    } catch (error) {
      console.error('Error loading personality settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      await userSettingsServices.saveCoachPersonality(personality);
      Alert.alert('Success', 'Coach personality updated successfully!');
    } catch (error) {
      console.error('Error saving personality settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleStyleChange = (styleId: string) => {
    setPersonality(prev => ({
      ...prev,
      primaryStyle: styleId
    }));
  };

  const handleCommunicationChange = (trait: keyof CoachPersonality['communicationPreferences'], value: number) => {
    setPersonality(prev => ({
      ...prev,
      communicationPreferences: {
        ...prev.communicationPreferences,
        [trait]: value
      }
    }));
  };

  const handleToggleSetting = (setting: 'useEmojis' | 'useHumor') => {
    setPersonality(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleResponseLengthChange = (length: CoachPersonality['responseLength']) => {
    setPersonality(prev => ({
      ...prev,
      responseLength: length
    }));
  };

  const getTraitLabel = (trait: string, value: number) => {
    switch (trait) {
      case 'formality':
        if (value < 33) return 'Casual';
        if (value < 67) return 'Balanced';
        return 'Formal';
      case 'directness':
        if (value < 33) return 'Gentle';
        if (value < 67) return 'Balanced';
        return 'Direct';
      case 'enthusiasm':
        if (value < 33) return 'Calm';
        if (value < 67) return 'Moderate';
        return 'Enthusiastic';
      case 'supportiveness':
        if (value < 33) return 'Challenging';
        if (value < 67) return 'Balanced';
        return 'Very Supportive';
      default:
        return 'Balanced';
    }
  };

  const selectedStyle = personalityStyles.find(style => style.id === personality.primaryStyle);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading personality settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>Coach Personality</Text>
        <TouchableOpacity onPress={saveSettings} style={styles.saveButton}>
          {saving ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <Text style={[styles.saveButtonText, { color: theme.colors.primary }]}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Style Preview */}
        {selectedStyle && (
          <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Current Style</Text>
            <View style={styles.currentStyleCard}>
              <View style={styles.currentStyleHeader}>
                <Text style={styles.currentStyleEmoji}>{selectedStyle.emoji}</Text>
                <Text style={[styles.currentStyleName, { color: theme.colors.text }]}>{selectedStyle.name}</Text>
              </View>
              <Text style={[styles.currentStyleDescription, { color: theme.colors.textSecondary }]}>
                {selectedStyle.description}
              </Text>
              <View style={[styles.exampleContainer, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.exampleLabel, { color: theme.colors.textSecondary }]}>Example:</Text>
                <Text style={[styles.exampleText, { color: theme.colors.text }]}>{selectedStyle.example}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Personality Styles */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Choose Your Coach Style</Text>
          <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
            Select the primary personality that best matches how you'd like your coach to communicate
          </Text>
          
          <View style={styles.stylesGrid}>
            {personalityStyles.map((style) => (
              <TouchableOpacity
                key={style.id}
                style={[
                  styles.styleCard,
                  {
                    backgroundColor: personality.primaryStyle === style.id 
                      ? theme.colors.primary 
                      : theme.colors.surface,
                    borderColor: theme.colors.border,
                  }
                ]}
                onPress={() => handleStyleChange(style.id)}
              >
                <Text style={styles.styleEmoji}>{style.emoji}</Text>
                <Text style={[
                  styles.styleName,
                  { 
                    color: personality.primaryStyle === style.id 
                      ? '#fff' 
                      : theme.colors.text 
                  }
                ]}>
                  {style.name}
                </Text>
                <Text style={[
                  styles.styleDescription,
                  { 
                    color: personality.primaryStyle === style.id 
                      ? 'rgba(255,255,255,0.8)' 
                      : theme.colors.textSecondary 
                  }
                ]}>
                  {style.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Communication Preferences */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Fine-tune Communication</Text>
          <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
            Adjust specific aspects of how your coach communicates
          </Text>
          
          <View style={styles.sliderGroup}>
            <View style={styles.sliderItem}>
              <View style={styles.sliderHeader}>
                <Text style={[styles.sliderLabel, { color: theme.colors.text }]}>Formality</Text>
                <Text style={[styles.sliderValue, { color: theme.colors.primary }]}>
                  {getTraitLabel('formality', personality.communicationPreferences.formality)}
                </Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={100}
                value={personality.communicationPreferences.formality}
                onValueChange={(value) => handleCommunicationChange('formality', value)}
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor={theme.colors.border}
                thumbTintColor={theme.colors.primary}
              />
              <View style={styles.sliderLabels}>
                <Text style={[styles.sliderLabelText, { color: theme.colors.textSecondary }]}>Casual</Text>
                <Text style={[styles.sliderLabelText, { color: theme.colors.textSecondary }]}>Formal</Text>
              </View>
            </View>

            <View style={styles.sliderItem}>
              <View style={styles.sliderHeader}>
                <Text style={[styles.sliderLabel, { color: theme.colors.text }]}>Directness</Text>
                <Text style={[styles.sliderValue, { color: theme.colors.primary }]}>
                  {getTraitLabel('directness', personality.communicationPreferences.directness)}
                </Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={100}
                value={personality.communicationPreferences.directness}
                onValueChange={(value) => handleCommunicationChange('directness', value)}
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor={theme.colors.border}
                thumbTintColor={theme.colors.primary}
              />
              <View style={styles.sliderLabels}>
                <Text style={[styles.sliderLabelText, { color: theme.colors.textSecondary }]}>Gentle</Text>
                <Text style={[styles.sliderLabelText, { color: theme.colors.textSecondary }]}>Direct</Text>
              </View>
            </View>

            <View style={styles.sliderItem}>
              <View style={styles.sliderHeader}>
                <Text style={[styles.sliderLabel, { color: theme.colors.text }]}>Enthusiasm</Text>
                <Text style={[styles.sliderValue, { color: theme.colors.primary }]}>
                  {getTraitLabel('enthusiasm', personality.communicationPreferences.enthusiasm)}
                </Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={100}
                value={personality.communicationPreferences.enthusiasm}
                onValueChange={(value) => handleCommunicationChange('enthusiasm', value)}
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor={theme.colors.border}
                thumbTintColor={theme.colors.primary}
              />
              <View style={styles.sliderLabels}>
                <Text style={[styles.sliderLabelText, { color: theme.colors.textSecondary }]}>Calm</Text>
                <Text style={[styles.sliderLabelText, { color: theme.colors.textSecondary }]}>Enthusiastic</Text>
              </View>
            </View>

            <View style={styles.sliderItem}>
              <View style={styles.sliderHeader}>
                <Text style={[styles.sliderLabel, { color: theme.colors.text }]}>Supportiveness</Text>
                <Text style={[styles.sliderValue, { color: theme.colors.primary }]}>
                  {getTraitLabel('supportiveness', personality.communicationPreferences.supportiveness)}
                </Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={100}
                value={personality.communicationPreferences.supportiveness}
                onValueChange={(value) => handleCommunicationChange('supportiveness', value)}
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor={theme.colors.border}
                thumbTintColor={theme.colors.primary}
              />
              <View style={styles.sliderLabels}>
                <Text style={[styles.sliderLabelText, { color: theme.colors.textSecondary }]}>Challenging</Text>
                <Text style={[styles.sliderLabelText, { color: theme.colors.textSecondary }]}>Supportive</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Response Preferences */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Response Preferences</Text>
          
          <View style={styles.preferenceGroup}>
            <Text style={[styles.preferenceLabel, { color: theme.colors.text }]}>Response Length</Text>
            <View style={styles.responseLengthOptions}>
              {[
                { id: 'brief', label: 'Brief', description: 'Short and to the point' },
                { id: 'balanced', label: 'Balanced', description: 'Just right amount of detail' },
                { id: 'detailed', label: 'Detailed', description: 'Comprehensive explanations' }
              ].map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.responseLengthOption,
                    {
                      backgroundColor: personality.responseLength === option.id 
                        ? theme.colors.primary 
                        : theme.colors.surface,
                      borderColor: theme.colors.border,
                    }
                  ]}
                  onPress={() => handleResponseLengthChange(option.id as CoachPersonality['responseLength'])}
                >
                  <Text style={[
                    styles.responseLengthLabel,
                    { 
                      color: personality.responseLength === option.id 
                        ? '#fff' 
                        : theme.colors.text 
                    }
                  ]}>
                    {option.label}
                  </Text>
                  <Text style={[
                    styles.responseLengthDescription,
                    { 
                      color: personality.responseLength === option.id 
                        ? 'rgba(255,255,255,0.8)' 
                        : theme.colors.textSecondary 
                    }
                  ]}>
                    {option.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.preferenceGroup}>
            <Text style={[styles.preferenceLabel, { color: theme.colors.text }]}>Additional Options</Text>
            
            <TouchableOpacity
              style={styles.toggleOption}
              onPress={() => handleToggleSetting('useEmojis')}
            >
              <View style={styles.toggleInfo}>
                <Text style={[styles.toggleTitle, { color: theme.colors.text }]}>Use Emojis</Text>
                <Text style={[styles.toggleDescription, { color: theme.colors.textSecondary }]}>
                  Add emojis to make responses more expressive
                </Text>
              </View>
              <View style={[
                styles.toggleSwitch,
                { backgroundColor: personality.useEmojis ? theme.colors.primary : theme.colors.border }
              ]}>
                <Text style={styles.toggleSwitchText}>
                  {personality.useEmojis ? '✓' : ''}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toggleOption}
              onPress={() => handleToggleSetting('useHumor')}
            >
              <View style={styles.toggleInfo}>
                <Text style={[styles.toggleTitle, { color: theme.colors.text }]}>Use Humor</Text>
                <Text style={[styles.toggleDescription, { color: theme.colors.textSecondary }]}>
                  Include appropriate humor and lighthearted moments
                </Text>
              </View>
              <View style={[
                styles.toggleSwitch,
                { backgroundColor: personality.useHumor ? theme.colors.primary : theme.colors.border }
              ]}>
                <Text style={styles.toggleSwitchText}>
                  {personality.useHumor ? '✓' : ''}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Test Your Coach */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Test Your Coach</Text>
          <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
            Want to see how your coach would respond? Save your settings and start a conversation!
          </Text>
          <TouchableOpacity
            style={[styles.testButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => {
              // Save settings first, then navigate to test
              saveSettings().then(() => {
                navigation.navigate('TestCoach' as never);
              });
            }}
          >
            <Text style={styles.testButtonText}>💬 Start Test Conversation</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    flex: 1,
  },
  backButtonText: {
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 2,
    textAlign: 'center',
  },
  saveButton: {
    flex: 1,
    alignItems: 'flex-end',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  currentStyleCard: {
    padding: 16,
    borderRadius: 12,
  },
  currentStyleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  currentStyleEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  currentStyleName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  currentStyleDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  exampleContainer: {
    padding: 12,
    borderRadius: 8,
  },
  exampleLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  exampleText: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  stylesGrid: {
    gap: 12,
  },
  styleCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  styleEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  styleName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  styleDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  sliderGroup: {
    gap: 24,
  },
  sliderItem: {
    paddingBottom: 8,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sliderLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  sliderValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sliderLabelText: {
    fontSize: 12,
  },
  preferenceGroup: {
    marginBottom: 24,
  },
  preferenceLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  responseLengthOptions: {
    gap: 8,
  },
  responseLengthOption: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  responseLengthLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  responseLengthDescription: {
    fontSize: 12,
  },
  toggleOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  toggleDescription: {
    fontSize: 14,
  },
  toggleSwitch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleSwitchText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  testButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 