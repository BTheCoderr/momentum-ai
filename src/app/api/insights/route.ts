import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { goals, progressData } = await request.json();

    const systemPrompt = `You are an AI coach analyzing user goal progress. Generate 3 personalized insights based on their data.

Goals: ${JSON.stringify(goals || [])}
Progress Data: ${JSON.stringify(progressData || {})}

Return JSON with this format:
{
  "insights": [
    {
      "type": "warning|success|insight",
      "title": "Brief title",
      "message": "Actionable insight (1-2 sentences)",
      "action": "Suggested action button text"
    }
  ]
}

Focus on:
- Pattern recognition in their behavior
- Emotional connections to goals
- Proactive suggestions to prevent drift
- Celebrating wins and progress`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: "Analyze my goal progress and provide insights",
        },
      ],
      model: "llama3-8b-8192",
      temperature: 0.5,
      max_tokens: 400,
    });

    const aiResponse = chatCompletion.choices[0]?.message?.content || '';
    
    // Try to parse JSON response
    let insights;
    try {
      insights = JSON.parse(aiResponse);
    } catch {
      // Fallback if JSON parsing fails
      insights = {
        insights: [
          {
            type: 'insight',
            title: 'AI Analysis Ready',
            message: 'I\'m analyzing your patterns to provide better insights.',
            action: 'Continue Tracking'
          }
        ]
      };
    }

    return NextResponse.json(insights);

  } catch (error) {
    console.error('Insights API Error:', error);
    
    // Fallback insights
    const fallbackInsights = {
      insights: [
        {
          type: 'success',
          title: 'Making Progress',
          message: 'You\'re building momentum. Keep focusing on your why.',
          action: 'Keep Going'
        },
        {
          type: 'insight',
          title: 'Pattern Detected',
          message: 'Consider scheduling your most important tasks during your peak energy hours.',
          action: 'Optimize Schedule'
        },
        {
          type: 'warning',
          title: 'Stay Connected',
          message: 'Remember why these goals matter to you personally.',
          action: 'Review Purpose'
        }
      ]
    };
    
    return NextResponse.json(fallbackInsights);
  }
} 