from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.preprocessing import StandardScaler
from datetime import datetime, timedelta
import json
from typing import List, Dict, Optional

app = FastAPI(title="Momentum AI - Pattern Recognition Service")

# Data Models
class UserBehavior(BaseModel):
    user_id: str
    timestamp: datetime
    action_type: str  # checkin, goal_update, chat, etc.
    goal_id: Optional[str] = None
    progress_delta: Optional[float] = None
    sentiment_score: Optional[float] = None
    session_duration: Optional[int] = None

class PredictionRequest(BaseModel):
    user_id: str
    days_ahead: int = 7

class RiskPrediction(BaseModel):
    user_id: str
    risk_score: float  # 0-1, higher = more likely to drift
    predicted_drift_date: Optional[datetime]
    intervention_recommendations: List[str]
    confidence: float

# In-memory storage (replace with proper DB)
user_behaviors = []
models = {}

@app.post("/api/track-behavior")
async def track_behavior(behavior: UserBehavior):
    """Track user behavior for pattern analysis"""
    user_behaviors.append(behavior.dict())
    return {"status": "recorded", "behavior_id": len(user_behaviors)}

@app.get("/api/predict-drift/{user_id}")
async def predict_drift(user_id: str, days_ahead: int = 7) -> RiskPrediction:
    """Predict if user will drift from their goals"""
    
    # Get user's historical data
    user_data = [b for b in user_behaviors if b['user_id'] == user_id]
    
    if len(user_data) < 5:
        return RiskPrediction(
            user_id=user_id,
            risk_score=0.5,
            predicted_drift_date=None,
            intervention_recommendations=["Need more data to make accurate predictions"],
            confidence=0.1
        )
    
    # Feature extraction
    df = pd.DataFrame(user_data)
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df = df.sort_values('timestamp')
    
    # Calculate patterns
    features = extract_behavioral_features(df)
    
    # Predict drift risk
    risk_score = calculate_drift_risk(features)
    
    # Generate recommendations
    recommendations = generate_interventions(features, risk_score)
    
    return RiskPrediction(
        user_id=user_id,
        risk_score=risk_score,
        predicted_drift_date=datetime.now() + timedelta(days=days_ahead) if risk_score > 0.6 else None,
        intervention_recommendations=recommendations,
        confidence=min(len(user_data) / 50.0, 0.95)  # More data = higher confidence
    )

def extract_behavioral_features(df: pd.DataFrame) -> Dict:
    """Extract meaningful features from user behavior"""
    
    # Time-based patterns
    df['hour'] = df['timestamp'].dt.hour
    df['day_of_week'] = df['timestamp'].dt.dayofweek
    
    # Engagement patterns
    daily_actions = df.groupby(df['timestamp'].dt.date).size()
    avg_daily_engagement = daily_actions.mean()
    engagement_consistency = 1.0 - (daily_actions.std() / daily_actions.mean() if daily_actions.mean() > 0 else 1.0)
    
    # Progress patterns
    progress_trend = df['progress_delta'].fillna(0).rolling(window=7).mean().iloc[-1] if 'progress_delta' in df.columns else 0
    
    # Time since last action
    days_since_last_action = (datetime.now() - df['timestamp'].max()).days
    
    # Session patterns
    avg_session_duration = df['session_duration'].mean() if 'session_duration' in df.columns else 300
    
    # Sentiment trend
    sentiment_trend = df['sentiment_score'].fillna(0).rolling(window=5).mean().iloc[-1] if 'sentiment_score' in df.columns else 0.5
    
    return {
        'avg_daily_engagement': avg_daily_engagement,
        'engagement_consistency': engagement_consistency,
        'progress_trend': progress_trend,
        'days_since_last_action': days_since_last_action,
        'avg_session_duration': avg_session_duration,
        'sentiment_trend': sentiment_trend,
        'total_actions': len(df)
    }

def calculate_drift_risk(features: Dict) -> float:
    """Calculate risk of user drifting from goals"""
    
    risk_factors = []
    
    # Engagement risk
    if features['days_since_last_action'] > 3:
        risk_factors.append(0.3)
    
    if features['avg_daily_engagement'] < 2:
        risk_factors.append(0.2)
    
    if features['engagement_consistency'] < 0.5:
        risk_factors.append(0.2)
    
    # Progress risk
    if features['progress_trend'] < 0:
        risk_factors.append(0.25)
    
    # Sentiment risk
    if features['sentiment_trend'] < 0.3:
        risk_factors.append(0.15)
    
    # Session duration risk
    if features['avg_session_duration'] < 120:  # Less than 2 minutes
        risk_factors.append(0.1)
    
    return min(sum(risk_factors), 1.0)

def generate_interventions(features: Dict, risk_score: float) -> List[str]:
    """Generate personalized intervention recommendations"""
    
    interventions = []
    
    if risk_score > 0.7:
        interventions.append("🚨 HIGH RISK: Schedule immediate check-in call")
        
    if features['days_since_last_action'] > 2:
        interventions.append("📱 Send gentle reminder notification")
        
    if features['progress_trend'] < 0:
        interventions.append("🎯 Suggest breaking down current goal into smaller steps")
        
    if features['sentiment_trend'] < 0.4:
        interventions.append("💪 Send motivational content or success stories")
        
    if features['engagement_consistency'] < 0.5:
        interventions.append("⏰ Suggest setting up daily routine/reminders")
        
    if features['avg_session_duration'] < 120:
        interventions.append("🎮 Recommend gamified shorter interactions")
    
    if not interventions:
        interventions.append("✅ User is on track - continue current approach")
    
    return interventions

@app.get("/api/user-insights/{user_id}")
async def get_user_insights(user_id: str):
    """Get comprehensive behavioral insights for a user"""
    
    user_data = [b for b in user_behaviors if b['user_id'] == user_id]
    
    if not user_data:
        return {"error": "No data found for user"}
    
    df = pd.DataFrame(user_data)
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    # Time-based insights
    hourly_activity = df.groupby(df['timestamp'].dt.hour).size().to_dict()
    daily_activity = df.groupby(df['timestamp'].dt.day_name()).size().to_dict()
    
    # Streak calculation
    daily_actions = df.groupby(df['timestamp'].dt.date).size()
    current_streak = calculate_current_streak(daily_actions)
    
    return {
        "user_id": user_id,
        "total_actions": len(user_data),
        "date_range": {
            "start": df['timestamp'].min().isoformat(),
            "end": df['timestamp'].max().isoformat()
        },
        "activity_patterns": {
            "hourly": hourly_activity,
            "daily": daily_activity
        },
        "current_streak": current_streak,
        "features": extract_behavioral_features(df)
    }

def calculate_current_streak(daily_actions):
    """Calculate current consecutive days of activity"""
    dates = sorted(daily_actions.index, reverse=True)
    streak = 0
    
    for i, date in enumerate(dates):
        if i == 0:
            continue
        
        prev_date = dates[i-1]
        if (prev_date - date).days == 1:
            streak += 1
        else:
            break
    
    return streak

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001) 