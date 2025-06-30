import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Platform, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../components/ThemeProvider';

// Import screens
import DuolingoHomeScreen from '../screens/DuolingoHomeScreen';
import CheckInScreen from '../screens/CheckInScreen';
import AICoachScreen from '../screens/AICoachScreen';
import InsightsScreen from '../screens/InsightsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ReflectionScreen from '../screens/ReflectionScreen';
import GoalsScreen from '../screens/GoalsScreen';
import XPProgressScreen from '../screens/XPProgressScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import { PrivacyPolicyScreen } from '../screens/PrivacyPolicyScreen';
import { DataUsageScreen } from '../screens/DataUsageScreen';
import { MemorySettingsScreen } from '../screens/MemorySettingsScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { PlanCreatorScreen } from '../screens/PlanCreatorScreen';
import { DailyCoachingScreen } from '../screens/DailyCoachingScreen';
import { ProgressAnalyticsScreen } from '../screens/ProgressAnalyticsScreen';
import { MemoryUsageScreen } from '../screens/MemoryUsageScreen';
import { PrivacySettingsScreen } from '../screens/PrivacySettingsScreen';
import { TermsOfServiceScreen } from '../screens/TermsOfServiceScreen';

// Import tutorial
import TutorialOverlay from '../components/TutorialOverlay';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Tab Navigator
function MainTabs() {
  const { theme } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 10,
          height: Platform.OS === 'ios' ? 90 : 70,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          color: theme.colors.text,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={DuolingoHomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏠" focused={focused} />
          ),
        }}
      />
      <Tab.Screen 
        name="Check-In" 
        component={CheckInScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📝" focused={focused} />
          ),
        }}
      />
      <Tab.Screen 
        name="Coach" 
        component={AICoachScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🤖" focused={focused} />
          ),
        }}
      />
      <Tab.Screen 
        name="Insights" 
        component={InsightsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="💡" focused={focused} />
          ),
        }}
      />
      <Tab.Screen 
        name="Leaderboard" 
        component={LeaderboardScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏆" focused={focused} />
          ),
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="⚙️" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Tab Icon Component
const TabIcon = ({ emoji, focused }: { emoji: string; focused: boolean }) => {
  const { theme } = useTheme();
  return (
    <Text style={{
      fontSize: focused ? 28 : 24,
      opacity: focused ? 1 : 0.7,
      transform: [{ scale: focused ? 1.1 : 1 }],
      color: focused ? theme.colors.primary : theme.colors.textSecondary,
    }}>
      {emoji}
    </Text>
  );
};

// Stack Navigator
function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="Goals" component={GoalsScreen} />
      <Stack.Screen name="Reflection" component={ReflectionScreen} />
      <Stack.Screen name="XPProgress" component={XPProgressScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="PlanCreator" component={PlanCreatorScreen} />
      <Stack.Screen name="DailyCoaching" component={DailyCoachingScreen} />
      <Stack.Screen name="ProgressAnalytics" component={ProgressAnalyticsScreen} />
      <Stack.Screen name="MemorySettings" component={MemorySettingsScreen} />
      <Stack.Screen name="MemoryUsage" component={MemoryUsageScreen} />
      <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} />
      <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
    </Stack.Navigator>
  );
}

// Main Navigation Component
export default function Navigation() {
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    checkTutorialStatus();
  }, []);

  const checkTutorialStatus = async () => {
    try {
      const hasSeenTutorial = await AsyncStorage.getItem('hasSeenTutorial');
      if (!hasSeenTutorial) {
        // Show tutorial after a brief delay to let the app load
        setTimeout(() => {
          setShowTutorial(true);
        }, 1000);
      }
    } catch (error) {
      console.error('Error checking tutorial status:', error);
    }
  };

  const handleTutorialComplete = () => {
    setShowTutorial(false);
  };

  const handleTutorialSkip = () => {
    setShowTutorial(false);
  };

  return (
    <>
      <MainStack />
      <TutorialOverlay
        visible={showTutorial}
        onComplete={handleTutorialComplete}
        onSkip={handleTutorialSkip}
      />
    </>
  );
} 