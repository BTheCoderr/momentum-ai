import React, { useState } from 'react';
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

export const PrivacySettingsScreen = () => {
  const navigation = useNavigation();
  const [settings, setSettings] = useState({
    shareProgress: false,
    shareInsights: false,
    allowDataAnalysis: true,
    showProfilePublicly: false,
  });

  const handleToggle = (setting: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No user found');

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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Privacy Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingTitle}>Share Progress</Text>
              <Text style={styles.settingDescription}>
                Allow others to see your progress and achievements
              </Text>
            </View>
            <Switch
              value={settings.shareProgress}
              onValueChange={() => handleToggle('shareProgress')}
              trackColor={{ false: '#767577', true: '#4F46E5' }}
            />
          </View>

          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingTitle}>Share Insights</Text>
              <Text style={styles.settingDescription}>
                Share your insights and learnings with the community
              </Text>
            </View>
            <Switch
              value={settings.shareInsights}
              onValueChange={() => handleToggle('shareInsights')}
              trackColor={{ false: '#767577', true: '#4F46E5' }}
            />
          </View>

          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingTitle}>Data Analysis</Text>
              <Text style={styles.settingDescription}>
                Allow us to analyze your data to improve your experience
              </Text>
            </View>
            <Switch
              value={settings.allowDataAnalysis}
              onValueChange={() => handleToggle('allowDataAnalysis')}
              trackColor={{ false: '#767577', true: '#4F46E5' }}
            />
          </View>

          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingTitle}>Public Profile</Text>
              <Text style={styles.settingDescription}>
                Make your profile visible to other users
              </Text>
            </View>
            <Switch
              value={settings.showProfilePublicly}
              onValueChange={() => handleToggle('showProfilePublicly')}
              trackColor={{ false: '#767577', true: '#4F46E5' }}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1b1e',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2b2e',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    color: '#4F46E5',
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#2a2b2e',
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
    borderBottomColor: '#3a3b3e',
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#9ca3af',
    maxWidth: '80%',
  },
  saveButton: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 