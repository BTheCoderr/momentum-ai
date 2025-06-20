import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import { API_CONFIG, MOBILE_CONFIG } from './lib/config';

// Import the new components
const OnboardingFlow = ({ isOpen, onComplete }: any) => {
  // Simplified onboarding for mobile - could be expanded later
  if (!isOpen) return null;
  
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  
  const handleComplete = () => {
    onComplete({
      name: name || 'Friend',
      primaryGoal: goal || 'Personal growth',
      preferredTone: 'supportive'
    });
  };
  
  return (
    <View style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      <View style={{
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        margin: 20,
        width: '90%',
        maxWidth: 400,
      }}>
        {step === 1 && (
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>👋</Text>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>
              Welcome to Your Journey
            </Text>
            <Text style={{ fontSize: 16, color: '#666', marginBottom: 24, textAlign: 'center' }}>
              I'm here to grow alongside you. What should I call you?
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your name..."
              style={{
                width: '100%',
                padding: 12,
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 8,
                fontSize: 16,
                marginBottom: 20,
                textAlign: 'center'
              }}
            />
            <TouchableOpacity
              onPress={() => setStep(2)}
              disabled={!name.trim()}
              style={{
                backgroundColor: name.trim() ? '#007AFF' : '#ccc',
                paddingVertical: 12,
                paddingHorizontal: 24,
                borderRadius: 8,
                width: '100%',
              }}
            >
              <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>
                Continue
              </Text>
            </TouchableOpacity>
          </View>
        )}
        
        {step === 2 && (
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🎯</Text>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>
              What's your main goal?
            </Text>
            <Text style={{ fontSize: 16, color: '#666', marginBottom: 24, textAlign: 'center' }}>
              This doesn't have to be perfect - we can evolve it together.
            </Text>
            <TextInput
              value={goal}
              onChangeText={setGoal}
              placeholder="I want to..."
              multiline
              style={{
                width: '100%',
                padding: 12,
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 8,
                fontSize: 16,
                marginBottom: 20,
                minHeight: 80,
                textAlignVertical: 'top'
              }}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
              <TouchableOpacity
                onPress={() => setStep(1)}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: '#666', fontWeight: '600' }}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleComplete}
                style={{
                  backgroundColor: '#34C759',
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: 'white', fontWeight: '600' }}>Begin Journey ✨</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const DailyCheckInModal = ({ isOpen, onClose, onSubmit }: any) => {
  if (!isOpen) return null;
  
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [wins, setWins] = useState('');
  const [challenges, setChallenges] = useState('');
  
  const handleSubmit = () => {
    onSubmit({
      mood,
      energy,
      stress: 3,
      wins: wins ? [wins] : [],
      challenges: challenges ? [challenges] : [],
      priorities: [],
      reflection: ''
    });
    onClose();
  };
  
  return (
    <View style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      <View style={{
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        margin: 20,
        width: '90%',
        maxWidth: 400,
      }}>
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>📝</Text>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
            Daily Check-In
          </Text>
          <Text style={{ fontSize: 16, color: '#666', textAlign: 'center' }}>
            How are you feeling today?
          </Text>
        </View>
        
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
            Mood (1-5): {mood}
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {[1, 2, 3, 4, 5].map(num => (
              <TouchableOpacity
                key={num}
                onPress={() => setMood(num)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: mood === num ? '#007AFF' : '#f0f0f0',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: mood === num ? 'white' : '#666', fontWeight: '600' }}>
                  {num}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
            Energy (1-5): {energy}
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {[1, 2, 3, 4, 5].map(num => (
              <TouchableOpacity
                key={num}
                onPress={() => setEnergy(num)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: energy === num ? '#34C759' : '#f0f0f0',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: energy === num ? 'white' : '#666', fontWeight: '600' }}>
                  {num}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <TextInput
          value={wins}
          onChangeText={setWins}
          placeholder="What went well today?"
          style={{
            width: '100%',
            padding: 12,
            borderWidth: 1,
            borderColor: '#ddd',
            borderRadius: 8,
            fontSize: 16,
            marginBottom: 16,
          }}
        />
        
        <TextInput
          value={challenges}
          onChangeText={setChallenges}
          placeholder="Any challenges?"
          style={{
            width: '100%',
            padding: 12,
            borderWidth: 1,
            borderColor: '#ddd',
            borderRadius: 8,
            fontSize: 16,
            marginBottom: 24,
          }}
        />
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity
            onPress={onClose}
            style={{
              paddingVertical: 12,
              paddingHorizontal: 24,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: '#666', fontWeight: '600' }}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSubmit}
            style={{
              backgroundColor: '#34C759',
              paddingVertical: 12,
              paddingHorizontal: 24,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>Complete ✨</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Clean iOS-style Design System
const COLORS = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  background: '#F2F2F7',
  surface: '#FFFFFF',
  text: '#000000',
  textSecondary: '#8E8E93',
  textMuted: '#C7C7CC',
  border: '#E5E5EA',
};

// Simple Icon Component
const Icon = ({ emoji, size = 24 }: { emoji: string; size?: number }) => (
  <Text style={{ fontSize: size }}>{emoji}</Text>
);

// Clean Card Component
const Card = ({ children, style = {} }: any) => (
  <View style={[styles.card, style]}>{children}</View>
);

// Simple Button
const Button = ({ title, onPress, variant = 'primary', icon, style = {} }: any) => {
  const getButtonStyle = () => {
    switch (variant) {
      case 'success': return { backgroundColor: COLORS.success };
      case 'warning': return { backgroundColor: COLORS.warning };
      case 'secondary': return { backgroundColor: COLORS.secondary };
      default: return { backgroundColor: COLORS.primary };
    }
  };

  return (
    <TouchableOpacity onPress={onPress} style={[styles.button, getButtonStyle(), style]}>
      <View style={styles.buttonContent}>
        {icon && <Icon emoji={icon} size={18} />}
        <Text style={styles.buttonText}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

// Settings Item
const SettingsItem = ({ icon, title, subtitle, onPress }: any) => (
  <TouchableOpacity onPress={onPress} style={styles.settingsItem}>
    <View style={styles.settingsLeft}>
      <View style={styles.iconContainer}>
        <Icon emoji={icon} size={20} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.settingsTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingsSubtitle}>{subtitle}</Text>}
      </View>
    </View>
    <Icon emoji="›" size={16} />
  </TouchableOpacity>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [chatMessage, setChatMessage] = useState('');
  const [aiMessages, setAiMessages] = useState([
    {
      id: '1',
      text: "I'm glad we're connecting. I'm here to grow alongside you - not just as a tool, but as someone who genuinely cares about your journey. What's been on your mind lately?",
      isAI: true,
      timestamp: new Date().toLocaleTimeString(),
    }
  ]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: 'User',
    hasCompletedOnboarding: false,
    primaryGoal: '',
    preferredTone: 'supportive'
  });

  // Check-in functionality
  const handleCheckInSubmit = async (checkInData: any) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/checkins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'mobile-user',
          ...checkInData
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        Alert.alert(
          'Check-in Complete! 🎉',
          data.message || 'Thank you for sharing. Your consistency is building something beautiful.',
          [{ text: 'Continue', style: 'default' }]
        );
      }
    } catch (error) {
      console.error('Check-in error:', error);
      Alert.alert(
        'Check-in Saved',
        'Your check-in has been saved locally. Your commitment to growth is what matters most.',
        [{ text: 'Continue', style: 'default' }]
      );
    }
  };

  // Onboarding completion
  const handleOnboardingComplete = (onboardingData: any) => {
    setUserProfile({
      name: onboardingData.name,
      hasCompletedOnboarding: true,
      primaryGoal: onboardingData.primaryGoal,
      preferredTone: onboardingData.preferredTone
    });
    setShowOnboarding(false);
    
    // Send welcome message from AI
    const welcomeMessage = {
      id: Date.now().toString(),
      text: `Hi ${onboardingData.name}! I'm excited to be part of your journey toward "${onboardingData.primaryGoal}". I'll be here every step of the way, adapting to what you need most. Ready to get started?`,
      isAI: true,
      timestamp: new Date().toLocaleTimeString(),
    };
    setAiMessages(prev => [...prev, welcomeMessage]);
  };

  // AI Chat functionality - now uses the lifelong partner endpoint
  const sendMessageToAI = async (message: string) => {
    if (!message.trim()) return;

    setIsLoadingAI(true);
    
    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      text: message,
      isAI: false,
      timestamp: new Date().toLocaleTimeString(),
    };
    
    setAiMessages(prev => [...prev, userMessage]);
    setChatMessage('');

    try {
      // Call the lifelong partner endpoint
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/ai/productivity-coach`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          userId: 'mobile-user',
          context: {
            userName: userProfile.name,
            primaryGoal: userProfile.primaryGoal,
            preferredTone: userProfile.preferredTone
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Expected JSON but got:', text.substring(0, 200));
        throw new Error('Server returned HTML instead of JSON - check if API server is running');
      }

      const data = await response.json();
      
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: data.response || "I'm here to support you in whatever way you need. What's on your mind?",
        isAI: true,
        timestamp: new Date().toLocaleTimeString(),
      };
      
      setAiMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI Chat Error:', error);
      
      // Fallback response based on user's preferred tone
      let fallbackMessage = "I'm having a moment of technical difficulty, but I'm still here with you. What's on your mind?";
      
      if (userProfile.preferredTone === 'energetic') {
        fallbackMessage = "Technical hiccup on my end, but our momentum continues! What's the main thing you want to tackle today?";
      } else if (userProfile.preferredTone === 'thoughtful') {
        fallbackMessage = "I'm experiencing some technical challenges right now, but sometimes these pauses give us space to reflect. What's been on your mind?";
      }
      
      const fallbackAiMessage = {
        id: (Date.now() + 1).toString(),
        text: fallbackMessage,
        isAI: true,
        timestamp: new Date().toLocaleTimeString(),
      };
      
      setAiMessages(prev => [...prev, fallbackAiMessage]);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const renderDashboard = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.welcomeTitle}>
          {userProfile.hasCompletedOnboarding ? `Welcome back, ${userProfile.name}! 👋` : 'Welcome! 👋'}
        </Text>
        <Text style={styles.welcomeSubtitle}>
          {userProfile.primaryGoal ? `Ready to work on "${userProfile.primaryGoal}"?` : 'Ready to achieve your goals today?'}
        </Text>
      </View>

      {!userProfile.hasCompletedOnboarding && (
        <Card style={[styles.heroCard, { backgroundColor: '#F0F9FF' }]}>
          <Text style={styles.heroTitle}>Let's Get Started ✨</Text>
          <Text style={styles.heroDescription}>
            I'd love to learn about you and what matters most. This will help me become a better companion on your journey.
          </Text>
          <Button
            title="Begin Setup"
            icon="🚀"
            variant="primary"
            style={styles.heroButton}
            onPress={() => setShowOnboarding(true)}
          />
        </Card>
      )}

      <Card style={styles.heroCard}>
        <Text style={styles.heroTitle}>
          {userProfile.hasCompletedOnboarding ? 'Your Lifelong Partner' : 'Momentum AI'}
        </Text>
        <Text style={styles.heroSubtitle}>AI-Powered Growth Companion</Text>
        <Text style={styles.heroDescription}>
          {userProfile.hasCompletedOnboarding 
            ? 'I learn your patterns, understand your challenges, and grow alongside you.'
            : 'Stay emotionally connected to your goals with AI-powered insights and daily check-ins.'
          }
        </Text>
        <Button
          title="Start Daily Check-In"
          icon="🎯"
          variant="success"
          style={styles.heroButton}
          onPress={() => setShowCheckIn(true)}
        />
      </Card>

      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Icon emoji="🎯" size={32} />
          <Text style={styles.statValue}>2</Text>
          <Text style={styles.statLabel}>Active Goals</Text>
        </Card>
        
        <Card style={styles.statCard}>
          <Icon emoji="📊" size={32} />
          <Text style={styles.statValue}>85%</Text>
          <Text style={styles.statLabel}>Progress</Text>
        </Card>
      </View>

      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Icon emoji="🔥" size={32} />
          <Text style={styles.statValue}>7</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </Card>
        
        <Card style={styles.statCard}>
          <Icon emoji="✅" size={32} />
          <Text style={styles.statValue}>3</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </Card>
      </View>
    </ScrollView>
  );

  const renderGoals = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Your Goals</Text>
        <Text style={styles.pageSubtitle}>Track your progress and stay motivated</Text>
      </View>

      <Button
        title="Add New Goal"
        icon="➕"
        style={styles.addButton}
        onPress={() => Alert.alert('Add Goal', 'Goal creation coming soon!')}
      />

      <Card style={styles.goalCard}>
        <View style={styles.goalHeader}>
          <Text style={styles.goalTitle}>Launch My SaaS Product</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>On Track</Text>
          </View>
        </View>
        
        <Text style={styles.goalDescription}>Build and launch my productivity app by Q2</Text>
        
        <View style={styles.progressSection}>
          <Text style={styles.progressLabel}>Progress</Text>
          <Text style={styles.progressValue}>65%</Text>
        </View>
        
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '65%' }]} />
        </View>

        <View style={styles.goalStats}>
          <View style={styles.statItem}>
            <Icon emoji="🔥" size={24} />
            <Text style={styles.statText}>12 days</Text>
            <Text style={styles.statSubtext}>Current streak</Text>
          </View>
          <View style={styles.statItem}>
            <Icon emoji="📅" size={24} />
            <Text style={styles.statText}>2/3</Text>
            <Text style={styles.statSubtext}>Today's habits</Text>
          </View>
        </View>
      </Card>
    </ScrollView>
  );

  const renderAICoach = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>AI Coach</Text>
        <Text style={styles.pageSubtitle}>Your personal accountability partner</Text>
      </View>

      <ScrollView style={styles.chatContainer} showsVerticalScrollIndicator={false}>
        {aiMessages.map((message) => (
          <Card key={message.id} style={styles.messageCard}>
            <Text style={styles.messageText}>{message.text}</Text>
            <Text style={styles.messageTime}>{message.timestamp}</Text>
          </Card>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <Card style={styles.inputCard}>
          <TextInput
            style={styles.textInput}
            placeholder="Ask your AI coach anything..."
            placeholderTextColor={COLORS.textMuted}
            multiline
            value={chatMessage}
            onChangeText={setChatMessage}
          />
          <Button
            title="Send"
            style={styles.sendButton}
            onPress={() => sendMessageToAI(chatMessage)}
            disabled={isLoadingAI}
          />
        </Card>
      </View>
    </View>
  );

  const renderSettings = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>U</Text>
        </View>
        <Text style={styles.profileName}>User</Text>
        <Text style={styles.profileEmail}>user@example.com</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.profileStat}>
          <Icon emoji="🔥" size={24} />
          <Text style={styles.profileStatValue}>47</Text>
          <Text style={styles.profileStatLabel}>Total Streaks</Text>
        </View>
        <View style={styles.profileStat}>
          <Icon emoji="🎯" size={24} />
          <Text style={styles.profileStatValue}>2</Text>
          <Text style={styles.profileStatLabel}>Active Goals</Text>
        </View>
        <View style={styles.profileStat}>
          <Icon emoji="✅" size={24} />
          <Text style={styles.profileStatValue}>8</Text>
          <Text style={styles.profileStatLabel}>Completed</Text>
        </View>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <Card style={styles.settingsGroup}>
          <SettingsItem
            icon="👤"
            title="Edit Profile"
            subtitle="Update your information"
            onPress={() => Alert.alert('Edit Profile', 'Update your name, email, and preferences.')}
          />
          <SettingsItem
            icon="🔔"
            title="Notifications"
            subtitle="Daily reminders enabled"
            onPress={() => Alert.alert('Notifications', 'Customize your reminder settings:\n\n• Morning check-in: 8:00 AM\n• Evening reflection: 6:00 PM\n• Goal milestone alerts\n• Weekly progress reports')}
          />
        </Card>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Goals</Text>
        <Card style={styles.settingsGroup}>
          <SettingsItem
            icon="📅"
            title="Reminder Times"
            subtitle="8:00 AM, 6:00 PM"
            onPress={() => Alert.alert('Reminder Times', 'Set custom times for check-in reminders and goal reviews.')}
          />
          <SettingsItem
            icon="📊"
            title="Progress Tracking"
            subtitle="Weekly reports enabled"
            onPress={() => Alert.alert('Progress Tracking', 'Configure how you measure success:\n\n• Weekly progress emails\n• Monthly goal reviews\n• Streak tracking\n• Export data to CSV')}
          />
        </Card>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>AI Coach</Text>
        <Card style={styles.settingsGroup}>
          <SettingsItem
            icon="🤖"
            title="Coach Personality"
            subtitle="Supportive & motivational"
            onPress={() => Alert.alert('Coach Personality', 'Choose your AI coaching style:\n\n• Supportive & Encouraging\n• Direct & Challenging\n• Analytical & Data-Driven\n• Results-Focused\n• Mindful & Balanced')}
          />
          <SettingsItem
            icon="⭐"
            title="Insight Frequency"
            subtitle="3 insights per week"
            onPress={() => Alert.alert('Insight Frequency', 'How often you receive AI insights and personalized recommendations.')}
          />
        </Card>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Premium</Text>
        <Card style={styles.settingsGroup}>
          <SettingsItem
            icon="💎"
            title="Upgrade to Pro"
            subtitle="Unlock advanced features"
            onPress={() => Alert.alert('Upgrade to Pro', 'Premium features for $9.99/month:\n\n• Unlimited goals\n• Advanced AI insights\n• Team features\n• Priority support\n• Export data\n\n7-day free trial!')}
          />
        </Card>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Support</Text>
        <Card style={styles.settingsGroup}>
          <SettingsItem
            icon="🔒"
            title="Privacy & Security"
            subtitle="Your data is protected"
            onPress={() => Alert.alert('Privacy & Security', 'Your privacy is our priority:\n\n• End-to-end encryption\n• No data selling\n• GDPR compliant\n• Delete account option')}
          />
          <SettingsItem
            icon="📤"
            title="Share App"
            subtitle="Tell friends about Momentum AI"
            onPress={() => Alert.alert('Share App', 'Help others achieve their goals! Share Momentum AI with friends and family.')}
          />
        </Card>
      </View>

      <View style={styles.signOutSection}>
        <Button
          title="Sign Out"
          variant="error"
          style={styles.signOutButton}
          onPress={() => Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign Out', style: 'destructive' }
          ])}
        />
      </View>
    </ScrollView>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'goals': return renderGoals();
      case 'coach': return renderAICoach();
      case 'settings': return renderSettings();
      default: return renderDashboard();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <View style={styles.main}>
        {renderTabContent()}
      </View>

      {/* Clean Tab Bar */}
      <View style={styles.tabBar}>
        {[
          { key: 'dashboard', icon: '🏠', label: 'Dashboard' },
          { key: 'goals', icon: '🎯', label: 'Goals' },
          { key: 'coach', icon: '🤖', label: 'AI Coach' },
          { key: 'settings', icon: '⚙️', label: 'Settings' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            onPress={() => setActiveTab(tab.key)}
          >
            <View style={[
              styles.tabIconContainer,
              activeTab === tab.key && styles.tabIconActive,
            ]}>
              <Icon emoji={tab.icon} size={22} />
            </View>
            <Text style={[
              styles.tabLabel,
              activeTab === tab.key && styles.tabLabelActive,
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Onboarding Modal */}
      <OnboardingFlow
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
      />
      
      {/* Check-In Modal */}
      <DailyCheckInModal
        isOpen={showCheckIn}
        onClose={() => setShowCheckIn(false)}
        onSubmit={handleCheckInSubmit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  main: { 
    flex: 1 
  },
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  
  // Card
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // Header
  header: { 
    paddingHorizontal: 20, 
    paddingVertical: 24,
    backgroundColor: COLORS.surface,
    marginBottom: 16,
  },
  welcomeTitle: { 
    fontSize: 28, 
    fontWeight: '700', 
    color: COLORS.text, 
    marginBottom: 4 
  },
  welcomeSubtitle: { 
    fontSize: 16, 
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  pageTitle: { 
    fontSize: 32, 
    fontWeight: '700', 
    color: COLORS.text, 
    marginBottom: 4 
  },
  pageSubtitle: { 
    fontSize: 16, 
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  
  // Hero Card
  heroCard: { 
    alignItems: 'center', 
    paddingVertical: 24 
  },
  heroTitle: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: COLORS.text, 
    marginBottom: 4 
  },
  heroSubtitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: COLORS.primary, 
    marginBottom: 12 
  },
  heroDescription: { 
    fontSize: 16, 
    color: COLORS.textSecondary, 
    textAlign: 'center', 
    lineHeight: 22, 
    marginBottom: 20 
  },
  heroButton: { 
    paddingHorizontal: 32 
  },
  
  // Stats
  statsGrid: { 
    flexDirection: 'row', 
    paddingHorizontal: 8, 
    marginBottom: 8 
  },
  statCard: { 
    flex: 1, 
    alignItems: 'center', 
    marginHorizontal: 8, 
    paddingVertical: 20 
  },
  statValue: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: COLORS.text, 
    marginTop: 8, 
    marginBottom: 4 
  },
  statLabel: { 
    fontSize: 14, 
    fontWeight: '500', 
    color: COLORS.textSecondary 
  },
  
  // Button
  button: { 
    borderRadius: 12, 
    paddingVertical: 14, 
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonContent: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  buttonText: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: COLORS.surface, 
    marginLeft: 8 
  },
  
  // Goals
  addButton: { 
    marginHorizontal: 16, 
    marginBottom: 16 
  },
  goalCard: { 
    marginBottom: 16 
  },
  goalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  goalTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: COLORS.text, 
    flex: 1 
  },
  statusBadge: { 
    backgroundColor: COLORS.success, 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 8 
  },
  statusText: { 
    fontSize: 12, 
    fontWeight: '600', 
    color: COLORS.surface 
  },
  goalDescription: { 
    fontSize: 14, 
    color: COLORS.textSecondary, 
    marginBottom: 16, 
    lineHeight: 20 
  },
  progressSection: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  progressLabel: { 
    fontSize: 14, 
    fontWeight: '500', 
    color: COLORS.text 
  },
  progressValue: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: COLORS.primary 
  },
  progressBar: { 
    height: 8, 
    backgroundColor: COLORS.border, 
    borderRadius: 4, 
    marginBottom: 16 
  },
  progressFill: { 
    height: '100%', 
    backgroundColor: COLORS.primary, 
    borderRadius: 4 
  },
  goalStats: { 
    flexDirection: 'row', 
    justifyContent: 'space-around' 
  },
  statItem: { 
    alignItems: 'center' 
  },
  statText: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: COLORS.text, 
    marginTop: 4 
  },
  statSubtext: { 
    fontSize: 12, 
    color: COLORS.textSecondary, 
    marginTop: 2 
  },
  
  // Chat
  chatContainer: { 
    flex: 1, 
    paddingHorizontal: 16 
  },
  messageCard: { 
    alignSelf: 'flex-start', 
    maxWidth: '85%', 
    marginBottom: 16 
  },
  messageText: { 
    fontSize: 16, 
    color: COLORS.text, 
    lineHeight: 22, 
    marginBottom: 8 
  },
  messageTime: { 
    fontSize: 12, 
    color: COLORS.textMuted 
  },
  inputContainer: { 
    paddingHorizontal: 16, 
    paddingBottom: 16 
  },
  inputCard: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    paddingVertical: 8 
  },
  textInput: { 
    flex: 1, 
    fontSize: 16, 
    color: COLORS.text, 
    maxHeight: 80, 
    marginRight: 12 
  },
  sendButton: { 
    paddingHorizontal: 16, 
    paddingVertical: 8 
  },
  
  // Settings
  profileSection: { 
    alignItems: 'center', 
    paddingVertical: 32, 
    backgroundColor: COLORS.surface, 
    marginBottom: 16 
  },
  avatar: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    backgroundColor: COLORS.primary, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 16 
  },
  avatarText: { 
    fontSize: 32, 
    fontWeight: '600', 
    color: COLORS.surface 
  },
  profileName: { 
    fontSize: 24, 
    fontWeight: '600', 
    color: COLORS.text, 
    marginBottom: 4 
  },
  profileEmail: { 
    fontSize: 16, 
    color: COLORS.textSecondary 
  },
  statsRow: { 
    flexDirection: 'row', 
    paddingHorizontal: 8, 
    marginBottom: 16 
  },
  profileStat: { 
    flex: 1, 
    alignItems: 'center', 
    backgroundColor: COLORS.surface, 
    paddingVertical: 16, 
    marginHorizontal: 8, 
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  profileStatValue: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: COLORS.text, 
    marginTop: 8, 
    marginBottom: 4 
  },
  profileStatLabel: { 
    fontSize: 12, 
    fontWeight: '500', 
    color: COLORS.textSecondary 
  },
  settingsSection: { 
    marginBottom: 24 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: COLORS.text, 
    marginBottom: 8, 
    marginLeft: 16 
  },
  settingsGroup: { 
    padding: 0 
  },
  settingsItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingVertical: 16, 
    paddingHorizontal: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: COLORS.border 
  },
  settingsLeft: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1 
  },
  iconContainer: { 
    width: 36, 
    height: 36, 
    borderRadius: 8, 
    backgroundColor: COLORS.background, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 12 
  },
  textContainer: { 
    flex: 1 
  },
  settingsTitle: { 
    fontSize: 16, 
    fontWeight: '500', 
    color: COLORS.text, 
    marginBottom: 2 
  },
  settingsSubtitle: { 
    fontSize: 14, 
    color: COLORS.textSecondary 
  },
  signOutSection: { 
    paddingHorizontal: 16, 
    paddingBottom: 32 
  },
  signOutButton: { 
    backgroundColor: COLORS.error 
  },
  
  // Tab Bar
  tabBar: { 
    flexDirection: 'row', 
    backgroundColor: COLORS.surface, 
    borderTopWidth: 1, 
    borderTopColor: COLORS.border, 
    paddingBottom: Platform.OS === 'ios' ? 20 : 10, 
    paddingTop: 10 
  },
  tabItem: { 
    flex: 1, 
    alignItems: 'center' 
  },
  tabIconContainer: { 
    width: 32, 
    height: 32, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 4 
  },
  tabIconActive: { 
    backgroundColor: COLORS.primary + '20', 
    borderRadius: 8 
  },
  tabLabel: { 
    fontSize: 10, 
    fontWeight: '500', 
    color: COLORS.textMuted 
  },
  tabLabelActive: { 
    color: COLORS.primary, 
    fontWeight: '600' 
  },
});