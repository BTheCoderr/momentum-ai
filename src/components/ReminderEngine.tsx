import React, { useEffect, useState } from 'react';
import { Clock, Bell, BellOff } from 'lucide-react';

interface ReminderSettings {
  enabled: boolean;
  time: string; // Format: "HH:MM"
  frequency: 'daily' | 'weekdays' | 'custom';
  customDays: number[]; // 0-6, Sunday = 0
  lastCheckIn: string | null;
  remindersSent: number;
}

interface ReminderEngineProps {
  userId: string;
  onTriggerCheckIn: () => void;
  streakData: any[];
}

const ReminderEngine: React.FC<ReminderEngineProps> = ({ 
  userId, 
  onTriggerCheckIn, 
  streakData 
}) => {
  const [settings, setSettings] = useState<ReminderSettings>({
    enabled: true,
    time: '09:00',
    frequency: 'daily',
    customDays: [1, 2, 3, 4, 5], // Weekdays
    lastCheckIn: null,
    remindersSent: 0
  });
  const [showSettings, setShowSettings] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem(`reminder_settings_${userId}`);
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    
    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, [userId]);

  // Save settings to localStorage
  const saveSettings = (newSettings: ReminderSettings) => {
    setSettings(newSettings);
    localStorage.setItem(`reminder_settings_${userId}`, JSON.stringify(newSettings));
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission === 'granted';
    }
    return false;
  };

  // Check if user has checked in today
  const hasCheckedInToday = () => {
    const dailyStreak = streakData.find(s => s.streak_type === 'daily_checkin');
    if (!dailyStreak) return false;
    
    const today = new Date().toDateString();
    const lastActivity = new Date(dailyStreak.last_activity_date).toDateString();
    return today === lastActivity;
  };

  // Check if we should send reminder today
  const shouldSendReminder = () => {
    if (!settings.enabled || hasCheckedInToday()) return false;
    
    const now = new Date();
    const today = now.getDay(); // 0 = Sunday
    
    switch (settings.frequency) {
      case 'daily':
        return true;
      case 'weekdays':
        return today >= 1 && today <= 5; // Monday to Friday
      case 'custom':
        return settings.customDays.includes(today);
      default:
        return false;
    }
  };

  // Send notification
  const sendNotification = (title: string, body: string) => {
    if (notificationPermission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: '/images/icon-192.png',
        badge: '/images/icon-192.png',
        tag: 'daily-checkin',
        requireInteraction: true
      });

      notification.onclick = () => {
        window.focus();
        onTriggerCheckIn();
        notification.close();
      };

      // Auto close after 10 seconds
      setTimeout(() => notification.close(), 10000);
    }
  };

  // Check and send reminders
  useEffect(() => {
    if (!shouldSendReminder()) return;

    const checkTime = () => {
      const now = new Date();
      const [hours, minutes] = settings.time.split(':').map(Number);
      const reminderTime = new Date();
      reminderTime.setHours(hours, minutes, 0, 0);

      // Check if it's time for reminder (within 1 minute window)
      const timeDiff = Math.abs(now.getTime() - reminderTime.getTime());
      const oneMinute = 60 * 1000;

      if (timeDiff < oneMinute) {
        const lastReminderDate = localStorage.getItem(`last_reminder_${userId}`);
        const today = new Date().toDateString();

        // Only send one reminder per day
        if (lastReminderDate !== today) {
          const dailyStreak = streakData.find(s => s.streak_type === 'daily_checkin');
          const currentStreak = dailyStreak?.current_streak || 0;
          
          let title = '🔥 Daily Check-In Reminder';
          let body = "Time for your daily check-in! Let's keep the momentum going.";
          
          if (currentStreak > 0) {
            body = `Don't break your ${currentStreak} day streak! Time for your daily check-in.`;
          }
          
          sendNotification(title, body);
          localStorage.setItem(`last_reminder_${userId}`, today);
          
          // Update reminder count
          saveSettings({
            ...settings,
            remindersSent: settings.remindersSent + 1
          });
        }
      }
    };

    // Check every minute
    const interval = setInterval(checkTime, 60000);
    
    // Check immediately
    checkTime();

    return () => clearInterval(interval);
  }, [settings, streakData, userId, shouldSendReminder]);

  const getReminderMessage = () => {
    if (hasCheckedInToday()) {
      return "✅ You've already checked in today! Great job!";
    }
    
    const dailyStreak = streakData.find(s => s.streak_type === 'daily_checkin');
    const currentStreak = dailyStreak?.current_streak || 0;
    
    if (currentStreak === 0) {
      return "🌱 Ready to start your streak? Check in now!";
    }
    
    return `🔥 Don't break your ${currentStreak} day streak! Check in now.`;
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Smart Reminders</h3>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <Bell className="w-4 h-4" />
        </button>
      </div>

      <p className="text-sm text-gray-600 mb-3">
        {getReminderMessage()}
      </p>

      {!hasCheckedInToday() && (
        <button
          onClick={onTriggerCheckIn}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:shadow-lg transition-all font-medium"
        >
          Check In Now
        </button>
      )}

      {showSettings && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Enable Reminders
            </label>
            <button
              onClick={() => saveSettings({ ...settings, enabled: !settings.enabled })}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.enabled ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                settings.enabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Reminder Time
            </label>
            <input
              type="time"
              value={settings.time}
              onChange={(e) => saveSettings({ ...settings, time: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Frequency
            </label>
            <select
              value={settings.frequency}
              onChange={(e) => saveSettings({ 
                ...settings, 
                frequency: e.target.value as 'daily' | 'weekdays' | 'custom' 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">Every Day</option>
              <option value="weekdays">Weekdays Only</option>
              <option value="custom">Custom Days</option>
            </select>
          </div>

          {notificationPermission !== 'granted' && (
            <button
              onClick={requestNotificationPermission}
              className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors font-medium"
            >
              Enable Browser Notifications
            </button>
          )}

          <div className="text-xs text-gray-500">
            Reminders sent: {settings.remindersSent}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReminderEngine; 