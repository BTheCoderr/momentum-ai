from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import openai
import os
import logging
from datetime import datetime
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="Momentum AI Coach", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure OpenAI/Groq client
openai.api_key = os.getenv("OPENAI_API_KEY")  # or GROQ_API_KEY
openai.api_base = os.getenv("OPENAI_API_BASE", "https://api.openai.com/v1")

# Request/Response models
class ChatPayload(BaseModel):
    user_id: str
    message: str
    context: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    message: str
    timestamp: str
    context_used: bool = False

class CheckInPayload(BaseModel):
    user_id: str
    mood: int
    energy: int
    stress: int
    note: Optional[str] = ""

class HealthCheck(BaseModel):
    status: str
    timestamp: str

# Mock user context storage (replace with actual database)
user_contexts = {}

def get_claude_response(prompt: str, context: Optional[Dict] = None) -> str:
    """
    Generate Claude-style response using OpenAI API or Groq
    """
    try:
        # Build system prompt for coaching
        system_prompt = """You are a personal growth AI coach named Claude. You are:
        - Empathetic and supportive
        - Focused on personal development and mental wellness
        - Encouraging but realistic
        - Skilled at asking thoughtful questions
        - Able to provide actionable advice
        
        Keep responses conversational, helpful, and under 200 words unless specifically asked for more detail."""
        
        # Add context if available
        if context:
            context_str = f"\nUser Context: {json.dumps(context, indent=2)}"
            system_prompt += context_str
        
        # Make API call (works with both OpenAI and Groq)
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",  # or "claude-3-sonnet-20240229" for Groq
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            max_tokens=300,
            temperature=0.7,
        )
        
        return response.choices[0].message.content.strip()
        
    except Exception as e:
        logger.error(f"Claude API error: {e}")
        # Fallback response
        return "I'm here to help! I understand you're reaching out, and I want to support you. Could you tell me a bit more about what's on your mind today?"

async def get_user_context(user_id: str) -> Dict[str, Any]:
    """
    Fetch user context from database or cache
    """
    # This is a mock implementation - replace with actual Supabase queries
    context = user_contexts.get(user_id, {})
    
    # Add default context if none exists
    if not context:
        context = {
            "recent_mood": "neutral",
            "goals": [],
            "last_checkin": None,
            "preferences": {}
        }
    
    return context

@app.get("/", response_model=HealthCheck)
async def health_check():
    """Health check endpoint"""
    return HealthCheck(
        status="healthy",
        timestamp=datetime.now().isoformat()
    )

@app.post("/chat", response_model=ChatResponse)
async def chat(payload: ChatPayload):
    """
    Main chat endpoint for AI coaching
    """
    try:
        # Get user context
        user_context = await get_user_context(payload.user_id)
        
        # Merge provided context with stored context
        if payload.context:
            user_context.update(payload.context)
        
        # Generate AI response
        ai_response = get_claude_response(payload.message, user_context)
        
        # Store conversation context for future use
        user_contexts[payload.user_id] = user_context
        
        return ChatResponse(
            message=ai_response,
            timestamp=datetime.now().isoformat(),
            context_used=bool(user_context)
        )
        
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/checkin")
async def process_checkin(payload: CheckInPayload, background_tasks: BackgroundTasks):
    """
    Process check-in data and update user context
    """
    try:
        # Update user context with check-in data
        context = user_contexts.get(payload.user_id, {})
        context.update({
            "last_checkin": datetime.now().isoformat(),
            "recent_mood": payload.mood,
            "recent_energy": payload.energy,
            "recent_stress": payload.stress,
            "recent_note": payload.note
        })
        user_contexts[payload.user_id] = context
        
        # Generate personalized response based on check-in
        mood_responses = {
            1: "I notice you're having a tough day. That's completely okay - we all have difficult moments. What's one small thing that might help you feel a bit better right now?",
            2: "It sounds like today has been challenging. I'm here to listen and support you. Would you like to talk about what's been weighing on you?",
            3: "You're doing okay today, and that's perfectly fine. Sometimes steady is exactly what we need. How can I help you build on this foundation?",
            4: "I'm glad to hear you're feeling good today! What's been going well for you? Let's think about how to keep this positive momentum going.",
            5: "It's wonderful that you're feeling great today! Your positive energy is inspiring. What's been the highlight of your day so far?"
        }
        
        coach_response = mood_responses.get(payload.mood, "Thank you for sharing how you're feeling. I'm here to support you.")
        
        # Add energy and stress insights
        if payload.energy <= 2:
            coach_response += " I notice your energy is low - have you been getting enough rest and taking care of yourself?"
        elif payload.energy >= 4:
            coach_response += " Your energy levels sound great! That's a wonderful foundation for achieving your goals."
        
        if payload.stress >= 4:
            coach_response += " It sounds like you're dealing with some stress. What's been the biggest source of pressure for you lately?"
        elif payload.stress <= 2:
            coach_response += " I'm glad your stress levels are manageable. You're doing a great job maintaining your well-being."
        
        return {
            "message": coach_response,
            "xp_earned": 10 + (len(payload.note or "") > 0) * 10 + (payload.mood >= 3) * 5,
            "insights": {
                "mood_trend": "improving" if payload.mood >= 3 else "needs_attention",
                "energy_level": "high" if payload.energy >= 4 else "moderate" if payload.energy >= 3 else "low",
                "stress_level": "high" if payload.stress >= 4 else "moderate" if payload.stress >= 3 else "low"
            }
        }
        
    except Exception as e:
        logger.error(f"Check-in processing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/insights/{user_id}")
async def get_insights(user_id: str):
    """
    Get personalized insights for a user
    """
    try:
        context = user_contexts.get(user_id, {})
        
        if not context:
            return {
                "message": "Start by doing a daily check-in to get personalized insights!",
                "insights": []
            }
        
        insights = []
        
        # Mood insights
        if "recent_mood" in context:
            if context["recent_mood"] <= 2:
                insights.append("Consider reaching out to someone you trust or trying a mood-boosting activity.")
            elif context["recent_mood"] >= 4:
                insights.append("Your positive mood is great! Try to identify what's working well so you can replicate it.")
        
        # Energy insights
        if "recent_energy" in context:
            if context["recent_energy"] <= 2:
                insights.append("Low energy might indicate you need better sleep, nutrition, or stress management.")
            elif context["recent_energy"] >= 4:
                insights.append("High energy is excellent! This is a great time to tackle challenging goals.")
        
        # Stress insights
        if "recent_stress" in context:
            if context["recent_stress"] >= 4:
                insights.append("High stress levels need attention. Consider meditation, exercise, or talking to someone.")
            elif context["recent_stress"] <= 2:
                insights.append("Your stress management is working well. Keep up the good habits!")
        
        return {
            "message": "Here are your personalized insights:",
            "insights": insights,
            "last_updated": context.get("last_checkin", "Never")
        }
        
    except Exception as e:
        logger.error(f"Insights error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 