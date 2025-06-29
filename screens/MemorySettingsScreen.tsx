import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useTheme } from '../components/ThemeProvider';

interface MemorySettings {
  contextRetention: number;
  personalizedLearning: boolean;
  behaviorAnalysis: boolean;
  patternRecognition: boolean;
  emotionalAwareness: boolean;
  goalAlignment: boolean;
}

export const MemorySettingsScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<MemorySettings>({
    contextRetention: 30,
    personalizedLearning: true,
    behaviorAnalysis: true,
    patternRecognition: true,
    emotionalAwareness: true,
    goalAlignment: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('user_memory_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading memory settings:', error);
      Alert.alert('Error', 'Failed to load memory settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('user_memory_settings')
        .upsert({
          user_id: user.id,
          ...settings,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      Alert.alert('Success', 'Memory settings saved successfully!');
    } catch (error) {
      console.error('Error saving memory settings:', error);
      Alert.alert('Error', 'Failed to save memory settings');
    } finally {
      setLoading(false);
    }
  };

  const SettingItem = ({ 
    title, 
    description, 
    value, 
    onToggle 
  }: { 
    title: string;
    description: string;
    value: boolean;
    onToggle: () => void;
  }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Text style={[styles.settingTitle, { color: theme.colors.text }]}>{title}</Text>
        <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
        thumbColor={value ? theme.colors.background : theme.colors.surface}
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>Memory Settings</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading settings...
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            AI Memory Configuration
          </Text>
          <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
            Control how the AI learns from and remembers your interactions
          </Text>

          <View style={styles.settingsList}>
            <SettingItem
              title="Personalized Learning"
              description="Allow AI to learn from our interactions to provide better support"
              value={settings.personalizedLearning}
              onToggle={() => setSettings(prev => ({
                ...prev,
                personalizedLearning: !prev.personalizedLearning,
              }))}
            />

            <SettingItem
              title="Behavior Analysis"
              description="Enable AI to analyze patterns in your behavior and habits"
              value={settings.behaviorAnalysis}
              onToggle={() => setSettings(prev => ({
                ...prev,
                behaviorAnalysis: !prev.behaviorAnalysis,
              }))}
            />

            <SettingItem
              title="Pattern Recognition"
              description="Let AI identify trends in your progress and challenges"
              value={settings.patternRecognition}
              onToggle={() => setSettings(prev => ({
                ...prev,
                patternRecognition: !prev.patternRecognition,
              }))}
            />

            <SettingItem
              title="Emotional Awareness"
              description="Allow AI to understand and respond to your emotional state"
              value={settings.emotionalAwareness}
              onToggle={() => setSettings(prev => ({
                ...prev,
                emotionalAwareness: !prev.emotionalAwareness,
              }))}
            />

            <SettingItem
              title="Goal Alignment"
              description="Enable AI to align its guidance with your goals"
              value={settings.goalAlignment}
              onToggle={() => setSettings(prev => ({
                ...prev,
                goalAlignment: !prev.goalAlignment,
              }))}
            />
          </View>

          <View style={styles.contextRetentionSection}>
            <Text style={[styles.contextRetentionTitle, { color: theme.colors.text }]}>
              Context Retention Period
            </Text>
            <Text style={[styles.contextRetentionDescription, { color: theme.colors.textSecondary }]}>
              How long should AI remember our conversations?
            </Text>
            <View style={styles.contextRetentionButtons}>
              {[7, 14, 30, 60, 90].map((days) => (
                <TouchableOpacity
                  key={days}
                  style={[
                    styles.contextButton,
                    { backgroundColor: theme.colors.surface },
                    settings.contextRetention === days && {
                      backgroundColor: theme.colors.primary,
                    },
                  ]}
                  onPress={() => setSettings(prev => ({
                    ...prev,
                    contextRetention: days,
                  }))}
                >
                  <Text style={[
                    styles.contextButtonText,
                    { color: theme.colors.text },
                    settings.contextRetention === days && {
                      color: theme.colors.background,
                      fontWeight: 'bold',
                    },
                  ]}>
                    {days} days
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
            onPress={saveSettings}
          >
            <Text style={[styles.saveButtonText, { color: theme.colors.background }]}>
              Save Settings
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
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
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 16,
    marginBottom: 24,
  },
  settingsList: {
    marginBottom: 32,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2b2e',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
  contextRetentionSection: {
    marginBottom: 32,
  },
  contextRetentionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  contextRetentionDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  contextRetentionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  contextButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  contextButtonText: {
    fontSize: 14,
  },
  saveButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 32,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});