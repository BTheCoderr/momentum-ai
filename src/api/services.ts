import api from './axios';

// Types
export interface Goal {
  id: string;
  title: string;
  description: string;
  progress: number;
  currentStreak: number;
  bestStreak: number;
  dueDate: string;
  status: 'on-track' | 'at-risk' | 'completed';
  habits: Habit[];
  motivation: string;
  userId: string;
}

export interface Habit {
  id: string;
  title: string;
  completed: boolean;
  goalId: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  userId: string;
}

export interface UserStats {
  overallProgress: number;
  activeGoals: number;
  aiInterventions: number;
  motivationScore: number;
}

export interface UserPatterns {
  behaviorTrends: {
    checkInFrequency: 'increasing' | 'decreasing' | 'stable';
    bestPerformanceTime: string;
    worstPerformanceTime: string;
    weeklyPattern: number[]; // 7 days, completion rates
    monthlyTrend: 'up' | 'down' | 'stable';
  };
  emotionalPatterns: {
    motivationTriggers: string[];
    demotivationTriggers: string[];
    emotionalCycles: {
      high: string[];
      low: string[];
    };
    stressIndicators: string[];
  };
  goalPatterns: {
    successFactors: string[];
    failurePatterns: string[];
    optimalGoalTypes: string[];
    riskFactors: string[];
  };
  interventionHistory: {
    successfulInterventions: string[];
    ignoredInterventions: string[];
    preferredInterventionTypes: string[];
  };
}

export interface AIReflection {
  insights: {
    type: 'warning' | 'success' | 'pattern' | 'prediction';
    title: string;
    description: string;
    confidence: number;
    actionable: boolean;
    suggestedActions: string[];
  }[];
  predictions: {
    riskOfGoalAbandonment: number;
    likelySuccessFactors: string[];
    recommendedInterventions: string[];
    optimalCheckInTimes: string[];
  };
  personalizedCoaching: {
    motivationalMessage: string;
    specificAdvice: string[];
    emotionalSupport: string;
    nextSteps: string[];
  };
}

// Goals API
export const goalsAPI = {
  // Get all user goals
  async getGoals(): Promise<Goal[]> {
    try {
      const response = await api.get('/goals');
      return response.data;
    } catch (error) {
      console.log('Error fetching goals:', error);
      // Return mock data if API fails
      return getMockGoals();
    }
  },

  // Create new goal
  async createGoal(goal: Omit<Goal, 'id' | 'userId'>): Promise<Goal> {
    try {
      const response = await api.post('/goals', goal);
      return response.data;
    } catch (error) {
      console.log('Error creating goal:', error);
      throw error;
    }
  },

  // Update goal progress
  async updateGoal(goalId: string, updates: Partial<Goal>): Promise<Goal> {
    try {
      const response = await api.patch(`/goals/${goalId}`, updates);
      return response.data;
    } catch (error) {
      console.log('Error updating goal:', error);
      throw error;
    }
  },

  // Toggle habit completion
  async toggleHabit(goalId: string, habitId: string): Promise<void> {
    try {
      await api.patch(`/goals/${goalId}/habits/${habitId}/toggle`);
    } catch (error) {
      console.log('Error toggling habit:', error);
      throw error;
    }
  }
};

// Chat API
export const chatAPI = {
  // Get chat history
  async getChatHistory(): Promise<ChatMessage[]> {
    try {
      const response = await api.get('/chat/history');
      return response.data;
    } catch (error) {
      console.log('Error fetching chat history:', error);
      return [];
    }
  },

  // Send message to AI
  async sendMessage(message: string): Promise<ChatMessage> {
    try {
      const response = await api.post('/chat/message', { message });
      return response.data;
    } catch (error) {
      console.log('Error sending message:', error);
      // Return mock response if API fails
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: generateMockResponse(message),
        timestamp: new Date(),
        userId: 'current-user'
      };
    }
  }
};

