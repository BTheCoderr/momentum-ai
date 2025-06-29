import * as Notifications from 'expo-notifications';
// Conditional import to prevent native module errors
let Device: any = null;
try {
  Device = require('expo-device');
} catch (error) {
  console.warn('expo-device not available:', error);
  Device = { isDevice: false }; // Fallback for simulator/development
}
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationPreferences {
  dailyReminders: boolean;
  streakReminders: boolean;
  goalDeadlines: boolean;
  weeklyInsights: boolean;
  motivationalMessages: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // "22:00"
    end: string;   // "08:00"
  };
}

const defaultPreferences: NotificationPreferences = {
  dailyReminders: true,
  streakReminders: true,
  goalDeadlines: true,
  weeklyInsights: true,
  motivationalMessages: true,
  quietHours: {
    enabled: true,
    start: '22:00',
    end: '08:00',
  },
};

export class NotificationService {
  private static instance: NotificationService;
  private pushToken: string | null = null;
  private preferences: NotificationPreferences = defaultPreferences;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize() {
    try {
      await this.loadPreferences();
      await this.registerForPushNotifications();
      await this.scheduleDefaultNotifications();
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }

  async registerForPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
      console.log('Must use physical device for Push Notifications');
      return null;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      this.pushToken = token;

      // Save token to AsyncStorage and potentially send to backend
      await AsyncStorage.setItem('pushToken', token);
      
      // TODO: Send token to your backend server
      // await this.sendTokenToBackend(token);

      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      return token;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  }

