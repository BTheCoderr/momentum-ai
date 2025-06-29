import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<TabParamList>;
  PlanCreator: undefined;
  DailyCoaching: undefined;
  ProgressAnalytics: undefined;
  MemorySettings: undefined;
  MemoryUsage: undefined;
  PrivacySettings: undefined;
  TermsOfService: undefined;
};

export type TabParamList = {
  Home: undefined;
  'Check-In': undefined;
  Coach: undefined;
  Insights: undefined;
  Leaderboard: undefined;
  Settings: undefined;
};