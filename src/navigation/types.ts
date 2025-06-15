import { NavigatorScreenParams } from '@react-navigation/native';

export type RootTabParamList = {
  Dashboard: undefined;
  Goals: undefined;
  Chat: { initialPrompt?: string } | undefined;
  History: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Welcome: undefined;
  MainTabs: NavigatorScreenParams<RootTabParamList> | undefined;
  NotificationSettings: undefined;
  PlanCreator: undefined;
  DailyCoaching: undefined;
  ProgressAnalytics: undefined;
}; 