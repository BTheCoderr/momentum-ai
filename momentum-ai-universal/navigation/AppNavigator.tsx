import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import { CheckInScreen } from '../screens/CheckInScreen';
import { AICoachScreen } from '../screens/AICoachScreen';
import InsightsScreen from '../screens/InsightsScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { Text } from 'react-native';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = '🏠';
              break;
            case 'CheckIn':
              iconName = '📝';
              break;
            case 'Coach':
              iconName = '🤖';
              break;
            case 'Insights':
              iconName = '💡';
              break;
            case 'Leaderboard':
              iconName = '🏆';
              break;
            case 'Settings':
              iconName = '⚙️';
              break;
            default:
              iconName = '•';
          }

          return <Text style={{ fontSize: size, color }}>{iconName}</Text>;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="CheckIn" component={CheckInScreen} />
      <Tab.Screen name="Coach" component={AICoachScreen} />
      <Tab.Screen name="Insights" component={InsightsScreen} />
      <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CheckIn"
        component={CheckInScreen}
        options={{ title: 'Daily Check-In' }}
      />
    </Stack.Navigator>
  );
}; 