import axios from 'axios';
import { Alert } from 'react-native';

// Configure the base URL for your FastAPI backend
const AI_SERVICE_URL = __DEV__ 
  ? 'http://localhost:8000'  // Development
  : 'https://your-production-api.com';  // Replace with your production URL

const apiClient = axios.create({
  baseURL: AI_SERVICE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🚀 AI Service Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ AI Service Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ AI Service Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ AI Service Response Error:', error.response?.data || error.message);
    
    // Handle specific error cases
    if (error.code === 'ECONNABORTED') {
      Alert.alert('Timeout', 'The AI service is taking too long to respond. Please try again.');
    } else if (error.response?.status === 500) {
      Alert.alert('Service Error', 'The AI service encountered an error. Please try again later.');
    } else if (!error.response) {
      Alert.alert('Network Error', 'Unable to connect to AI service. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

export interface ChatMessage {
  user_id: string;
  message: string;
  context?: {
    mood?: number;
    energy?: number;
    stress?: number;
    note?: string;
    checkInCompleted?: boolean;
    [key: string]: any;
  };
}

export interface ChatResponse {
  message: string;
  timestamp: string;
  context_used: boolean;
}

export interface CheckInData {
  user_id: string;
  mood: number;
  energy: number;
  stress: number;
  note?: string;
}

export interface CheckInResponse {
  message: string;
  xp_earned: number;
  insights: {
    mood_trend: string;
    energy_level: string;
    stress_level: string;
  };
}

export interface InsightsResponse {
  message: string;
  insights: string[];
  last_updated: string;
}

class AICoachService {
  /**
   * Send a chat message to the AI coach
   */
  async sendMessage(payload: ChatMessage): Promise<ChatResponse> {
    try {
      const response = await apiClient.post<ChatResponse>('/chat', payload);
      return response.data;
    } catch (error) {
      console.error('Failed to send message to AI coach:', error);
      
      // Return a fallback response if the service is unavailable
      return {
        message: "I'm here to help! I understand you're reaching out, and I want to support you. Could you tell me a bit more about what's on your mind today?",
        timestamp: new Date().toISOString(),
        context_used: false
      };
    }
  }

  /**
   * Process a check-in with the AI coach
   */
  async processCheckIn(payload: CheckInData): Promise<CheckInResponse> {
    try {
      const response = await apiClient.post<CheckInResponse>('/checkin', payload);
      return response.data;
    } catch (error) {
      console.error('Failed to process check-in:', error);
      
      // Return a fallback response
      const moodResponses = {
        1: "I notice you're having a tough day. That's completely okay - we all have difficult moments.",
        2: "It sounds like today has been challenging. I'm here to listen and support you.",
        3: "You're doing okay today, and that's perfectly fine. Sometimes steady is exactly what we need.",
        4: "I'm glad to hear you're feeling good today! What's been going well for you?",
        5: "It's wonderful that you're feeling great today! Your positive energy is inspiring."
      };
      
      return {
        message: moodResponses[payload.mood as keyof typeof moodResponses] || "Thank you for sharing how you're feeling.",
        xp_earned: 10 + (payload.note && payload.note.length > 0 ? 10 : 0),
        insights: {
          mood_trend: payload.mood >= 3 ? "improving" : "needs_attention",
          energy_level: payload.energy >= 4 ? "high" : payload.energy >= 3 ? "moderate" : "low",
          stress_level: payload.stress >= 4 ? "high" : payload.stress >= 3 ? "moderate" : "low"
        }
      };
    }
  }

  /**
   * Get personalized insights for a user
   */
  async getInsights(userId: string): Promise<InsightsResponse> {
    try {
      const response = await apiClient.get<InsightsResponse>(`/insights/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get insights:', error);
      
      // Return a fallback response
      return {
        message: "Start by doing a daily check-in to get personalized insights!",
        insights: [
          "Regular check-ins help track your progress",
          "Consistency is key to building positive habits",
          "Small steps lead to big changes over time"
        ],
        last_updated: "Never"
      };
    }
  }

  /**
   * Check if the AI service is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await apiClient.get('/');
      return response.status === 200;
    } catch (error) {
      console.error('AI service health check failed:', error);
      return false;
    }
  }

  /**
   * Start the AI service (for development)
   */
  async startService(): Promise<void> {
    if (__DEV__) {
      console.log('🤖 Starting AI service in development mode...');
      // In development, you might want to automatically start the Python service
      // This would require additional setup with child_process or similar
    }
  }
}

export const aiCoachService = new AICoachService();
export default aiCoachService; 