  async loadPreferences() {
    try {
      const stored = await AsyncStorage.getItem('notificationPreferences');
      if (stored) {
        this.preferences = { ...defaultPreferences, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
  }

  async savePreferences(preferences: Partial<NotificationPreferences>) {
    try {
      this.preferences = { ...this.preferences, ...preferences };
      await AsyncStorage.setItem('notificationPreferences', JSON.stringify(this.preferences));
      
      // Reschedule notifications based on new preferences
      await this.scheduleDefaultNotifications();
    } catch (error) {
      console.error('Error saving notification preferences:', error);
    }
  }

  getPreferences(): NotificationPreferences {
    return this.preferences;
  }

  async scheduleDefaultNotifications() {
    try {
      // Cancel all existing scheduled notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Temporarily disable scheduled notifications to fix build issues
      // TODO: Fix notification trigger types and re-enable
      console.log('Notification scheduling temporarily disabled for build compatibility');
      
      // if (this.preferences.dailyReminders) {
      //   await this.scheduleDailyCheckInReminder();
      // }

      // if (this.preferences.streakReminders) {
      //   await this.scheduleStreakReminders();
      // }

      // if (this.preferences.weeklyInsights) {
      //   await this.scheduleWeeklyInsights();
      // }

      // if (this.preferences.motivationalMessages) {
      //   await this.scheduleMotivationalMessages();
      // }
    } catch (error) {
      console.error('Error scheduling notifications:', error);
    }
  }

  private async scheduleDailyCheckInReminder() {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🌟 Daily Check-in Time!',
          body: 'How was your day? Take a moment to reflect and maintain your streak.',
          data: { type: 'daily_checkin' },
          sound: true,
        },
        trigger: {
          type: 'calendar',
          hour: 19, // 7 PM
          minute: 0,
          repeats: true,
        } as any,
      });
    } catch (error) {
      console.error('Error scheduling daily check-in reminder:', error);
    }
  }

  private async scheduleStreakReminders() {
    try {
      // Reminder if user hasn't checked in by 9 PM
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔥 Don\'t break your streak!',
          body: 'You haven\'t checked in today. Keep your momentum going!',
          data: { type: 'streak_reminder' },
          sound: true,
        },
        trigger: {
          type: 'calendar',
          hour: 21, // 9 PM
          minute: 0,
          repeats: true,
        } as any,
      });
    } catch (error) {
      console.error('Error scheduling streak reminders:', error);
    }
  }

  private async scheduleWeeklyInsights() {
    try {
      // Sunday at 6 PM
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '📊 Your Weekly Insights are Ready!',
          body: 'See how you performed this week and get personalized recommendations.',
          data: { type: 'weekly_insights' },
          sound: true,
        },
        trigger: {
          type: 'calendar',
          weekday: 1, // Sunday
          hour: 18,
          minute: 0,
          repeats: true,
        } as any,
      });
    } catch (error) {
      console.error('Error scheduling weekly insights:', error);
    }
  }

  private async scheduleMotivationalMessages() {
    const motivationalMessages = [
      { title: '💪 You\'ve got this!', body: 'Every small step counts towards your bigger goals.' },
      { title: '🌟 Believe in yourself', body: 'Your consistency is building something amazing.' },
      { title: '🚀 Keep pushing forward', body: 'Progress, not perfection. You\'re doing great!' },
      { title: '🎯 Focus on today', body: 'What\'s one thing you can do right now to move forward?' },
      { title: '🏆 Celebrate your wins', body: 'Take a moment to appreciate how far you\'ve come.' },
    ];

    // Schedule random motivational messages (3 per week)
    for (let i = 0; i < 3; i++) {
      try {
        const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
        const randomHour = Math.floor(Math.random() * 4) + 10; // Between 10 AM and 2 PM
        const randomDay = Math.floor(Math.random() * 7) + 1; // Random day of week

        await Notifications.scheduleNotificationAsync({
          content: {
            title: randomMessage.title,
            body: randomMessage.body,
            data: { type: 'motivational' },
            sound: true,
          },
          trigger: {
            type: 'calendar',
            weekday: randomDay,
            hour: randomHour,
            minute: 0,
            repeats: true,
          } as any,
        });
      } catch (error) {
        console.error('Error scheduling motivational message:', error);
      }
    }
  }

  async scheduleGoalDeadlineReminder(goalTitle: string, deadline: Date) {
    if (!this.preferences.goalDeadlines) return;

    try {
      // Remind 24 hours before deadline
      const reminderTime = new Date(deadline.getTime() - 24 * 60 * 60 * 1000);

      if (reminderTime > new Date()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '⏰ Goal Deadline Approaching',
            body: `"${goalTitle}" is due tomorrow. You've got this!`,
            data: { type: 'goal_deadline', goalTitle },
            sound: true,
          },
          trigger: { date: reminderTime } as any,
        });
      }
    } catch (error) {
      console.error('Error scheduling goal deadline reminder:', error);
    }
  }

  async sendImmediateNotification(title: string, body: string, data?: any) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: true,
      },
      trigger: null, // Send immediately
    });
  }

  // Streak milestone notifications
  async celebrateStreak(streakCount: number) {
    const milestones = [3, 7, 14, 30, 50, 100];
    
    if (milestones.includes(streakCount)) {
      let title = '';
      let body = '';
      
      switch (streakCount) {
        case 3:
          title = '🔥 3-Day Streak!';
          body = 'You\'re building momentum! Keep it going.';
          break;
        case 7:
          title = '🚀 One Week Strong!';
          body = 'A full week of consistency. You\'re amazing!';
          break;
        case 14:
          title = '💎 Two Week Champion!';
          body = 'Your dedication is inspiring. Keep pushing!';
          break;
        case 30:
          title = '👑 30-Day Master!';
          body = 'One month of consistency. You\'re unstoppable!';
          break;
        case 50:
          title = '🏆 50-Day Legend!';
          body = 'You\'re in the top 1% of users. Incredible!';
          break;
        case 100:
          title = '🌟 100-Day Superhuman!';
          body = 'You\'ve achieved something extraordinary!';
          break;
      }
      
      await this.sendImmediateNotification(title, body, { 
        type: 'streak_milestone', 
        streak: streakCount 
      });
    }
  }

  // Level up notifications
  async celebrateLevelUp(newLevel: number, xpGained: number) {
    await this.sendImmediateNotification(
      `🎉 Level ${newLevel} Achieved!`,
      `You gained ${xpGained} XP and leveled up! Keep growing.`,
      { type: 'level_up', level: newLevel, xp: xpGained }
    );
  }

  async getPushToken(): Promise<string | null> {
    return this.pushToken;
  }

  async clearAllNotifications() {
    await Notifications.dismissAllNotificationsAsync();
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();

// Utility functions
export const initializeNotifications = () => notificationService.initialize();
export const getNotificationPreferences = () => notificationService.getPreferences();
export const updateNotificationPreferences = (prefs: Partial<NotificationPreferences>) => 
  notificationService.savePreferences(prefs); 