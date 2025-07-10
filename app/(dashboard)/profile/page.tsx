'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Profile {
  fullName: string;
  email: string;
  primaryGoal: string;
  bio: string;
  preferredCoachingStyle: 'supportive' | 'direct' | 'analytical';
  timezone: string;
  avatar: string;
}

interface NotificationSettings {
  dailyReminders: boolean;
  weeklyInsights: boolean;
  achievementAlerts: boolean;
  streakReminders: boolean;
  motivationalMessages: boolean;
}

interface Stats {
  totalGoals: number;
  completedGoals: number;
  currentStreak: number;
  totalXP: number;
  level: number;
  joinDate: string;
}

const ProfilePage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'settings' | 'stats'>('profile');
  const [loading, setLoading] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  
  const [profile, setProfile] = useState<Profile>({
    fullName: 'Alex Johnson',
    email: 'alex@example.com',
    primaryGoal: 'Build healthy daily habits',
    bio: 'Focused on building sustainable habits and achieving long-term goals.',
    preferredCoachingStyle: 'supportive',
    timezone: 'PST',
    avatar: '👤'
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    dailyReminders: true,
    weeklyInsights: true,
    achievementAlerts: true,
    streakReminders: true,
    motivationalMessages: true,
  });

  const [stats, setStats] = useState<Stats>({
    totalGoals: 12,
    completedGoals: 8,
    currentStreak: 7,
    totalXP: 2450,
    level: 5,
    joinDate: '2024-01-15'
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    // Load user data from API/storage
    // This would connect to your actual data source
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // Save profile changes
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = (key: keyof NotificationSettings, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  const handleSignOut = () => {
    // Clear user data and redirect to auth
    router.push('/auth');
  };

  const handleExportData = () => {
    const data = { profile, stats, exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'momentum-ai-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
            <img src="/images/icon.png" alt="Profile" className="w-16 h-16 rounded-full" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{profile.fullName}</h2>
            <p className="text-white/90">Level {stats.level} • {stats.totalXP} XP</p>
            <p className="text-white/80">{profile.primaryGoal}</p>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={profile.fullName}
              onChange={(e) => setProfile({...profile, fullName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 opacity-70"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Goal</label>
            <input
              type="text"
              value={profile.primaryGoal}
              onChange={(e) => setProfile({...profile, primaryGoal: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({...profile, bio: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Tell us about yourself..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Coaching Style</label>
            <div className="flex gap-2">
              {(['supportive', 'direct', 'analytical'] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => setProfile({...profile, preferredCoachingStyle: style})}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    profile.preferredCoachingStyle === style
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={loading}
          className="w-full mt-6 bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      {/* Notifications */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🔔 Notifications</h3>
        
        <div className="space-y-4">
          {Object.entries(notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </div>
                <div className="text-sm text-gray-500">
                  {key === 'dailyReminders' && 'Get reminded to check in daily'}
                  {key === 'weeklyInsights' && 'Receive weekly progress insights'}
                  {key === 'achievementAlerts' && 'Notifications for achievements'}
                  {key === 'streakReminders' && 'Keep your streak alive'}
                  {key === 'motivationalMessages' && 'Daily motivational messages'}
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => handleNotificationChange(key as keyof NotificationSettings, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Data & Privacy */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🛡️ Data & Privacy</h3>
        
        <div className="space-y-3">
          <button
            onClick={handleExportData}
            className="w-full text-left p-3 rounded-lg hover:bg-gray-50 border border-gray-200"
          >
            <div className="font-medium text-gray-900">📁 Export Data</div>
            <div className="text-sm text-gray-500">Download your data as JSON</div>
          </button>
          
          <button
            onClick={() => router.push('/privacy')}
            className="w-full text-left p-3 rounded-lg hover:bg-gray-50 border border-gray-200"
          >
            <div className="font-medium text-gray-900">📋 Privacy Policy</div>
            <div className="text-sm text-gray-500">View our privacy policy</div>
          </button>
          
          <button
            onClick={() => router.push('/support')}
            className="w-full text-left p-3 rounded-lg hover:bg-gray-50 border border-gray-200"
          >
            <div className="font-medium text-gray-900">❓ Support</div>
            <div className="text-sm text-gray-500">Get help and support</div>
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
        <h3 className="text-lg font-semibold text-red-900 mb-4">⚠️ Danger Zone</h3>
        
        <button
          onClick={() => setShowSignOutModal(true)}
          className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );

  const renderStatsTab = () => (
    <div className="space-y-6">
      {/* Achievement Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
          <div className="text-2xl font-bold text-green-600">{stats.completedGoals}</div>
          <div className="text-sm text-gray-600">Goals Completed</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.currentStreak}</div>
          <div className="text-sm text-gray-600">Current Streak</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.totalXP}</div>
          <div className="text-sm text-gray-600">Total XP</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.level}</div>
          <div className="text-sm text-gray-600">Level</div>
        </div>
      </div>

      {/* Progress Chart */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Your Journey</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Success Rate</span>
            <span className="font-semibold">{Math.round((stats.completedGoals / stats.totalGoals) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full" 
              style={{ width: `${(stats.completedGoals / stats.totalGoals) * 100}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">XP Progress to Next Level</span>
            <span className="font-semibold">{stats.totalXP % 500}/500 XP</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-500 h-2 rounded-full" 
              style={{ width: `${(stats.totalXP % 500) / 500 * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Achievements</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center p-4 border border-yellow-200 rounded-lg bg-yellow-50">
            <div className="text-2xl mb-2">🥇</div>
            <div className="font-medium text-sm">First Goal</div>
          </div>
          <div className="text-center p-4 border border-orange-200 rounded-lg bg-orange-50">
            <div className="text-2xl mb-2">🔥</div>
            <div className="font-medium text-sm">Week Streak</div>
          </div>
          <div className="text-center p-4 border border-purple-200 rounded-lg bg-purple-50">
            <div className="text-2xl mb-2">⭐</div>
            <div className="font-medium text-sm">Level 5</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-1">Manage your account and preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'profile', label: 'Profile', icon: '👤' },
          { key: 'settings', label: 'Settings', icon: '⚙️' },
          { key: 'stats', label: 'Stats', icon: '📊' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && renderProfileTab()}
      {activeTab === 'settings' && renderSettingsTab()}
      {activeTab === 'stats' && renderStatsTab()}

      {/* Sign Out Modal */}
      {showSignOutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Confirm Sign Out</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to sign out? You'll need to log in again to access your account.</p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowSignOutModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSignOut}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage; 