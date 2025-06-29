import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

export const EditProfileScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    primaryGoal: '',
    bio: '',
    preferredCoachingStyle: 'supportive', // or 'direct', 'analytical'
    timezone: '',
    notificationPreferences: {
      dailyReminders: true,
      weeklyInsights: true,
      achievementAlerts: true,
    },
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setProfile({
            fullName: data.full_name || '',
            email: data.email || '',
            primaryGoal: data.primary_goal || '',
            bio: data.bio || '',
            preferredCoachingStyle: data.preferred_coaching_style || 'supportive',
            timezone: data.timezone || '',
            notificationPreferences: data.notification_preferences || {
              dailyReminders: true,
              weeklyInsights: true,
              achievementAlerts: true,
            },
          });
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.fullName,
          primary_goal: profile.primaryGoal,
          bio: profile.bio,
          preferred_coaching_style: profile.preferredCoachingStyle,
          timezone: profile.timezone,
          notification_preferences: profile.notificationPreferences,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text onPress={() => navigation.goBack()} style={styles.backButton}>
          ← Back
        </Text>
        <Text style={styles.title}>Edit Profile</Text>
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={profile.fullName}
            onChangeText={(text) => setProfile(prev => ({ ...prev, fullName: text }))}
            placeholder="Your name"
            placeholderTextColor="#6b7280"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, { opacity: 0.7 }]}
            value={profile.email}
            editable={false}
            placeholder="Your email"
            placeholderTextColor="#6b7280"
          />
          <Text style={styles.helperText}>Email cannot be changed</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Primary Goal</Text>
          <TextInput
            style={styles.input}
            value={profile.primaryGoal}
            onChangeText={(text) => setProfile(prev => ({ ...prev, primaryGoal: text }))}
            placeholder="What's your main goal?"
            placeholderTextColor="#6b7280"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={profile.bio}
            onChangeText={(text) => setProfile(prev => ({ ...prev, bio: text }))}
            placeholder="Tell us about yourself..."
            placeholderTextColor="#6b7280"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Preferred Coaching Style</Text>
          <View style={styles.buttonGroup}>
            {['supportive', 'direct', 'analytical'].map((style) => (
              <TouchableOpacity
                key={style}
                style={[
                  styles.styleButton,
                  profile.preferredCoachingStyle === style && styles.styleButtonActive
                ]}
                onPress={() => setProfile(prev => ({ ...prev, preferredCoachingStyle: style }))}
              >
                <Text style={[
                  styles.styleButtonText,
                  profile.preferredCoachingStyle === style && styles.styleButtonTextActive
                ]}>
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Text>
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
    color: '#4F46E5',
    fontSize: 16,
    marginRight: 16,
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
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2a2b2e',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  styleButton: {
    flex: 1,
    backgroundColor: '#2a2b2e',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  styleButtonActive: {
    backgroundColor: '#4F46E5',
  },
  styleButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  styleButtonTextActive: {
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 