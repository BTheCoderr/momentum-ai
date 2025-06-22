import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Platform, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import CheckInScreen from '../screens/CheckInScreen';
import AICoachScreen from '../screens/AICoachScreen';
import InsightsScreen from '../screens/InsightsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ReflectionScreen from '../screens/ReflectionScreen';
import GoalsScreen from '../screens/GoalsScreen';
import XPProgressScreen from '../screens/XPProgressScreen';

// Import tutorial
import TutorialOverlay from '../components/TutorialOverlay';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Tab Navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 10,
          height: Platform.OS === 'ios' ? 90 : 70,
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
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
const TabIcon = ({ emoji, focused }: { emoji: string; focused: boolean }) => (
  <Text style={{
    fontSize: focused ? 28 : 24,
    opacity: focused ? 1 : 0.7,
    transform: [{ scale: focused ? 1.1 : 1 }],
  }}>
    {emoji}
  </Text>
);

// Stack Navigator (for modal screens)
function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen 
        name="Reflection" 
        component={ReflectionScreen}
        options={{
          presentation: 'modal',
          headerShown: true,
          headerTitle: 'Reflection',
        }}
      />
      <Stack.Screen 
        name="Goals" 
        component={GoalsScreen}
        options={{
          presentation: 'modal',
          headerShown: true,
          headerTitle: 'Goals',
        }}
      />
      <Stack.Screen 
        name="XPProgress" 
        component={XPProgressScreen}
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
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
      <RootNavigator />
      <TutorialOverlay
        visible={showTutorial}
        onComplete={handleTutorialComplete}
        onSkip={handleTutorialSkip}
      />
    </>
  );
} 