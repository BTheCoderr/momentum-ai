import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootTabParamList } from '../navigation';
import { LinearGradient } from 'expo-linear-gradient';

type NotificationSettingsScreenNavigationProp = BottomTabNavigationProp<RootTabParamList, 'Profile'>;

interface Props {
  navigation: NotificationSettingsScreenNavigationProp;
}

export default function NotificationSettingsScreen({ navigation }: Props) {
  const [settings, setSettings] = useState({
    dailyReminders: true,
    goalMilestones: true,
    aiInsights: true,
    weeklyReports: false,
    motivationalQuotes: true,
    streakAlerts: true,
    socialUpdates: false,
    systemUpdates: true
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const notificationOptions = [
    {
      key: 'dailyReminders' as keyof typeof settings,
      title: 'Daily Reminders',
      subtitle: 'Get reminded to check in with your goals',
      icon: '⏰'
    },
    {
      key: 'goalMilestones' as keyof typeof settings,
      title: 'Goal Milestones',
      subtitle: 'Celebrate when you reach important milestones',
      icon: '🎯'
    },
    {
      key: 'aiInsights' as keyof typeof settings,
      title: 'AI Insights',
      subtitle: 'Receive personalized insights and recommendations',
      icon: '🤖'
    },
    {
      key: 'weeklyReports' as keyof typeof settings,
      title: 'Weekly Reports',
      subtitle: 'Summary of your progress each week',
      icon: '📊'
    },
    {
      key: 'motivationalQuotes' as keyof typeof settings,
      title: 'Motivational Quotes',
      subtitle: 'Daily inspiration to keep you motivated',
      icon: '💪'
    },
    {
      key: 'streakAlerts' as keyof typeof settings,
      title: 'Streak Alerts',
      subtitle: 'Notifications about your current streaks',
      icon: '🔥'
    },
    {
      key: 'socialUpdates' as keyof typeof settings,
      title: 'Social Updates',
      subtitle: 'Updates from your accountability partners',
      icon: '👥'
    },
    {
      key: 'systemUpdates' as keyof typeof settings,
      title: 'System Updates',
      subtitle: 'App updates and important announcements',
      icon: '📱'
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={['#4F46E5', '#7C3AED']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Notification Settings</Text>
            <Text style={styles.headerSubtitle}>
              Customize when and how you want to be notified
            </Text>
          </View>
        </LinearGradient>

        {/* Notification Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Types</Text>
          {notificationOptions.map((option) => (
            <View key={option.key} style={styles.settingCard}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>{option.icon}</Text>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>{option.title}</Text>
                  <Text style={styles.settingSubtitle}>{option.subtitle}</Text>
                </View>
              </View>
              <Switch
                value={settings[option.key]}
                onValueChange={() => toggleSetting(option.key)}
                trackColor={{ false: '#E5E7EB', true: '#4F46E5' }}
                thumbColor={settings[option.key] ? '#fff' : '#fff'}
              />
            </View>
          ))}
        </View>

        {/* Quiet Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quiet Hours</Text>
          <View style={styles.settingCard}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🌙</Text>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Do Not Disturb</Text>
                <Text style={styles.settingSubtitle}>10:00 PM - 8:00 AM</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notification Frequency */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequency</Text>
          <View style={styles.settingCard}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>📅</Text>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Reminder Frequency</Text>
                <Text style={styles.settingSubtitle}>Once daily at 9:00 AM</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
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
  },
  headerContent: {
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#C7D2FE',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 16,
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
  editButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 20,
  },
}); 