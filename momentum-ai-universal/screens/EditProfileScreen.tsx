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
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../components/ThemeProvider';
import { userProfileServices } from '../lib/services';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserProfile {
  id?: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  website?: string;
  created_at?: string;
  updated_at?: string;
}

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [profile, setProfile] = useState<UserProfile>({
    full_name: '',
    email: '',
    bio: '',
    location: '',
    website: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalProfile, setOriginalProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      // Load profile from Supabase using the new profile services
      const profileData = await userProfileServices.get();
      
      if (profileData) {
        // Convert to local format if needed
        const localProfile: UserProfile = {
          id: profileData.id,
          full_name: profileData.full_name || 'Friend',
          email: profileData.email || '',
          bio: profileData.bio || '',
          location: profileData.location || '',
          website: profileData.website || '',
          avatar_url: profileData.avatar_url,
          created_at: profileData.created_at,
          updated_at: profileData.updated_at,
        };
        
        setProfile(localProfile);
        setOriginalProfile(localProfile);
      } else {
        // Set default values
        const defaultProfile: UserProfile = {
          full_name: 'Friend',
          email: 'user@momentum-ai.app',
          bio: '',
          location: '',
          website: '',
        };
        setProfile(defaultProfile);
        setOriginalProfile(defaultProfile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      
      // Fallback to default profile
      const defaultProfile: UserProfile = {
        full_name: 'Friend',
        email: 'user@momentum-ai.app',
        bio: '',
        location: '',
        website: '',
      };
      setProfile(defaultProfile);
      setOriginalProfile(defaultProfile);
      
      Alert.alert('Error', 'Failed to load profile data. Using default values.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Validate required fields
      if (!profile.full_name.trim()) {
        Alert.alert('Error', 'Name is required.');
        return;
      }

      if (!profile.email.trim()) {
        Alert.alert('Error', 'Email is required.');
        return;
      }

      // Simple email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(profile.email)) {
        Alert.alert('Error', 'Please enter a valid email address.');
        return;
      }

      // Save to Supabase using the new profile services
      await userProfileServices.update(profile);
      
      Alert.alert(
        'Success',
        'Profile updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (JSON.stringify(profile) !== JSON.stringify(originalProfile)) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const selectAvatar = () => {
    // Placeholder for avatar selection
    // In a real app, this would open image picker
    Alert.alert(
      'Avatar Selection',
      'Avatar selection feature coming soon! This would typically open your photo library or camera.',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const hasChanges = JSON.stringify(profile) !== JSON.stringify(originalProfile);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>Cancel</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>Edit Profile</Text>
        <TouchableOpacity 
          onPress={handleSave} 
          style={[
            styles.saveButton,
            !hasChanges && styles.saveButtonDisabled
          ]}
          disabled={!hasChanges || saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <Text style={[
              styles.saveButtonText, 
              { color: hasChanges ? theme.colors.primary : theme.colors.textSecondary }
            ]}>
              Save
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={selectAvatar} style={styles.avatarContainer}>
            {profile.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.avatarText, { color: theme.colors.text }]}>
                  {profile.full_name.charAt(0).toUpperCase() || '?'}
                </Text>
              </View>
            )}
            <View style={[styles.cameraIcon, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.cameraIconText}>📷</Text>
            </View>
          </TouchableOpacity>
          <Text style={[styles.avatarLabel, { color: theme.colors.textSecondary }]}>
            Tap to change photo
          </Text>
        </View>

        {/* Basic Information */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Name *</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                }
              ]}
              value={profile.full_name}
              onChangeText={(text) => setProfile(prev => ({ ...prev, full_name: text }))}
              placeholder="Enter your name"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Email *</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                }
              ]}
              value={profile.email}
              onChangeText={(text) => setProfile(prev => ({ ...prev, email: text }))}
              placeholder="Enter your email"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Additional Information */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Additional Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Bio</Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                }
              ]}
              value={profile.bio}
              onChangeText={(text) => setProfile(prev => ({ ...prev, bio: text }))}
              placeholder="Tell us about yourself..."
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Location</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                }
              ]}
              value={profile.location}
              onChangeText={(text) => setProfile(prev => ({ ...prev, location: text }))}
              placeholder="City, Country"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Website</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                }
              ]}
              value={profile.website}
              onChangeText={(text) => setProfile(prev => ({ ...prev, website: text }))}
              placeholder="https://yourwebsite.com"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Account Actions */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Account</Text>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              Alert.alert(
                'Change Password',
                'Password change feature coming soon! This would typically send you to a secure password change form.',
                [{ text: 'OK', style: 'default' }]
              );
            }}
          >
            <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>Change Password</Text>
            <Text style={[styles.actionButtonArrow, { color: theme.colors.textSecondary }]}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              Alert.alert(
                'Privacy Settings',
                'This would open your privacy settings page.',
                [{ text: 'OK', style: 'default' }]
              );
            }}
          >
            <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>Privacy Settings</Text>
            <Text style={[styles.actionButtonArrow, { color: theme.colors.textSecondary }]}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.error }]}>Danger Zone</Text>
          
          <TouchableOpacity
            style={styles.dangerButton}
            onPress={() => {
              Alert.alert(
                'Delete Account',
                'Are you sure you want to permanently delete your account? This action cannot be undone and all your data will be lost.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete Account',
                    style: 'destructive',
                    onPress: () => {
                      Alert.alert(
                        'Feature Not Available',
                        'Account deletion is not implemented in this demo version.',
                        [{ text: 'OK', style: 'default' }]
                      );
                    },
                  },
                ]
              );
            }}
          >
            <Text style={[styles.dangerButtonText, { color: theme.colors.error }]}>Delete Account</Text>
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
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconText: {
    fontSize: 16,
  },
  avatarLabel: {
    fontSize: 14,
  },
  section: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  actionButtonText: {
    fontSize: 16,
  },
  actionButtonArrow: {
    fontSize: 16,
  },
  dangerButton: {
    paddingVertical: 16,
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 