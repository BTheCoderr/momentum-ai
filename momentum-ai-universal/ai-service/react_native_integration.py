#!/usr/bin/env python3
"""
React Native Integration Service
FastAPI server that connects the RAG system to the React Native app
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import uvicorn
import json
from datetime import datetime, timedelta
import random

from rag_system import RAGSystem
from vector_store_faiss import FAISSVectorStore

# Initialize FastAPI app
app = FastAPI(title="Momentum AI RAG Service", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize RAG system
try:
    rag_system = RAGSystem()
    print("✅ RAG System initialized successfully")
except Exception as e:
    print(f"❌ Error initializing RAG system: {e}")
    rag_system = None

# Request/Response models
class ChatMessage(BaseModel):
    message: str
    userId: str
    coachingType: Optional[str] = "general"
    context: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    response: str
    context_used: List[str]
    confidence: float
    coaching_type: str
    recommendations: List[str]
    follow_up_actions: List[str]
    timestamp: str

class UserInteraction(BaseModel):
    userId: str
    interactionType: str
    content: str
    metadata: Optional[Dict[str, Any]] = None

class PatternAnalysisResponse(BaseModel):
    userId: str
    patterns: Dict[str, Any]
    insights: List[str]
    recommendations: List[str]
    total_data_points: int

class Goal(BaseModel):
    id: str
    title: str
    user_id: str
    
class CheckIn(BaseModel):
    entry: str
    mood: str
    created_at: str
    user_id: str

class WeeklySummary(BaseModel):
    user_id: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class MoodPredictionRequest(BaseModel):
    user_id: str
    recent_checkins: List[Dict[str, Any]]
    time_of_day: Optional[str] = None
    sleep_quality: Optional[int] = None
    activity_level: Optional[int] = None

class CoachNudgeRequest(BaseModel):
    user_id: str
    recent_checkins: List[Dict[str, Any]]
    days_since_last_checkin: int
    goal_progress: Optional[Dict[str, Any]] = None

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "🚀 Momentum AI Service Running",
        "service": "Momentum AI RAG Service",
        "version": "1.0.0",
        "features": [
            "RAG-enhanced conversations",
            "User interaction tracking", 
            "Pattern analysis",
            "Mood prediction",
            "Coach nudges"
        ]
    }

@app.post("/chat", response_model=ChatResponse)
async def get_contextual_reply(request: ChatMessage):
    """
    Main chat endpoint - provides contextual AI coaching responses
    This is the function your React Native app will call
    """
    try:
        # Get RAG response with user context
        rag_response = rag_system.get_coaching_response(
            request.userId, 
            request.message, 
            request.coachingType
        )
        
        # Extract recommendations and follow-up actions
        recommendations = extract_recommendations(rag_response["response"])
        follow_up_actions = extract_follow_up_actions(request.message, request.coachingType)
        
        return ChatResponse(
            response=rag_response["response"],
            context_used=list(rag_response["context_used"]["relevant_data"].keys()),
            confidence=0.85,  # High confidence due to personalized context
            coaching_type=rag_response["coaching_type"],
            recommendations=recommendations,
            follow_up_actions=follow_up_actions,
            timestamp=rag_response["timestamp"]
        )
        
    except Exception as e:
        # Fallback response if RAG fails
        fallback_response = get_fallback_response(request.message, request.coachingType)
        return ChatResponse(
            response=fallback_response["response"],
            context_used=[],
            confidence=0.6,
            coaching_type=request.coachingType,
            recommendations=fallback_response["recommendations"],
            follow_up_actions=fallback_response["follow_up_actions"],
            timestamp=datetime.now().isoformat()
        )

@app.post("/user-interaction")
async def add_user_interaction(request: UserInteraction):
    """
    Add user interaction to the vector store
    Call this when users do check-ins, set goals, make reflections, etc.
    """
    try:
        doc_id = rag_system.add_user_interaction(
            request.userId,
            request.interactionType,
            request.content,
            request.metadata
        )
        
        return {
            "success": True,
            "doc_id": doc_id,
            "message": f"Added {request.interactionType} for user {request.userId}"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/user-patterns/{user_id}", response_model=PatternAnalysisResponse)
async def analyze_user_patterns(user_id: str):
    """
    Analyze user patterns and provide insights
    Great for the insights/analytics screen
    """
    try:
        patterns = rag_system.analyze_user_patterns(user_id)
        
        # Generate insights from patterns
        insights = generate_pattern_insights(patterns)
        recommendations = generate_pattern_recommendations(patterns)
        
        return PatternAnalysisResponse(
            userId=user_id,
            patterns=patterns["patterns"],
            insights=insights,
            recommendations=recommendations,
            total_data_points=patterns["total_data_points"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/user-context/{user_id}")
async def get_user_context(user_id: str, query: str = "general context"):
    """
    Get user context for debugging or advanced features
    """
    try:
        context = rag_system.vector_store.get_user_context(user_id, query)
        return context
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/system-stats")
async def get_system_stats():
    """
    Get system statistics for monitoring
    """
    try:
        stats = rag_system.get_system_stats()
        return stats
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/calculate-progress")
async def calculate_progress(goal: Goal):
    try:
        # TODO: Implement actual progress calculation with user data
        score = 75  # Placeholder score
        return {"score": score}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/weekly-summary")
async def get_weekly_summary(data: WeeklySummary):
    try:
        # TODO: Implement actual summary generation with user data
        summary = "This is a placeholder weekly summary. Will be replaced with actual AI analysis."
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/coach-preview")
async def get_coach_preview(request: dict):
    try:
        prompt = request.get("prompt", "You're my motivational coach. Say something inspiring!")
        
        if rag_system:
            try:
                response = rag_system.chat(prompt, user_id="preview_user")
                return {"response": response["response"]}
            except Exception as e:
                print(f"RAG system error: {e}")
        
        # Fallback responses
        fallback_responses = [
            "You've got this! Every step forward is progress, no matter how small.",
            "Your potential is unlimited. What matters most is that you keep moving forward.",
            "Remember: progress, not perfection. You're building something amazing.",
            "Today is a new opportunity to become the person you want to be.",
            "Your consistency is your superpower. Trust the process and keep going."
        ]
        
        response = random.choice(fallback_responses)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict-mood")
async def predict_mood(request: MoodPredictionRequest):
    """Predict user's mood based on patterns and context"""
    try:
        recent_checkins = request.recent_checkins[-5:]  # Last 5 check-ins
        
        if not recent_checkins:
            return {
                "predicted_mood": "neutral",
                "confidence": 0.5,
                "reasoning": "No recent check-in data available"
            }
        
        # Calculate average mood score from recent check-ins
        mood_scores = [get_mood_score(checkin.get('mood', 'okay')) for checkin in recent_checkins]
        avg_mood_score = sum(mood_scores) / len(mood_scores)
        
        # Factor in time of day
        current_hour = datetime.now().hour
        time_factor = 1.0
        
        if 6 <= current_hour <= 10:  # Morning
            time_factor = 1.1  # Slight boost for morning optimism
        elif 14 <= current_hour <= 16:  # Afternoon dip
            time_factor = 0.9
        elif current_hour >= 22 or current_hour <= 5:  # Late night/early morning
            time_factor = 0.8
        
        # Factor in sleep quality and activity level if provided
        sleep_factor = (request.sleep_quality or 5) / 5.0
        activity_factor = (request.activity_level or 5) / 10.0
        
        # Combine factors
        predicted_score = avg_mood_score * time_factor * sleep_factor * (1 + activity_factor * 0.2)
        
        # Map score to mood
        if predicted_score < 2.0:
            predicted_mood = "down"
            confidence = 0.7
        elif predicted_score < 2.8:
            predicted_mood = "okay"
            confidence = 0.6
        elif predicted_score < 3.8:
            predicted_mood = "good"
            confidence = 0.8
        elif predicted_score < 4.5:
            predicted_mood = "great"
            confidence = 0.7
        else:
            predicted_mood = "amazing"
            confidence = 0.6
        
        # Generate reasoning
        trend = "stable"
        if len(mood_scores) > 1:
            recent_trend = mood_scores[-1] - mood_scores[0]
            if recent_trend > 0.5:
                trend = "improving"
            elif recent_trend < -0.5:
                trend = "declining"
        
        reasoning = f"Based on recent mood trend ({trend}) and current time patterns"
        
        return {
            "predicted_mood": predicted_mood,
            "confidence": round(confidence, 2),
            "reasoning": reasoning,
            "score": round(predicted_score, 2)
        }
        
    except Exception as e:
        print(f"Error predicting mood: {e}")
        return {
            "predicted_mood": "neutral",
            "confidence": 0.5,
            "reasoning": "Error in mood prediction"
        }