// User API
export const userAPI = {
  // Get user stats for dashboard
  async getUserStats(): Promise<UserStats> {
    try {
      const response = await api.get('/user/stats');
      return response.data;
    } catch (error) {
      console.log('Error fetching user stats:', error);
      // Return mock stats if API fails
      return {
        overallProgress: 85,
        activeGoals: 2,
        aiInterventions: 12,
        motivationScore: 94
      };
    }
  },

  // Get user profile
  async getUserProfile() {
    try {
      const response = await api.get('/user/profile');
      return response.data;
    } catch (error) {
      console.log('Error fetching user profile:', error);
      throw error;
    }
  }
};

// Mock data functions (fallbacks)
function getMockGoals(): Goal[] {
  return [
    {
      id: '1',
      title: 'Launch My SaaS Product',
      description: 'Build and launch my productivity app by Q2',
      progress: 65,
      currentStreak: 12,
      bestStreak: 18,
      dueDate: 'Dec 30, 2025',
      status: 'on-track',
      habits: [
        { id: '1a', title: 'Code for 2 hours', completed: true, goalId: '1' },
        { id: '1b', title: 'Write 1 blog post', completed: false, goalId: '1' },
        { id: '1c', title: 'Talk to 1 potential user', completed: true, goalId: '1' },
      ],
      motivation: 'This represents my dream of financial freedom and creative fulfillment',
      userId: 'current-user'
    },
    {
      id: '2',
      title: 'Get in Best Shape of My Life',
      description: 'Lose 25 pounds and run a half marathon',
      progress: 40,
      currentStreak: 3,
      bestStreak: 14,
      dueDate: 'Oct 14, 2025',
      status: 'at-risk',
      habits: [
        { id: '2a', title: 'Workout for 30 minutes', completed: false, goalId: '2' },
        { id: '2b', title: 'Eat healthy meals', completed: true, goalId: '2' },
        { id: '2c', title: 'Track calories', completed: false, goalId: '2' },
      ],
      motivation: 'I want to feel confident and energetic for my family',
      userId: 'current-user'
    }
  ];
}

