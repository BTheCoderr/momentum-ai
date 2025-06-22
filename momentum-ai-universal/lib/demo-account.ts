import AsyncStorage from '@react-native-async-storage/async-storage';

// Demo Account Configuration for App Store Review
export const DEMO_ACCOUNT = {
  username: 'demo',
  password: 'demo123',
  userId: 'demo-user-app-store',
  email: 'demo@momentum-ai.app',
  name: 'Demo User'
};

// Demo data for App Store reviewers to showcase all features
export const DEMO_DATA = {
  goals: [
    {
      id: 'demo-goal-1',
      title: 'Exercise Daily',
      description: 'Complete 30 minutes of exercise every day',
      progress: 75,
      streak: 12,
      created_at: '2025-01-15T00:00:00Z',
      target_date: '2025-02-15T00:00:00Z'
    },
    {
      id: 'demo-goal-2', 
      title: 'Read for 20 Minutes',
      description: 'Read personal development books daily',
      progress: 60,
      streak: 8,
      created_at: '2025-01-10T00:00:00Z',
      target_date: '2025-02-10T00:00:00Z'
    },
    {
      id: 'demo-goal-3',
      title: 'Meditation Practice',
      description: 'Daily 10-minute mindfulness meditation',
      progress: 90,
      streak: 21,
      created_at: '2025-01-01T00:00:00Z',
      target_date: '2025-03-01T00:00:00Z'
    }
  ],
  
  userStats: {
    current_streak: 12,
    best_streak: 21,
    total_checkins: 45,
    total_goals: 3,
    completed_goals: 5,
    totalXP: 1250,
    level: 5,
    motivationScore: 94,
    overallProgress: 75,
    activeGoals: 3,
    aiInterventions: 12
  },
  
  recentCheckins: [
    {
      id: 'demo-checkin-1',
      date: new Date().toISOString().split('T')[0],
      mood: 8,
      energy: 7,
      stress: 3,
      wins: 'Completed morning workout and had a productive work session',
      challenges: 'Felt a bit tired in the afternoon',
      priorities: 'Focus on the big presentation tomorrow',
      reflection: 'Great day overall, feeling motivated!'
    },
    {
      id: 'demo-checkin-2',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      mood: 7,
      energy: 8,
      stress: 4,
      wins: 'Finished the quarterly report ahead of schedule',
      challenges: 'Had trouble staying focused during meetings',
      priorities: 'Prepare for client presentation',
      reflection: 'Productive day, need to work on meeting focus'
    }
  ],
  
  messages: [
    {
      id: 'demo-msg-1',
      content: 'Hi! I\'m excited to help you achieve your goals. I see you\'re working on building an exercise habit - that\'s fantastic!',
      sender: 'ai',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      coach_type: 'supportive'
    },
    {
      id: 'demo-msg-2',
      content: 'Hello! I want to build better habits and stay accountable to my goals.',
      sender: 'user',
      timestamp: new Date(Date.now() - 15 * 60 * 1000)
    },
    {
      id: 'demo-msg-3',
      content: 'Based on your 12-day exercise streak, you\'re building incredible momentum! The key is consistency, and you\'re proving you have what it takes. What\'s your biggest challenge with maintaining this habit?',
      sender: 'ai',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      coach_type: 'motivational'
    }
  ],
  
  reflections: [
    {
      id: 'demo-reflection-1',
      date: new Date().toISOString().split('T')[0],
      answers: [
        'I accomplished my workout goal and made good progress on my reading',
        'I felt energized and motivated throughout most of the day',
        'The afternoon energy dip was challenging, but I pushed through',
        'I learned that taking short breaks actually helps my productivity',
        'Tomorrow I want to focus on better time management during meetings'
      ],
      word_count: 142,
      created_at: new Date().toISOString()
    }
  ],
  
  insights: [
    {
      id: 'demo-insight-1',
      type: 'pattern',
      title: 'Afternoon Energy Pattern',
      content: 'I notice you consistently experience energy dips around 2-3 PM. Consider scheduling lighter tasks during this time or taking a 10-minute walk to boost energy.',
      emoji: '⚡',
      category: 'energy',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: 'demo-insight-2',
      type: 'encouragement',
      title: 'Streak Momentum',
      content: 'Your 12-day exercise streak shows incredible dedication! You\'re in the habit formation sweet spot. Keep this momentum going!',
      emoji: '🔥',
      category: 'motivation',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
    },
    {
      id: 'demo-insight-3',
      type: 'suggestion',
      title: 'Reading Optimization',
      content: 'Try reading during your high-energy morning hours instead of evening. Your check-ins show you\'re most focused between 8-10 AM.',
      emoji: '📚',
      category: 'productivity',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
  ]
};

// Authentication Services for Demo Account
export const demoAuthServices = {
  async signIn(username: string, password: string) {
    // Check for demo account
    if (username === DEMO_ACCOUNT.username && password === DEMO_ACCOUNT.password) {
      console.log('🎯 Demo account login successful');
      
      // Store demo user info
      await AsyncStorage.setItem('userId', DEMO_ACCOUNT.userId);
      await AsyncStorage.setItem('userToken', 'demo-token');
      await AsyncStorage.setItem('userName', DEMO_ACCOUNT.name);
      await AsyncStorage.setItem('userEmail', DEMO_ACCOUNT.email);
      await AsyncStorage.setItem('isDemo', 'true');
      
      return {
        success: true,
        user: {
          id: DEMO_ACCOUNT.userId,
          email: DEMO_ACCOUNT.email,
          name: DEMO_ACCOUNT.name,
          isDemo: true
        }
      };
    }
    
    return { success: false, error: 'Invalid demo credentials' };
  },

  async isDemo() {
    try {
      const isDemo = await AsyncStorage.getItem('isDemo');
      const userId = await AsyncStorage.getItem('userId');
      return isDemo === 'true' || userId === DEMO_ACCOUNT.userId;
    } catch {
      return false;
    }
  },

  async getCurrentUser() {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const userName = await AsyncStorage.getItem('userName');
      const userEmail = await AsyncStorage.getItem('userEmail');
      const isDemo = await this.isDemo();
      
      if (userId) {
        return {
          id: userId,
          name: userName || DEMO_ACCOUNT.name,
          email: userEmail || DEMO_ACCOUNT.email,
          isDemo
        };
      }
      return null;
    } catch {
      return null;
    }
  },

  async signOut() {
    try {
      await AsyncStorage.multiRemove([
        'userId', 'userToken', 'userName', 'userEmail', 'isDemo'
      ]);
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false };
    }
  }
};

// Helper function to get demo data when in demo mode
export const getDemoData = async (dataType: keyof typeof DEMO_DATA) => {
  const isDemo = await demoAuthServices.isDemo();
  if (isDemo) {
    return DEMO_DATA[dataType];
  }
  return null;
}; 