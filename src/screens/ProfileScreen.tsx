import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert, Linking } from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootTabParamList } from '../navigation';
import { useAuth } from '../hooks/useAuth';
import { LinearGradient } from 'expo-linear-gradient';

type ProfileScreenNavigationProp = BottomTabNavigationProp<RootTabParamList, 'Profile'>;

interface Props {
  navigation: ProfileScreenNavigationProp;
}

export default function ProfileScreen({ navigation }: Props) {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut }
      ]
    );
  };

  const handleNotifications = () => {
    Alert.alert(
      'Notifications',
      'Choose your notification preferences:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Quick Settings', onPress: () => {
          Alert.alert(
            'Quick Notification Settings',
            'Choose a preset:',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'All On', onPress: () => Alert.alert('Success', 'All notifications enabled!') },
              { text: 'Essential Only', onPress: () => Alert.alert('Success', 'Only essential notifications enabled!') },
              { text: 'All Off', onPress: () => Alert.alert('Success', 'All notifications disabled!') }
            ]
          );
        }},
        { text: 'Advanced Settings', onPress: () => {
          // In a real app, you would navigate to a dedicated settings screen
          Alert.alert('Advanced Settings', 'This would open a detailed notification settings screen with toggles for each type of notification, quiet hours, and frequency settings.');
        }}
      ]
    );
  };

  const handlePrivacy = () => {
    Alert.alert(
      'Privacy Settings',
      'Manage your data and privacy:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Data Usage', onPress: () => Alert.alert('Data Usage', 'Your data is used to provide personalized coaching and track your progress. We never share personal information with third parties.') },
        { text: 'Delete Account', style: 'destructive', onPress: () => Alert.alert('Delete Account', 'This action cannot be undone. Contact support to proceed.') }
      ]
    );
  };

  const handleGoals = () => {
    navigation.navigate('Goals');
  };

  const handleAICoachSettings = () => {
    Alert.alert(
      'AI Coach Settings',
      'Customize your AI coaching experience:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Coaching Style', onPress: () => {
          Alert.alert(
            'Coaching Style',
            'Choose your preferred coaching approach:',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Gentle & Supportive', onPress: () => Alert.alert('Style Updated', 'Your AI coach will use a gentle, encouraging approach.') },
              { text: 'Motivational & Energetic', onPress: () => Alert.alert('Style Updated', 'Your AI coach will be more energetic and motivational.') },
              { text: 'Direct & Analytical', onPress: () => Alert.alert('Style Updated', 'Your AI coach will be more direct and data-focused.') }
            ]
          );
        }},
        { text: 'Intervention Timing', onPress: () => {
          Alert.alert(
            'AI Intervention Timing',
            'When should your AI coach step in?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Proactive (Before issues)', onPress: () => Alert.alert('Timing Updated', 'AI will intervene before potential problems.') },
              { text: 'Reactive (When struggling)', onPress: () => Alert.alert('Timing Updated', 'AI will intervene when you\'re struggling.') },
              { text: 'On Request Only', onPress: () => Alert.alert('Timing Updated', 'AI will only help when you ask.') }
            ]
          );
        }},
        { text: 'Pattern Analysis', onPress: () => {
          Alert.alert(
            'Pattern Analysis Settings',
            'Your AI coach analyzes your behavior patterns to provide personalized insights. This includes:\n\n• Check-in frequency and timing\n• Goal completion patterns\n• Emotional cycles and triggers\n• Success and failure factors\n\nThis data stays private and is only used to help you achieve your goals.',
            [
              { text: 'Keep Enabled', style: 'default' },
              { text: 'Disable Analysis', style: 'destructive', onPress: () => Alert.alert('Analysis Disabled', 'Pattern analysis has been turned off. Your AI coach will provide less personalized insights.') }
            ]
          );
        }}
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Download your progress data in various formats:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Quick Export (PDF)', onPress: () => {
          Alert.alert(
            'Quick Export',
            'Generate a PDF summary of your progress:',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Last 30 Days', onPress: () => Alert.alert('Export Started', 'Your 30-day progress report will be emailed to you as a PDF within 5 minutes.') },
              { text: 'Last 3 Months', onPress: () => Alert.alert('Export Started', 'Your 3-month progress report will be emailed to you as a PDF within 5 minutes.') },
              { text: 'All Time', onPress: () => Alert.alert('Export Started', 'Your complete progress report will be emailed to you as a PDF within 10 minutes.') }
            ]
          );
        }},
        { text: 'Detailed Export (CSV)', onPress: () => {
          Alert.alert(
            'Detailed Data Export',
            'Export raw data for analysis:',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Goals & Habits', onPress: () => Alert.alert('Export Started', 'Your goals and habits data (CSV) will be emailed to you shortly.') },
              { text: 'Check-in History', onPress: () => Alert.alert('Export Started', 'Your complete check-in history (CSV) will be emailed to you shortly.') },
              { text: 'AI Insights', onPress: () => Alert.alert('Export Started', 'Your AI insights and patterns (CSV) will be emailed to you shortly.') },
              { text: 'Everything', onPress: () => Alert.alert('Export Started', 'Your complete data archive (ZIP with multiple CSV files) will be emailed to you within 15 minutes.') }
            ]
          );
        }},
        { text: 'GDPR Data Request', onPress: () => {
          Alert.alert(
            'GDPR Data Request',
            'Request a complete copy of all your personal data as required by GDPR regulations. This includes all stored data, metadata, and processing logs.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Submit Request', onPress: () => Alert.alert('Request Submitted', 'Your GDPR data request has been submitted. You will receive your complete data archive within 30 days as required by law.') }
            ]
          );
        }}
      ]
    );
  };

  const handleHelpSupport = () => {
    Alert.alert(
      'Help & Support',
      'How can we help you?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'FAQ', onPress: () => Alert.alert('FAQ', 'Visit our FAQ section for common questions and answers.') },
        { text: 'Contact Support', onPress: () => {
          Alert.alert(
            'Contact Support',
            'Choose how to reach us:',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Email', onPress: () => Linking.openURL('mailto:support@momentumai.app?subject=Support Request') },
              { text: 'Chat with AI', onPress: () => navigation.navigate('Chat', { initialPrompt: 'I need help with the app. Can you assist me?' }) }
            ]
          );
        }},
        { text: 'Feature Request', onPress: () => Alert.alert('Feature Request', 'We love hearing your ideas! Email us at feedback@momentumai.app') }
      ]
    );
  };

  const userStats = {
    totalStreaks: 47,
    activeGoals: 2,
    completedGoals: 8,
    motivationScore: 94,
    joinDate: 'March 2024'
  };

  const settingsOptions = [
    { 
      id: 1, 
      title: 'Notifications', 
      subtitle: 'Manage your alerts', 
      icon: '🔔',
      onPress: handleNotifications
    },
    { 
      id: 2, 
      title: 'Privacy', 
      subtitle: 'Data and privacy settings', 
      icon: '🔒',
      onPress: handlePrivacy
    },
    { 
      id: 3, 
      title: 'Goals', 
      subtitle: 'Manage your goals', 
      icon: '🎯',
      onPress: handleGoals
    },
    { 
      id: 4, 
      title: 'AI Coach Settings', 
      subtitle: 'Customize your AI experience', 
      icon: '🤖',
      onPress: handleAICoachSettings
    },
    { 
      id: 5, 
      title: 'Export Data', 
      subtitle: 'Download your progress', 
      icon: '📊',
      onPress: handleExportData
    },
    { 
      id: 6, 
      title: 'Help & Support', 
      subtitle: 'Get help and contact us', 
      icon: '❓',
      onPress: handleHelpSupport
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={['#FF6B35', '#F7931E']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
            <Text style={styles.userName}>
              {user?.email ? user.email.split('@')[0] : 'User'}
            </Text>
            <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
            <Text style={styles.joinDate}>Member since {userStats.joinDate}</Text>
          </View>
        </LinearGradient>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: '#E8F5E8' }]}>
              <Text style={styles.statIcon}>🔥</Text>
              <Text style={[styles.statNumber, { color: '#16A34A' }]}>{userStats.totalStreaks}</Text>
              <Text style={styles.statLabel}>Total Streaks</Text>
              <Text style={styles.statSubtext}>days</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#EEF2FF' }]}>
              <Text style={styles.statIcon}>🎯</Text>
              <Text style={[styles.statNumber, { color: '#4F46E5' }]}>{userStats.activeGoals}</Text>
              <Text style={styles.statLabel}>Active Goals</Text>
              <Text style={styles.statSubtext}>in progress</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
              <Text style={styles.statIcon}>✅</Text>
              <Text style={[styles.statNumber, { color: '#D97706' }]}>{userStats.completedGoals}</Text>
              <Text style={styles.statLabel}>Completed</Text>
              <Text style={styles.statSubtext}>goals achieved</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#FCE7F3' }]}>
              <Text style={styles.statIcon}>💜</Text>
              <Text style={[styles.statNumber, { color: '#BE185D' }]}>{userStats.motivationScore}%</Text>
              <Text style={styles.statLabel}>Motivation</Text>
              <Text style={styles.statSubtext}>score</Text>
            </View>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          {settingsOptions.map((option) => (
            <TouchableOpacity 
              key={option.id} 
              style={styles.settingCard}
              onPress={option.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>{option.icon}</Text>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>{option.title}</Text>
                  <Text style={styles.settingSubtitle}>{option.subtitle}</Text>
                </View>
              </View>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#C7D2FE',
    marginBottom: 8,
  },
  joinDate: {
    fontSize: 14,
    color: '#A5B4FC',
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
    textAlign: 'center',
  },
  statSubtext: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  settingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  settingArrow: {
    fontSize: 20,
    color: '#9CA3AF',
  },
  signOutButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 20,
  },
}); 