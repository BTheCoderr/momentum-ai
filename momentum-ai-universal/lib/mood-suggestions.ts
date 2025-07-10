import { aiService } from './ai-service';

export interface MoodSuggestion {
  suggestion: string;
  activities: string[];
}

export async function getMoodSuggestion(mood: string): Promise<MoodSuggestion> {
  try {
    const prompt = `
The user just checked in and selected the mood: "${mood}".

Provide:
1. A 1-2 sentence empathetic and supportive suggestion
2. Three quick activities they could do right now

Format as JSON:
{
  "suggestion": "your empathetic suggestion here",
  "activities": ["activity 1", "activity 2", "activity 3"]
}

Avoid:
- Repeating the word "mood" or the exact emotion
- Generic advice
- Long suggestions
`;

    const response = await aiService.getCoachPreview(prompt);
    return JSON.parse(response);
  } catch (error) {
    console.error('Error getting mood suggestion:', error);
    return {
      suggestion: "Take a moment to breathe and acknowledge how you're feeling.",
      activities: [
        "Take 3 deep breaths",
        "Write down your thoughts",
        "Go for a short walk"
      ]
    };
  }
}

// Predefined suggestions for offline/fallback use
export const fallbackSuggestions: Record<string, MoodSuggestion> = {
  anxious: {
    suggestion: "Let's ground ourselves in the present moment and remember that this feeling will pass.",
    activities: [
      "Practice box breathing (4 counts in, hold, out)",
      "List 5 things you can see right now",
      "Stretch for 2 minutes"
    ]
  },
  energized: {
    suggestion: "Channel this energy into something meaningful that will make future-you proud.",
    activities: [
      "Tackle your most challenging task",
      "Do a quick workout",
      "Clean or organize your space"
    ]
  },
  tired: {
    suggestion: "Honor your body's signals while maintaining gentle momentum.",
    activities: [
      "Take a 10-minute power nap",
      "Have a glass of water",
      "Do some light stretching"
    ]
  },
  motivated: {
    suggestion: "This is your momentum sweet spot - use it wisely!",
    activities: [
      "Work on your most important goal",
      "Plan your next milestone",
      "Share your energy with your pod"
    ]
  }
}; 