function generateMockResponse(userInput: string): string {
  const responses = [
    "That's a great insight! How do you think you can build on that momentum?",
    "I appreciate you sharing that with me. What would success look like for you in this situation?",
    "That sounds challenging. What's one small step you could take today to move forward?",
    "I can hear the determination in your words. What support do you need to achieve this goal?",
    "That's an interesting perspective. How does this align with your bigger picture goals?",
    "Thank you for being so reflective. What patterns do you notice in your thinking here?",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

export const patternAPI = {
  async getUserPatterns(userId?: string): Promise<UserPatterns> {
    try {
      const response = await api.get(`/patterns/user${userId ? `?userId=${userId}` : ''}`);
      return response.data;
    } catch (error) {
      console.log('Error fetching user patterns:', error);
      // Return mock data for development
      return {
        behaviorTrends: {
          checkInFrequency: 'stable',
          bestPerformanceTime: 'Tuesday mornings',
          worstPerformanceTime: 'Friday evenings',
          weeklyPattern: [85, 90, 95, 80, 60, 70, 88],
          monthlyTrend: 'up'
        },
        emotionalPatterns: {
          motivationTriggers: ['Progress visualization', 'Peer encouragement', 'Small wins'],
          demotivationTriggers: ['Perfectionism', 'Comparison to others', 'Overwhelming goals'],
          emotionalCycles: {
            high: ['Monday motivation', 'Post-workout endorphins', 'Achievement celebrations'],
            low: ['Sunday scaries', 'Mid-week slumps', 'Setback recovery']
          },
          stressIndicators: ['Skipped check-ins', 'Negative self-talk', 'Goal avoidance']
        },
        goalPatterns: {
          successFactors: ['Clear milestones', 'Daily habits', 'Accountability partners'],
          failurePatterns: ['Vague objectives', 'All-or-nothing thinking', 'Isolation'],
          optimalGoalTypes: ['Health & fitness', 'Skill development', 'Creative projects'],
          riskFactors: ['Overcommitment', 'External pressure', 'Perfectionism']
        },
        interventionHistory: {
          successfulInterventions: ['Gentle reminders', 'Progress celebrations', 'Habit stacking'],
          ignoredInterventions: ['Harsh accountability', 'Generic advice', 'Overwhelming suggestions'],
          preferredInterventionTypes: ['Encouraging', 'Specific', 'Timely']
        }
      };
    }
  },

  async analyzePatterns(data: {
    goals: Goal[];
    checkIns: any[];
    userContext: any;
  }): Promise<UserPatterns> {
    try {
      const response = await api.post('/patterns/analyze', data);
      return response.data;
    } catch (error) {
      console.log('Error analyzing patterns:', error);
      return this.getUserPatterns();
    }
  }
};

export const aiReflectionAPI = {
  async getPersonalizedInsights(data: {
    userId?: string;
    goals: Goal[];
    patterns: UserPatterns;
    recentActivity: any[];
  }): Promise<AIReflection> {
    try {
      const response = await api.post('/ai/reflect', data);
      return response.data;
    } catch (error) {
      console.log('Error getting AI insights:', error);
      // Return mock data for development
      return {
        insights: [
          {
            type: 'pattern',
            title: 'Peak Performance Window Identified',
            description: 'Your data shows 40% higher completion rates on Tuesday mornings. Your brain chemistry and energy levels align perfectly during this time.',
            confidence: 0.87,
            actionable: true,
            suggestedActions: [
              'Schedule your most challenging goals for Tuesday mornings',
              'Block this time in your calendar as "Peak Performance"',
              'Use this window for goal planning and reflection'
            ]
          },
          {
            type: 'warning',
            title: 'Perfectionism Pattern Detected',
            description: 'I notice you tend to abandon goals when you miss 2+ days in a row. This all-or-nothing thinking is sabotaging your long-term success.',
            confidence: 0.92,
            actionable: true,
            suggestedActions: [
              'Implement the "2-day rule" - never miss twice in a row',
              'Create "minimum viable" versions of your habits',
              'Practice self-compassion when you have setbacks'
            ]
          },
          {
            type: 'success',
            title: 'Emotional Connection Strengthening',
            description: 'Your "why" statements have become 60% more specific over the past month. This deeper emotional connection predicts higher success rates.',
            confidence: 0.78,
            actionable: true,
            suggestedActions: [
              'Continue journaling about your deeper motivations',
              'Share your "why" with your accountability partner',
              'Revisit and refine your emotional anchors weekly'
            ]
          }
        ],
        predictions: {
          riskOfGoalAbandonment: 0.23,
          likelySuccessFactors: [
            'Consistent Tuesday morning check-ins',
            'Visual progress tracking',
            'Peer encouragement and sharing'
          ],
          recommendedInterventions: [
            'Gentle reminder on Sunday evenings',
            'Celebration of small wins',
            'Habit stacking with existing routines'
          ],
          optimalCheckInTimes: ['Tuesday 9:00 AM', 'Thursday 7:00 PM', 'Sunday 6:00 PM']
        },
        personalizedCoaching: {
          motivationalMessage: "I see you building something beautiful here. Your consistency this week shows real growth in your relationship with your goals. That Tuesday morning energy? That's your superpower - let's lean into it.",
          specificAdvice: [
            "Your perfectionism is both your strength and your kryptonite. Channel it into planning, not self-judgment.",
            "The way you bounce back from setbacks has improved 40% - you're learning to be your own best friend.",
            "Your goals are becoming more emotionally connected. This isn't just about tasks anymore - it's about who you're becoming."
          ],
          emotionalSupport: "I want you to know that the work you're doing on yourself matters. Every check-in, every moment of self-reflection, every time you choose growth over comfort - it's all building toward the person you're meant to be.",
          nextSteps: [
            "This week, focus on protecting your Tuesday morning ritual",
            "Practice the 'good enough' mindset when perfectionism creeps in",
            "Share one vulnerable truth about your goals with someone you trust"
          ]
        }
      };
    }
  },

  async generateCoachingResponse(data: {
    userMessage: string;
    patterns: UserPatterns;
    goals: Goal[];
    context: any;
  }): Promise<{ response: string; insights?: string[] }> {
    try {
      const response = await api.post('/ai/coach', data);
      return response.data;
    } catch (error) {
      console.log('Error generating coaching response:', error);
      return {
        response: "I'm here to support you on your journey. What's on your mind today?",
        insights: []
      };
    }
  }
}; 