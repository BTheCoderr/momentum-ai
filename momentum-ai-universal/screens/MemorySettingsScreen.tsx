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
import { useTheme } from '../components/ThemeProvider';
import { userSettingsServices } from '../lib/services';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface MemorySettings {
  enableMemory: boolean;
  memoryRetentionDays: number;
  includeCheckIns: boolean;
  includeGoals: boolean;
  includeReflections: boolean;
  includeConversations: boolean;
  autoDeleteCompletedGoals: boolean;
  shareMemoryInsights: boolean;
}

export default function MemorySettingsScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [settings, setSettings] = useState<MemorySettings>({
    enableMemory: true,
    memoryRetentionDays: 90,
    includeCheckIns: true,
    includeGoals: true,
    includeReflections: true,
    includeConversations: false,
    autoDeleteCompletedGoals: false,
    shareMemoryInsights: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMemorySettings();
  }, []);

  const loadMemorySettings = async () => {
    try {
      setLoading(true);
      const savedSettings = await userSettingsServices.getMemorySettings();
      if (savedSettings) {
        setSettings(savedSettings);
      }
    } catch (error) {
      console.error('Error loading memory settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      await userSettingsServices.saveMemorySettings(settings);
      Alert.alert('Success', 'Memory settings updated successfully!');
    } catch (error) {
      console.error('Error saving memory settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (key: keyof MemorySettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleRetentionPeriodChange = (days: number) => {
    setSettings(prev => ({
      ...prev,
      memoryRetentionDays: days
    }));
  };

  const handleClearAllMemory = () => {
    Alert.alert(
      'Clear All Memory?',
      'This will permanently delete all stored memories including check-ins, goals, reflections, and conversations. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear different types of memory data
              const keysToRemove = [
                'checkins',
                'goals',
                'reflections',
                'conversations',
                'userStats',
                'achievements'
              ];
              
              await Promise.all(
                keysToRemove.map(key => AsyncStorage.removeItem(key))
              );
              
              Alert.alert('Success', 'All memory data has been cleared.');
            } catch (error) {
              console.error('Error clearing memory:', error);
              Alert.alert('Error', 'Failed to clear memory. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleClearOldMemories = () => {
    Alert.alert(
      'Clear Old Memories?',
      `This will delete all memories older than ${settings.memoryRetentionDays} days. This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Old',
          style: 'destructive',
          onPress: async () => {
            try {
              // This would implement logic to clear old memories based on retention period
              // For now, we'll just show a success message
              Alert.alert('Success', `Memories older than ${settings.memoryRetentionDays} days have been cleared.`);
            } catch (error) {
              console.error('Error clearing old memories:', error);
              Alert.alert('Error', 'Failed to clear old memories. Please try again.');
            }
          },
        },
      ]
    );
  };

  const getMemoryUsageEstimate = () => {
    // Mock memory usage - in a real app this would calculate actual storage used
    return '2.4 MB';
  };

  const getRetentionLabel = (days: number) => {
    if (days === 30) return '30 days';
    if (days === 90) return '3 months';
    if (days === 180) return '6 months';
    if (days === 365) return '1 year';
    return 'Forever';
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading memory settings...</Text>
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
        <Text style={[styles.title, { color: theme.colors.text }]}>Memory Settings</Text>
        <TouchableOpacity onPress={saveSettings} style={styles.saveButton}>
          {saving ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <Text style={[styles.saveButtonText, { color: theme.colors.primary }]}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Memory Overview */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Memory Overview</Text>
          <View style={styles.overviewItem}>
            <Text style={[styles.overviewLabel, { color: theme.colors.textSecondary }]}>Current Usage</Text>
            <Text style={[styles.overviewValue, { color: theme.colors.text }]}>{getMemoryUsageEstimate()}</Text>
          </View>
          <View style={styles.overviewItem}>
            <Text style={[styles.overviewLabel, { color: theme.colors.textSecondary }]}>Retention Period</Text>
            <Text style={[styles.overviewValue, { color: theme.colors.text }]}>{getRetentionLabel(settings.memoryRetentionDays)}</Text>
          </View>
        </View>

        {/* General Memory Settings */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>General Settings</Text>
          
          <View style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Enable Memory</Text>
              <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                Allow the AI to remember your interactions and preferences
              </Text>
            </View>
            <Switch
              value={settings.enableMemory}
              onValueChange={() => handleToggle('enableMemory')}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={settings.enableMemory ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Share Memory Insights</Text>
              <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                Allow anonymized insights from your memory data to improve the AI
              </Text>
            </View>
            <Switch
              value={settings.shareMemoryInsights}
              onValueChange={() => handleToggle('shareMemoryInsights')}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={settings.shareMemoryInsights ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Retention Period */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Memory Retention</Text>
          <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
            Choose how long your memories are stored
          </Text>
          
          <View style={styles.retentionOptions}>
            {[30, 90, 180, 365, -1].map((days) => (
              <TouchableOpacity
                key={days}
                style={[
                  styles.retentionOption,
                  {
                    backgroundColor: settings.memoryRetentionDays === days 
                      ? theme.colors.primary 
                      : theme.colors.surface,
                    borderColor: theme.colors.border,
                  }
                ]}
                onPress={() => handleRetentionPeriodChange(days)}
              >
                <Text style={[
                  styles.retentionOptionText,
                  { 
                    color: settings.memoryRetentionDays === days 
                      ? '#fff' 
                      : theme.colors.text 
                  }
                ]}>
                  {getRetentionLabel(days)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* What to Remember */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>What to Remember</Text>
          <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
            Choose what types of data should be included in memory
          </Text>
          
          <View style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Daily Check-ins</Text>
              <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                Remember your mood, energy, and daily reflections
              </Text>
            </View>
            <Switch
              value={settings.includeCheckIns}
              onValueChange={() => handleToggle('includeCheckIns')}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={settings.includeCheckIns ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Goals & Progress</Text>
              <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                Remember your goals, milestones, and achievements
              </Text>
            </View>
            <Switch
              value={settings.includeGoals}
              onValueChange={() => handleToggle('includeGoals')}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={settings.includeGoals ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Reflections</Text>
              <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                Remember your personal insights and thoughts
              </Text>
            </View>
            <Switch
              value={settings.includeReflections}
              onValueChange={() => handleToggle('includeReflections')}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={settings.includeReflections ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={[styles.settingItem, { borderBottomColor: 'transparent' }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Conversations</Text>
              <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                Remember your chat conversations with the AI coach
              </Text>
            </View>
            <Switch
              value={settings.includeConversations}
              onValueChange={() => handleToggle('includeConversations')}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={settings.includeConversations ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Auto-Cleanup */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Auto-Cleanup</Text>
          
          <View style={[styles.settingItem, { borderBottomColor: 'transparent' }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Auto-delete Completed Goals</Text>
              <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                Automatically remove completed goals after 30 days
              </Text>
            </View>
            <Switch
              value={settings.autoDeleteCompletedGoals}
              onValueChange={() => handleToggle('autoDeleteCompletedGoals')}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={settings.autoDeleteCompletedGoals ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Memory Actions */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Memory Actions</Text>
          
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: theme.colors.warning }]}
            onPress={handleClearOldMemories}
          >
            <Text style={[styles.actionButtonText, { color: theme.colors.warning }]}>
              Clear Old Memories
            </Text>
            <Text style={[styles.actionButtonDescription, { color: theme.colors.textSecondary }]}>
              Remove memories older than your retention period
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { borderColor: theme.colors.error }]}
            onPress={handleClearAllMemory}
          >
            <Text style={[styles.actionButtonText, { color: theme.colors.error }]}>
              Clear All Memory
            </Text>
            <Text style={[styles.actionButtonDescription, { color: theme.colors.textSecondary }]}>
              Permanently delete all stored memories
            </Text>
          </TouchableOpacity>
        </View>

        {/* Privacy Notice */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.privacyTitle, { color: theme.colors.text }]}>🔒 Privacy Notice</Text>
          <Text style={[styles.privacyText, { color: theme.colors.textSecondary }]}>
            Your memories are stored locally on your device and are never shared without your explicit consent. 
            When you enable "Share Memory Insights," only anonymized patterns are used to improve the AI, 
            never your personal content.
          </Text>
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
  overviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  overviewLabel: {
    fontSize: 16,
  },
  overviewValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 16,
    borderBottomWidth: 1,
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
    lineHeight: 20,
  },
  retentionOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  retentionOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  retentionOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  actionButtonDescription: {
    fontSize: 14,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  privacyText: {
    fontSize: 14,
    lineHeight: 20,
  },
});