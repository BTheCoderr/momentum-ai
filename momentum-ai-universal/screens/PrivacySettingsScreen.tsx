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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useTheme } from '../components/ThemeProvider';

export const PrivacySettingsScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [settings, setSettings] = useState({
    shareProgress: false,
    shareInsights: false,
    allowDataAnalysis: true,
    showProfilePublicly: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user');
      }

      const { data, error } = await supabase
        .from('user_settings')
        .select('privacy_settings')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data?.privacy_settings) {
        setSettings(data.privacy_settings);
      }
    } catch (error) {
      console.error('Error loading privacy settings:', error);
      Alert.alert('Error', 'Failed to load privacy settings');
    }
  };

  const handleToggle = (setting: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user');
      }

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          privacy_settings: settings,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      Alert.alert('Success', 'Privacy settings updated successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      Alert.alert('Error', 'Failed to save privacy settings');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>Privacy Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <View style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}>
            <View>
              <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Share Progress</Text>
              <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                Allow others to see your progress and achievements
              </Text>
            </View>
            <Switch
              value={settings.shareProgress}
              onValueChange={() => handleToggle('shareProgress')}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={settings.shareProgress ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}>
            <View>
              <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Share Insights</Text>
              <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                Share your insights and learnings with the community
              </Text>
            </View>
            <Switch
              value={settings.shareInsights}
              onValueChange={() => handleToggle('shareInsights')}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={settings.shareInsights ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}>
            <View>
              <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Data Analysis</Text>
              <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                Allow us to analyze your data to improve your experience
              </Text>
            </View>
            <Switch
              value={settings.allowDataAnalysis}
              onValueChange={() => handleToggle('allowDataAnalysis')}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={settings.allowDataAnalysis ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={[styles.settingItem, { borderBottomColor: 'transparent' }]}>
            <View>
              <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Public Profile</Text>
              <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                Make your profile visible to other users
              </Text>
            </View>
            <Switch
              value={settings.showProfilePublicly}
              onValueChange={() => handleToggle('showProfilePublicly')}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={settings.showProfilePublicly ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.colors.primary }]} onPress={handleSave}>
          <Text style={[styles.saveButtonText, { color: '#fff' }]}>Save Changes</Text>
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
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    maxWidth: '80%',
  },
  saveButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 