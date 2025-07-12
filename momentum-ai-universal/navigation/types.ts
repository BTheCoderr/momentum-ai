import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Auth: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  OnboardingFlow: undefined;
  CoachPersonality: undefined;
  TestCoach: undefined;
  MemorySettings: undefined;
  MemoryUsage: undefined;
  PrivacySettings: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  DataUsage: undefined;
  EditProfile: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Goals: undefined;
  Chat: undefined;
  Profile: undefined;
  Settings: undefined;
  AICoach: undefined;
  DailyCoaching: {
    coachingType?: string;
    initialMessage?: string;
  };
  CheckIn: undefined;
  Insights: undefined;
  Leaderboard: undefined;
  MomentumVault: undefined;
  PlanCreator: undefined;
  Reflection: undefined;
  ReflectionTimeline: undefined;
  RitualBuilder: undefined;
  XPProgress: undefined;
  WeeklyCoaching: undefined;
  Analysis: undefined;
};

// Screen prop types
export type MainTabScreenProps<T extends keyof MainTabParamList> = {
  navigation: any;
  route: {
    key: string;
    name: T;
    params: MainTabParamList[T];
  };
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = {
  navigation: any;
  route: {
    key: string;
    name: T;
    params: RootStackParamList[T];
  };
};