@app.post("/check-nudges")
async def check_nudges(request: CoachNudgeRequest):
    """Check if user needs a proactive nudge based on patterns"""
    try:
        nudges = []
        
        # Check for absence pattern
        if request.days_since_last_checkin >= 3:
            nudges.append({
                "type": "absence",
                "message": "Hey there! It's been a few days since your last check-in. How are you feeling?",
                "priority": "high",
                "action": "checkin"
            })
        
        # Check for mood patterns
        if request.recent_checkins:
            recent_moods = [checkin.get('mood', 'okay') for checkin in request.recent_checkins[-3:]]
            low_moods = ['down', 'tired', 'anxious', 'stressed']
            
            low_mood_count = sum(1 for mood in recent_moods if mood in low_moods)
            
            if low_mood_count >= 2:
                nudges.append({
                    "type": "mood_support",
                    "message": "I've noticed you've been having some tough days. Want to talk about what's on your mind?",
                    "priority": "medium",
                    "action": "coach_chat"
                })
        
        # Check for goal progress (if provided)
        if request.goal_progress and request.goal_progress.get('stalled', False):
            nudges.append({
                "type": "goal_motivation",
                "message": "Your goals are waiting for you! Ready to make some progress today?",
                "priority": "medium",
                "action": "goal_review"
            })
        
        # Positive reinforcement for good patterns
        if request.days_since_last_checkin == 0:  # Checked in today
            recent_moods = [checkin.get('mood', 'okay') for checkin in request.recent_checkins[-3:]]
            positive_moods = ['good', 'great', 'amazing', 'motivated', 'energized', 'happy', 'confident']
            
            if any(mood in positive_moods for mood in recent_moods):
                nudges.append({
                    "type": "positive_reinforcement",
                    "message": "You're on a great streak! Keep up the amazing momentum! 🔥",
                    "priority": "low",
                    "action": "celebration"
                })
        
        # Return the highest priority nudge
        if nudges:
            priority_order = {"high": 3, "medium": 2, "low": 1}
            top_nudge = max(nudges, key=lambda x: priority_order[x["priority"]])
            return {
                "has_nudge": True,
                "nudge": top_nudge,
                "all_nudges": nudges
            }
        else:
            return {
                "has_nudge": False,
                "message": "You're doing great! Keep up the momentum."
            }
        
    except Exception as e:
        print(f"Error checking nudges: {e}")
        return {
            "has_nudge": False,
            "message": "Unable to check patterns right now."
        }

