import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

// Initialize Groq client only if API key is available (prevents build errors)
const groq = process.env.GROQ_API_KEY ? new Groq({
  apiKey: process.env.GROQ_API_KEY,
}) : null;

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { message, goals, userContext, userId = 'demo-user' } = await request.json();

    // Save user message to database
    const { data: userMessage, error: userMessageError } = await supabase
      .from('chat_messages')
      .insert({
        user_id: userId,
        message: message,
        is_ai: false,
        timestamp: new Date().toISOString(),
      })
      .select()
      .single();

    if (userMessageError) {
      console.error('Error saving user message:', userMessageError);
    }

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
      model: "llama-3.1-70b-versatile", // Much smarter, still free!
      temperature: 0.7,
      max_tokens: 200,
      top_p: 1,
      stream: false,
    });

    const aiResponse = chatCompletion.choices[0]?.message?.content || "I'm here to help you stay connected to your goals. What's on your mind?";

    // Save AI response to database
    const { data: aiMessage, error: aiMessageError } = await supabase
      .from('chat_messages')
      .insert({
        user_id: userId,
        message: aiResponse,
        is_ai: true,
        timestamp: new Date().toISOString(),
      })
      .select()
      .single();

    if (aiMessageError) {
      console.error('Error saving AI message:', aiMessageError);
    }

    return NextResponse.json({ 
      response: aiResponse,
      success: true,
      userMessage: userMessage,
      aiMessage: aiMessage
    });

  } catch (error) {
    console.error('Groq API Error:', error);
    
    // Fallback responses if API fails
    const fallbackResponses = [
      "I'm having trouble connecting right now, but I'm still here for you. What's challenging you today?",
      "Let's focus on your goals. Which one needs the most attention right now?",
      "Tell me about what's motivating you today. What's your deeper 'why'?",
    ];
    
    const fallbackResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    
    // Still try to save the fallback response
    try {
      const { userId = 'demo-user' } = await request.json();
      await supabase
        .from('chat_messages')
        .insert({
          user_id: userId,
          message: fallbackResponse,
          is_ai: true,
          timestamp: new Date().toISOString(),
        });
    } catch (saveError) {
      console.error('Error saving fallback response:', saveError);
    }
    
    return NextResponse.json({ 
      response: fallbackResponse,
      success: false,
      fallback: true
    });
  }
} 