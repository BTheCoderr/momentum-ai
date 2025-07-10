import axios from 'axios';

const AI_SERVICE_URL = 'http://localhost:8000';

export interface Goal {
  id: string;
  title: string;
  user_id: string;
}

export interface CheckIn {
  entry: string;
  mood: string;
  created_at: string;
  user_id: string;
}

export const aiService = {
  calculateProgress: async (goal: Goal): Promise<number> => {
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/calculate-progress`, goal);
      return response.data.score;
    } catch (error) {
      console.error('Error calculating progress:', error);
      return 0;
    }
  },

  getWeeklySummary: async (userId: string): Promise<string> => {
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/weekly-summary`, {
        user_id: userId,
      });
      return response.data.summary;
    } catch (error) {
      console.error('Error getting weekly summary:', error);
      return 'Unable to generate summary at this time.';
    }
  },

  getCoachPreview: async (prompt?: string): Promise<string> => {
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/coach-preview`, {
        prompt: prompt || "You're my motivational coach. Say something inspiring!",
      });
      return response.data.response;
    } catch (error) {
      console.error('Error getting coach preview:', error);
      return 'Coach is taking a quick break. Please try again soon!';
    }
  },
}; 