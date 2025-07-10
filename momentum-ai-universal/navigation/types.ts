import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<TabParamList>;
  Goals: undefined;
  XPProgress: undefined;
  EditProfile: undefined;
  CoachPersonality: undefined;
  TestCoach: undefined;
  MemorySettings: undefined;
  PlanCreator: undefined;
  DailyCoaching: undefined;
  ProgressAnalytics: undefined;
  MemoryUsage: undefined;
  PrivacySettings: undefined;
  TermsOfService: undefined;
  OnboardingFlow: undefined;
  ReflectionTimeline: undefined;
  RitualBuilder: undefined;
  MomentumVault: undefined;
  PublicPods: undefined;
  PodVoting: { podId: string };
  HeatmapView: undefined;
  AICoach: undefined;
  CheckIn: undefined;
  Pod: undefined;
};

export type TabParamList = {
  Home: undefined;
  'Check-In': undefined;
  Coach: { initialPrompt?: string; sessionId?: string; xpReward?: number } | undefined;
  Insights: undefined;
  Leaderboard: undefined;
  Settings: undefined;
};