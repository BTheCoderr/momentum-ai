import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // For now, return mock chat history
    // In a real app, this would fetch from your database based on the authenticated user
    const chatHistory = [
      {
        id: "1",
        role: "assistant",
        content: "Hi! I'm your AI accountability coach. I'm here to help you stay connected to your goals. What's on your mind today?",
        timestamp: new Date(Date.now() - 86400000), // 1 day ago
        userId: "current-user"
      },
      {
        id: "2", 
        role: "user",
        content: "I'm struggling to stay motivated with my gym routine.",
        timestamp: new Date(Date.now() - 86300000),
        userId: "current-user"
      },
      {
        id: "3",
        role: "assistant", 
        content: "I hear you. What originally motivated you to start going to the gym? Sometimes reconnecting with our deeper 'why' can reignite that spark.",
        timestamp: new Date(Date.now() - 86200000),
        userId: "current-user"
      }
    ];

    return NextResponse.json(chatHistory);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    );
  }
} 