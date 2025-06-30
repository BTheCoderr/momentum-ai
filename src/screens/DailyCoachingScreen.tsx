import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootTabParamList } from '../navigation';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { userAPI, goalsAPI, Goal } from '../api/services';

type DailyCoachingNavigationProp = BottomTabNavigationProp<RootTabParamList, 'Chat'>;

interface Props {
  navigation: DailyCoachingNavigationProp;
}

interface UserProfile {
  name: string;
  motivation: string;
  preferredTime: string;
  experience: string;
  primaryGoal: string;
}

interface CoachingSession {
  energyLevel: 'high' | 'medium' | 'low' | null;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  isOptimalTime: boolean;
  todaysFocus: string;
  quickWins: string[];
  mindsetShift: string;
  motivationalMessage: string;
}

export default function DailyCoachingScreen({ navigation }: Props) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [coachingSession, setCoachingSession] = useState<CoachingSession | null>(null);
  const [selectedEnergyLevel, setSelectedEnergyLevel] = useState<'high' | 'medium' | 'low' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCoachingData();
  }, []);

  useEffect(() => {
    if (selectedEnergyLevel && userProfile) {
      generateCoachingSession(selectedEnergyLevel);
    }
  }, [selectedEnergyLevel, userProfile]);

  const loadCoachingData = async () => {
    try {
      setLoading(true);
      
      const [profileData, goalsData] = await Promise.all([
        userAPI.getUserProfile(),
        goalsAPI.getGoals()
      ]);

      setUserProfile(profileData);
      setGoals(goalsData);
      
      // Auto-generate initial coaching session
      generateInitialSession(profileData, goalsData);
    } catch (error) {
      console.log('Error loading coaching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateInitialSession = (profile: UserProfile, userGoals: Goal[]) => {
    const currentHour = new Date().getHours();
    const timeOfDay = currentHour < 12 ? 'morning' : currentHour < 17 ? 'afternoon' : 'evening';
    const isOptimalTime = (
      (profile.preferredTime === 'morning' && timeOfDay === 'morning') ||
      (profile.preferredTime === 'afternoon' && timeOfDay === 'afternoon') ||
      (profile.preferredTime === 'evening' && timeOfDay === 'evening')
    );

    const session: CoachingSession = {
      energyLevel: null,
      timeOfDay,
      isOptimalTime,
      todaysFocus: userGoals.length > 0 ? userGoals[0].title : profile.primaryGoal,
      quickWins: generateQuickWins(profile, userGoals),
      mindsetShift: generateMindsetShift(profile),
      motivationalMessage: generateMotivationalMessage(profile, isOptimalTime, timeOfDay)
    };

    setCoachingSession(session);
  };

  const generateCoachingSession = (energyLevel: 'high' | 'medium' | 'low') => {
    if (!userProfile || !coachingSession) return;

    const updatedSession: CoachingSession = {
      ...coachingSession,
      energyLevel,
      quickWins: generateEnergyBasedActions(energyLevel, userProfile, goals),
      mindsetShift: generateEnergyBasedMindset(energyLevel, userProfile),
      motivationalMessage: generateEnergyBasedMotivation(energyLevel, userProfile)
    };

    setCoachingSession(updatedSession);
  };

  const generateQuickWins = (profile: UserProfile, userGoals: Goal[]): string[] => {
    const baseWins = [
      "Write down 3 things you're grateful for",
      "Do 10 push-ups or a 2-minute stretch",
      "Review your goals and visualize success",
      "Send one encouraging message to someone",
      "Organize your workspace for 5 minutes"
    ];

    if (userGoals.length > 0) {
      const goalWin = `Take one small step toward: ${userGoals[0].title}`;
      return [goalWin, ...baseWins.slice(0, 2)];
    }

    return baseWins.slice(0, 3);
  };

  const generateEnergyBasedActions = (energyLevel: 'high' | 'medium' | 'low', profile: UserProfile, userGoals: Goal[]): string[] => {
    const goalTitle = userGoals.length > 0 ? userGoals[0].title : profile.primaryGoal;

    switch (energyLevel) {
      case 'high':
        return [
          `Tackle the hardest part of: ${goalTitle}`,
          "Plan your entire week ahead",
          "Start that project you've been putting off",
          "Do a full workout or long walk",
          "Learn something new for 30 minutes"
        ];
      case 'medium':
        return [
          `Make steady progress on: ${goalTitle}`,
          "Complete 2-3 routine tasks",
          "Do a 15-minute focused work session",
          "Tidy up your space",
          "Connect with a friend or colleague"
        ];
      case 'low':
        return [
          `Do just 5 minutes of: ${goalTitle}`,
          "Review and plan tomorrow",
          "Do gentle stretches or breathing",
          "Read something inspiring",
          "Celebrate what you've already done today"
        ];
    }
  };

  const generateMindsetShift = (profile: UserProfile): string => {
    const shifts = [
      `Remember: "${profile.motivation}" - this is your deeper why`,
      "Progress over perfection - small steps count",
      "You're building the person you want to become",
      "Every choice is a vote for your future self",
      "Consistency beats intensity every time"
    ];
    return shifts[Math.floor(Math.random() * shifts.length)];
  };

  const generateEnergyBasedMindset = (energyLevel: 'high' | 'medium' | 'low', profile: UserProfile): string => {
    switch (energyLevel) {
      case 'high':
        return `Channel this energy wisely! Remember "${profile.motivation}" and make bold moves toward your goals.`;
      case 'medium':
        return `Steady progress wins the race. You don't need to feel amazing to do amazing things.`;
      case 'low':
        return `Low energy doesn't mean low value. Sometimes showing up is the victory. Be gentle with yourself.`;
    }
  };

  const generateMotivationalMessage = (profile: UserProfile, isOptimalTime: boolean, timeOfDay: string): string => {
    const timeMessage = isOptimalTime 
      ? `Perfect timing, ${profile.name}! This is your optimal ${timeOfDay} window.`
      : `Hey ${profile.name}! I know ${profile.preferredTime}s work best for you, but let's make the most of right now.`;

    return `${timeMessage} Remember why you started: "${profile.motivation}". That's not just words - that's your driving force.`;
  };

  const generateEnergyBasedMotivation = (energyLevel: 'high' | 'medium' | 'low', profile: UserProfile): string => {
    switch (energyLevel) {
      case 'high':
        return `${profile.name}, you're feeling strong today! This is when magic happens. Your energy is a gift - use it to build momentum toward "${profile.motivation}".`;
      case 'medium':
        return `${profile.name}, you're in a good space today. Not every day needs to be extraordinary - consistent effort toward "${profile.motivation}" is what creates lasting change.`;
      case 'low':
        return `${profile.name}, I see you showing up even when it's hard. That's real strength. Remember "${profile.motivation}" - you're doing this for something bigger than today's energy level.`;
    }
  };

  const handleEnergySelection = (energy: 'high' | 'medium' | 'low') => {
    setSelectedEnergyLevel(energy);
  };

  const handleStartCoaching = () => {
    if (!selectedEnergyLevel || !coachingSession) {
      Alert.alert('Energy Check', 'Please select your current energy level first!');
      return;
    }

    const coachingPrompt = `I'm feeling ${selectedEnergyLevel} energy today. ${coachingSession.motivationalMessage} 

Today's focus: ${coachingSession.todaysFocus}
Mindset: ${coachingSession.mindsetShift}

Give me personalized coaching and specific actions I can take right now.`;

    navigation.navigate('Chat', { initialPrompt: coachingPrompt });
  };

  const renderEnergySelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>How's your energy today?</Text>
      <Text style={styles.sectionSubtitle}>Let's customize your coaching based on how you're feeling</Text>
      
      <View style={styles.energyOptions}>
        <TouchableOpacity
          style={[
            styles.energyOption,
            { backgroundColor: '#E8F5E8' },
            selectedEnergyLevel === 'high' && styles.energyOptionSelected
          ]}
          onPress={() => handleEnergySelection('high')}
        >
          <Text style={styles.energyIcon}>🔥</Text>
          <Text style={styles.energyTitle}>High Energy</Text>
          <Text style={styles.energyDescription}>Feeling motivated and ready to tackle big challenges</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.energyOption,
            { backgroundColor: '#FEF3C7' },
            selectedEnergyLevel === 'medium' && styles.energyOptionSelected
          ]}
          onPress={() => handleEnergySelection('medium')}
        >
          <Text style={styles.energyIcon}>⚡</Text>
          <Text style={styles.energyTitle}>Medium Energy</Text>
          <Text style={styles.energyDescription}>Steady and focused, ready for consistent progress</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.energyOption,
            { backgroundColor: '#EEF2FF' },
            selectedEnergyLevel === 'low' && styles.energyOptionSelected
          ]}
          onPress={() => handleEnergySelection('low')}
        >
          <Text style={styles.energyIcon}>🌱</Text>
          <Text style={styles.energyTitle}>Low Energy</Text>
          <Text style={styles.energyDescription}>Taking it easy, focusing on small wins</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCoachingPreview = () => {
    if (!coachingSession || !selectedEnergyLevel) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Personalized Coaching</Text>
        
        <View style={styles.coachingCard}>
          <View style={styles.coachingHeader}>
            <Text style={styles.coachingIcon}>💪</Text>
            <Text style={styles.coachingTitle}>Today's Focus</Text>
          </View>
          <Text style={styles.coachingContent}>{coachingSession.todaysFocus}</Text>
        </View>

        <View style={styles.coachingCard}>
          <View style={styles.coachingHeader}>
            <Text style={styles.coachingIcon}>🧠</Text>
            <Text style={styles.coachingTitle}>Mindset Shift</Text>
          </View>
          <Text style={styles.coachingContent}>{coachingSession.mindsetShift}</Text>
        </View>

        <View style={styles.coachingCard}>
          <View style={styles.coachingHeader}>
            <Text style={styles.coachingIcon}>✅</Text>
            <Text style={styles.coachingTitle}>Quick Wins</Text>
          </View>
          {coachingSession.quickWins.map((win, index) => (
            <Text key={index} style={styles.quickWinItem}>• {win}</Text>
          ))}
        </View>

        <View style={styles.motivationCard}>
          <Text style={styles.motivationText}>{coachingSession.motivationalMessage}</Text>
        </View>

        <TouchableOpacity style={styles.startButton} onPress={handleStartCoaching}>
          <LinearGradient colors={['#FF6B35', '#F7931E']} style={styles.startButtonGradient}>
            <Text style={styles.startButtonText}>Start Coaching Session 🚀</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daily Coaching</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {userProfile && (
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Good {coachingSession?.timeOfDay}, {userProfile.name}! 👋</Text>
            <Text style={styles.welcomeSubtitle}>
              {coachingSession?.isOptimalTime 
                ? `Perfect timing! This is your optimal ${userProfile.preferredTime} window.`
                : `Ready to make progress toward "${userProfile.motivation}"?`
              }
            </Text>
          </View>
        )}

        {renderEnergySelector()}
        {renderCoachingPreview()}
        
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FF6B35',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  placeholder: {
    width: 24,
  },
  scrollView: {
    flex: 1,
  },
  welcomeSection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
  },
  energyOptions: {
    gap: 12,
  },
  energyOption: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  energyOptionSelected: {
    borderColor: '#4F46E5',
  },
  energyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  energyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  energyDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  coachingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  coachingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  coachingIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  coachingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  coachingContent: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  quickWinItem: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 4,
  },
  motivationCard: {
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  motivationText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
    textAlign: 'center',
    fontWeight: '500',
  },
  startButton: {
    marginTop: 8,
  },
  startButtonGradient: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bottomPadding: {
    height: 20,
  },
}); 