# Helper functions
def extract_recommendations(response: str) -> List[str]:
    """Extract actionable recommendations from AI response"""
    recommendations = []
    
    # Simple keyword-based extraction (can be enhanced with NLP)
    if "try" in response.lower():
        recommendations.append("Take action on the suggested approach")
    if "consider" in response.lower():
        recommendations.append("Reflect on the mentioned considerations")
    if "focus" in response.lower():
        recommendations.append("Prioritize the highlighted areas")
    
    # Default recommendations
    if not recommendations:
        recommendations = [
            "Take one small action today",
            "Reflect on your progress",
            "Stay consistent with your goals"
        ]
    
    return recommendations[:3]  # Limit to 3 recommendations

def extract_follow_up_actions(message: str, coaching_type: str) -> List[str]:
    """Generate follow-up actions based on message and coaching type"""
    actions = []
    
    if coaching_type == "motivation":
        actions = [
            "Set a small goal for today",
            "Celebrate a recent win",
            "Connect with your why"
        ]
    elif coaching_type == "planning":
        actions = [
            "Break down your goal into steps",
            "Set a timeline",
            "Identify potential obstacles"
        ]
    elif coaching_type == "reflection":
        actions = [
            "Journal about your insights",
            "Identify patterns in your behavior",
            "Plan improvements for tomorrow"
        ]
    else:
        actions = [
            "Take one action step",
            "Check in with yourself later",
            "Stay committed to your journey"
        ]
    
    return actions

