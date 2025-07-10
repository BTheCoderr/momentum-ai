#!/usr/bin/env python3
"""
Simple test script for the new AI endpoints
"""

from fastapi import FastAPI
import uvicorn
from datetime import datetime
import random

app = FastAPI()

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

@app.get("/")
async def root():
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

@app.post("/predict-mood")
async def predict_mood(request: dict):
    """Predict user's mood based on patterns and context"""
    try:
        recent_checkins = request.get('recent_checkins', [])[-5:]  # Last 5 check-ins
        
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
        sleep_factor = (request.get('sleep_quality', 5)) / 5.0
        activity_factor = (request.get('activity_level', 5)) / 10.0
        
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
async def check_nudges(request: dict):
    """Check if user needs a proactive nudge based on patterns"""
    try:
        nudges = []
        recent_checkins = request.get('recent_checkins', [])
        days_since_last_checkin = request.get('days_since_last_checkin', 0)
        
        # Check for absence pattern
        if days_since_last_checkin >= 3:
            nudges.append({
                "type": "absence",
                "message": "Hey there! It's been a few days since your last check-in. How are you feeling?",
                "priority": "high",
                "action": "checkin"
            })
        
        # Check for mood patterns
        if recent_checkins:
            recent_moods = [checkin.get('mood', 'okay') for checkin in recent_checkins[-3:]]
            low_moods = ['down', 'tired', 'anxious', 'stressed']
            
            low_mood_count = sum(1 for mood in recent_moods if mood in low_moods)
            
            if low_mood_count >= 2:
                nudges.append({
                    "type": "mood_support",
                    "message": "I've noticed you've been having some tough days. Want to talk about what's on your mind?",
                    "priority": "medium",
                    "action": "coach_chat"
                })
        
        # Positive reinforcement for good patterns
        if days_since_last_checkin == 0:  # Checked in today
            recent_moods = [checkin.get('mood', 'okay') for checkin in recent_checkins[-3:]]
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

@app.post("/coach-preview")
async def get_coach_preview(request: dict):
    """Simple coach preview without RAG"""
    try:
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
        return {"response": "Stay motivated! You're doing great."}

if __name__ == "__main__":
    print("🚀 Starting Test Momentum AI Service")
    print("🧠 Features: Mood Prediction, Coach Nudges")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info") 