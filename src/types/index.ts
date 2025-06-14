export interface Habit {
  id: string;
  text: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  progress: number;
  emotionalContext: string;
  deadline: string;
  status: 'on-track' | 'at-risk' | 'completed';
  currentStreak: number;
  bestStreak: number;
  completionRate: number;
  lastCheckIn: string;
  habits: Habit[];
}

export interface Message {
  id: string;
  type: 'insight' | 'encouragement' | 'question' | 'reminder';
  content: string;
  timestamp: string;
  isAI: boolean;
  sender: 'user' | 'ai';
} 