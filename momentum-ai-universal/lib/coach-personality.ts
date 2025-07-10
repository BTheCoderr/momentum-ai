import { aiService } from './ai-service';

export type CoachPersonality = 'motivational' | 'analytical' | 'supportive';

interface CoachStyle {
  name: string;
  emoji: string;
  description: string;
  promptPrefix: string;
}

const coachStyles: Record<CoachPersonality, CoachStyle> = {
  motivational: {
    name: 'Motivational Coach',
    emoji: '🔥',
    description: 'Energetic and inspiring, focused on pushing you to achieve your best',
    promptPrefix: 'As an energetic motivational coach, respond with enthusiasm and inspiration:',
  },
  analytical: {
    name: 'Analytical Coach',
    emoji: '📊',
    description: 'Data-driven and strategic, helps you understand patterns and make informed decisions',
    promptPrefix: 'As a strategic analytical coach, provide clear, data-informed guidance:',
  },
  supportive: {
    name: 'Supportive Coach',
    emoji: '🫂',
    description: 'Empathetic and understanding, helps you navigate challenges with compassion',
    promptPrefix: 'As an empathetic supportive coach, respond with understanding and encouragement:',
  },
};

export class CoachPersonalityEngine {
  private personality: CoachPersonality = 'motivational';

  setPersonality(type: CoachPersonality) {
    this.personality = type;
  }

  getPersonalityInfo(): CoachStyle {
    return coachStyles[this.personality];
  }

  async getResponse(userInput: string): Promise<string> {
    const style = coachStyles[this.personality];
    const prompt = `${style.promptPrefix}\n\nUser: ${userInput}`;
    
    try {
      const response = await aiService.getCoachPreview(prompt);
      return response;
    } catch (error) {
      console.error('Error getting coach response:', error);
      return 'I apologize, but I need a moment to gather my thoughts. Could you try again?';
    }
  }

  async analyzeProgress(userId: string): Promise<string> {
    try {
      const summary = await aiService.getWeeklySummary(userId);
      const style = coachStyles[this.personality];
      const prompt = `${style.promptPrefix}\n\nBased on this summary, provide feedback:\n${summary}`;
      
      return await aiService.getCoachPreview(prompt);
    } catch (error) {
      console.error('Error analyzing progress:', error);
      return 'I need a bit more time to analyze your progress. Let\'s try again soon.';
    }
  }
} 