def get_fallback_response(message: str, coaching_type: str) -> Dict[str, Any]:
    """Generate fallback response when RAG system fails"""
    fallback_responses = {
        "motivation": {
            "response": "I believe in your ability to overcome any challenge! Every expert was once a beginner. What's one small step you can take right now to move forward? 💪",
            "recommendations": ["Take one small action", "Focus on progress, not perfection", "Celebrate small wins"],
            "follow_up_actions": ["Set a micro-goal", "Do something energizing", "Connect with your purpose"]
        },
        "planning": {
            "response": "Great planning mindset! Let's break this down into manageable steps. What's the most important outcome you want to achieve, and what's the very first action you could take? 🎯",
            "recommendations": ["Start with the end in mind", "Break goals into small steps", "Set realistic timelines"],
            "follow_up_actions": ["Write down your goal", "Identify the first step", "Set a deadline"]
        },
        "reflection": {
            "response": "Self-reflection is such a powerful tool for growth! What you're sharing shows real self-awareness. What patterns are you noticing, and what would you like to change? 🌟",
            "recommendations": ["Notice patterns without judgment", "Focus on what you can control", "Learn from every experience"],
            "follow_up_actions": ["Journal your thoughts", "Identify one improvement", "Plan tomorrow differently"]
        }
    }
    
    return fallback_responses.get(coaching_type, fallback_responses["motivation"])

def generate_pattern_insights(patterns: Dict[str, Any]) -> List[str]:
    """Generate insights from user patterns"""
    insights = []
    
    total_points = patterns.get("total_data_points", 0)
    
    if total_points > 10:
        insights.append("You have substantial data showing consistent engagement")
    elif total_points > 5:
        insights.append("You're building good momentum with regular check-ins")
    else:
        insights.append("Great start! More data will help personalize your experience")
    
    # Add more sophisticated pattern analysis here
    insights.extend([
        "Your motivation levels show interesting weekly patterns",
        "Goal achievement correlates with consistent check-ins",
        "Positive mood entries tend to cluster around achievements"
    ])
    
    return insights[:5]

def generate_pattern_recommendations(patterns: Dict[str, Any]) -> List[str]:
    """Generate recommendations based on patterns"""
    recommendations = [
        "Continue your consistent check-in habits",
        "Focus on maintaining positive momentum",
        "Consider setting weekly micro-goals",
        "Reflect on what's working well for you",
        "Build on your strongest patterns"
    ]
    
    return recommendations[:3]

def get_mood_score(mood: str) -> float:
    mood_scores = {
        'down': 1.0,
        'okay': 2.5,
        'good': 3.5,
        'great': 4.5,
        'amazing': 5.0,
        'tired': 2.0,
        'anxious': 1.5,
        'motivated': 4.0,
        'energized': 4.5,
        'stressed': 1.8,
        'happy': 4.2,
        'confident': 4.3
    }
    return mood_scores.get(mood.lower(), 2.5)

if __name__ == "__main__":
    print("🚀 Starting Momentum AI RAG Service")
    print("=" * 50)
    if rag_system:
        print(f"📊 Vector Store: {len(rag_system.vector_store.docstore._dict)} documents")
        print("🤖 Model: phi3:mini")
    print("🔗 Server: http://localhost:8000")
    print("📖 Docs: http://localhost:8000/docs")
    print("🧠 Features: RAG, Mood Prediction, Coach Nudges")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info") 