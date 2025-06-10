import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

// Initialize Groq client only if API key is available (prevents build errors)
const groq = process.env.GROQ_API_KEY ? new Groq({
  apiKey: process.env.GROQ_API_KEY,
}) : null;

export async function POST(request: NextRequest) {
  try {
    const { message, goals, userContext } = await request.json();

    // Check if Groq client is available
    if (!groq) {
      throw new Error('AI service temporarily unavailable');
    }

    const systemPrompt = `You are an AI accountability coach for Momentum AI. Your role is to help users stay emotionally connected to their goals through gentle, supportive coaching.

User's Goals: ${JSON.stringify(goals || [])}
User Context: ${JSON.stringify(userContext || {})}

Your personality:
- Empathetic and understanding
- Ask thoughtful questions about deeper motivations
- Recognize patterns in behavior
- Provide gentle nudges and encouragement
- Focus on emotional connection to goals
- Be concise but meaningful (2-3 sentences max)

Respond as a caring accountability partner who understands the psychology of goal achievement.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: message,
        },
      ],
      model: "llama3-8b-8192", // Fast, free model
      temperature: 0.7,
      max_tokens: 200,
      top_p: 1,
      stream: false,
    });

    const aiResponse = chatCompletion.choices[0]?.message?.content || "I'm here to help you stay connected to your goals. What's on your mind?";

    return NextResponse.json({ 
      response: aiResponse,
      success: true 
    });

  } catch (error) {
    console.error('Groq API Error:', error);
    
    // Fallback responses if API fails
    const fallbackResponses = [
      "I'm having trouble connecting right now, but I'm still here for you. What's challenging you today?",
      "Let's focus on your goals. Which one needs the most attention right now?",
      "Tell me about what's motivating you today. What's your deeper 'why'?",
    ];
    
    return NextResponse.json({ 
      response: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
      success: false,
      fallback: true
    });
  }
} 