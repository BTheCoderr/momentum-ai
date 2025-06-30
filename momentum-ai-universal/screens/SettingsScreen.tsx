import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Switch,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { useTheme } from '../components/ThemeProvider';
import { ThemeToggle } from '../components/ThemeToggle';
import { notificationService, getNotificationPreferences, updateNotificationPreferences } from '../lib/notifications';
import { setUserId } from '../lib/analytics';
import { Ionicons } from '@expo/vector-icons';

const SettingsScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [dailyReminders, setDailyReminders] = useState(true);
  const [weeklyInsights, setWeeklyInsights] = useState(true);
  const [streakReminders, setStreakReminders] = useState(true);
  const [motivationalMessages, setMotivationalMessages] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    loadNotificationPreferences();
  }, []);

  const loadNotificationPreferences = async () => {
    try {
      const prefs = getNotificationPreferences();
      setNotifications(true); // Assume enabled if app is installed
      setDailyReminders(prefs.dailyReminders);
      setWeeklyInsights(prefs.weeklyInsights);
      setStreakReminders(prefs.streakReminders);
      setMotivationalMessages(prefs.motivationalMessages);
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
  };

  const updateNotificationSetting = async (key: string, value: boolean) => {
    try {
      await updateNotificationPreferences({ [key]: value });
    } catch (error) {
      console.error('Error updating notification setting:', error);
    }
  };

  const SettingsItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    showArrow = true,
    rightComponent 
  }: any) => (
    <TouchableOpacity 
      style={[styles.settingsItem, { backgroundColor: theme.colors.card }]} 
      onPress={onPress}
    >
      <View style={styles.settingsItemLeft}>
        <Text style={styles.settingsIcon}>{icon}</Text>
        <View style={styles.settingsItemText}>
          <Text style={[styles.settingsItemTitle, { color: theme.colors.text }]}>{title}</Text>
          {subtitle && <Text style={[styles.settingsItemSubtitle, { color: theme.colors.textSecondary }]}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent || (showArrow && <Text style={[styles.settingsArrow, { color: theme.colors.textSecondary }]}>›</Text>)}
    </TouchableOpacity>
  );

  const handleSignOut = async () => {
    try {
      console.log('🚪 Signing out user...');
      
      // Clear analytics user ID first
      setUserId(null);
      
      // Sign out from Supabase (this will trigger the auth state change)
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.warn('Supabase sign out error (continuing anyway):', error);
      }
      
      // Clear all user data from AsyncStorage
      await AsyncStorage.multiRemove([
        'userData',
        'userStats',
        'userGoals',
        'userCheckins',
        'userMessages',
        'userReflections',
        'hasSeenTutorial',
        'isAuthenticated',
        'user'
      ]);
      
      console.log('✅ User data cleared successfully');
      
      // Close modal first
      setShowSignOutModal(false);
      
      // Force navigation reset to Auth screen
      // Use replace to prevent back navigation
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
      
      console.log('✅ User signed out successfully');
      
    } catch (error) {
      console.error('❌ Error signing out:', error);
      setShowSignOutModal(false);
      
      // Force sign out even if there's an error
      setUserId(null);
      await AsyncStorage.clear();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    }
  };

  const confirmSignOut = () => {
    setShowSignOutModal(true);
  };

  const cancelSignOut = () => {
    setShowSignOutModal(false);
  };

  const handleMemorySettings = () => {
    navigation.navigate('MemorySettings');
  };

  const handleExportData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No user found');

      // Get user's data
      const [goals, checkIns, insights] = await Promise.all([
        supabase.from('goals').select('*').eq('user_id', user.id),
        supabase.from('checkins').select('*').eq('user_id', user.id),
        supabase.from('insights').select('*').eq('user_id', user.id),
      ]);

      // Format data for export
      const exportData = {
        goals: goals.data,
        checkIns: checkIns.data,
        insights: insights.data,
        exportDate: new Date().toISOString(),
        userId: user.id,
      };

      // Convert to JSON string
      const jsonStr = JSON.stringify(exportData, null, 2);
      
      // Create a Blob
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `momentum-ai-data-${new Date().toISOString()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      Alert.alert('Success', 'Your data has been exported successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Error', 'Failed to export data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTermsOfService = () => {
    navigation.navigate('TermsOfService');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        
        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Profile</Text>
          <SettingsItem
            icon="👤"
            title="Edit Profile"
            subtitle="Update your name and preferences"
            onPress={() => navigation.navigate('EditProfile')}
          />
          <SettingsItem
            icon="🎯"
            title="Goals & Priorities"
            subtitle="Manage your personal goals"
            onPress={() => navigation.navigate('Goals')}
          />
          <SettingsItem
            icon="🏆"
            title="XP & Achievements"
            subtitle="View your progress and achievements"
            onPress={() => navigation.navigate('XPProgress')}
          />
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Appearance</Text>
          <SettingsItem
            icon="🌙"
            title="Dark Mode"
            subtitle="Switch between light and dark themes"
            showArrow={false}
            rightComponent={<ThemeToggle showLabel={false} />}
          />
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Notifications</Text>
          <SettingsItem
            icon="🔔"
            title="Push Notifications"
            subtitle="Receive app notifications"
            showArrow={false}
            rightComponent={
              <Switch
                value={notifications}
                onValueChange={(value) => {
                  setNotifications(value);
                  // Handle push notification permission
                }}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={notifications ? theme.colors.surface : '#f4f3f4'}
              />
            }
          />
          <SettingsItem
            icon="⏰"
            title="Daily Check-in Reminders"
            subtitle="Get reminded to complete daily check-ins"
            showArrow={false}
            rightComponent={
              <Switch
                value={dailyReminders}
                onValueChange={(value) => {
                  setDailyReminders(value);
                  updateNotificationSetting('dailyReminders', value);
                }}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={dailyReminders ? theme.colors.surface : '#f4f3f4'}
              />
            }
          />
          <SettingsItem
            icon="🔥"
            title="Streak Reminders"
            subtitle="Don't break your momentum streak"
            showArrow={false}
            rightComponent={
              <Switch
                value={streakReminders}
                onValueChange={(value) => {
                  setStreakReminders(value);
                  updateNotificationSetting('streakReminders', value);
                }}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={streakReminders ? theme.colors.surface : '#f4f3f4'}
              />
            }
          />
          <SettingsItem
            icon="💡"
            title="Weekly Insights"
            subtitle="Receive weekly insight summaries"
            showArrow={false}
            rightComponent={
              <Switch
                value={weeklyInsights}
                onValueChange={(value) => {
                  setWeeklyInsights(value);
                  updateNotificationSetting('weeklyInsights', value);
                }}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={weeklyInsights ? theme.colors.surface : '#f4f3f4'}
              />
            }
          />
          <SettingsItem
            icon="🌟"
            title="Motivational Messages"
            subtitle="Receive encouraging messages"
            showArrow={false}
            rightComponent={
              <Switch
                value={motivationalMessages}
                onValueChange={(value) => {
                  setMotivationalMessages(value);
                  updateNotificationSetting('motivationalMessages', value);
                }}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={motivationalMessages ? theme.colors.surface : '#f4f3f4'}
              />
            }
          />
        </View>

        {/* AI Coach Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Coach</Text>
          <SettingsItem
            icon="🤖"
            title="Coach Personality"
            subtitle="Choose your preferred coaching style"
            onPress={() => navigation.navigate('Coach')}
          />
          <SettingsItem
            icon="🧠"
            title="Memory & Context"
            subtitle="How much the AI remembers about you"
            onPress={() => Alert.alert('Memory Settings', 'Memory settings coming soon!')}
          />
        </View>

        {/* Memory & Context Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Memory & Context</Text>
          <SettingsItem
            icon="🧠"
            title="Memory Settings"
            subtitle="Control how much context AI remembers"
            onPress={handleMemorySettings}
          />
          <SettingsItem
            icon="📊"
            title="Memory Usage"
            subtitle="View memory storage details"
            onPress={() => navigation.navigate('MemoryUsage')}
          />
          <SettingsItem
            icon="🔄"
            title="Reset Memory"
            subtitle="Clear AI's memory of your data"
            onPress={() => {
              Alert.alert(
                'Reset Memory',
                'Are you sure you want to clear all AI memory? This cannot be undone.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        const { data: { user } } = await supabase.auth.getUser();
                        if (!user) throw new Error('No user found');

                        await supabase
                          .from('ai_memory')
                          .delete()
                          .eq('user_id', user.id);

                        Alert.alert('Success', 'AI memory has been reset successfully!');
                      } catch (error) {
                        console.error('Error resetting memory:', error);
                        Alert.alert('Error', 'Failed to reset memory. Please try again.');
                      }
                    },
                  },
                ]
              );
            }}
          />
        </View>

        {/* Data Export Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Privacy</Text>
          <SettingsItem
            icon="📤"
            title="Export Data"
            subtitle="Download your personal data"
            onPress={handleExportData}
          />
          <SettingsItem
            icon="🔒"
            title="Privacy Settings"
            subtitle="Manage your data privacy"
            onPress={() => navigation.navigate('PrivacySettings')}
          />
          <SettingsItem
            icon="📋"
            title="Terms of Service"
            subtitle="Read our terms"
            onPress={handleTermsOfService}
          />
        </View>

        {/* Help & Support Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Help & Support</Text>
          <SettingsItem
            icon="❓"
            title="App Tutorial"
            subtitle="Take a tour of the app features"
            onPress={async () => {
              await AsyncStorage.removeItem('hasSeenTutorial');
              Alert.alert(
                'Tutorial Reset',
                'The tutorial will show the next time you restart the app.'
              );
            }}
          />
          <SettingsItem
            icon="📧"
            title="Contact Support"
            subtitle="Get help with any issues"
            onPress={() => Alert.alert('Support', 'Email: support@momentum-ai.app')}
          />
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <SettingsItem
            icon="ℹ️"
            title="App Version"
            subtitle="1.0.0 (Beta)"
            showArrow={false}
          />

        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={confirmSignOut}>
            <Text style={styles.logoutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Enhanced Sign Out Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showSignOutModal}
        onRequestClose={() => setShowSignOutModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSignOutModal(false)}
        >
          <TouchableOpacity 
            style={styles.modalContainer}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <View style={styles.modalHandle} />
            </View>
            
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Sign Out</Text>
              <Text style={styles.modalMessage}>
                Are you sure you want to sign out? Your data will be saved.
              </Text>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowSignOutModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.signOutButton]}
                  onPress={handleSignOut}
                >
                  <Text style={styles.signOutButtonText}>Sign Out</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  settingsItemText: {
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  settingsItemSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  settingsArrow: {
    fontSize: 20,
    color: '#ccc',
    fontWeight: '300',
  },
  logoutButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 16,
    marginBottom: 12,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  bottomPadding: {
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34, // Safe area padding for iPhone
  },
  modalHeader: {
    paddingTop: 12,
    paddingBottom: 8,
    alignItems: 'center',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ccc',
    marginBottom: 8,
  },
  modalContent: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  modalMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: '#007AFF',
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingsScreen; 