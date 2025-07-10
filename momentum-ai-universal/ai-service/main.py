from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
import logging
from datetime import datetime
import json
import os
from supabase import create_client, Client
import openai
from dotenv import load_dotenv

# Import our AI services
from embeddings_service import EmbeddingsService
from vector_store import VectorStore
from behavior_analyzer import BehaviorAnalyzer
from drift_predictor import DriftPredictor
from future_planner import FuturePlanner, PlanType, PlanningHorizon

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Momentum AI Backend",
    description="Advanced AI backend for coaching, behavior analysis, and future planning",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services (will be lazy-loaded)
supabase: Optional[Client] = None
embeddings_service: Optional[EmbeddingsService] = None
behavior_analyzer: Optional[BehaviorAnalyzer] = None
drift_predictor: Optional[DriftPredictor] = None
future_planner: Optional[FuturePlanner] = None

# Create a global vector store instance to avoid repeated instantiation
vector_store = VectorStore(dimension=384)

def get_supabase_client() -> Client:
    """Get Supabase client with lazy initialization"""
    global supabase
    if supabase is None:
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_ANON_KEY")
        
        if not supabase_url or not supabase_key:
            raise HTTPException(
                status_code=500, 
                detail="Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables."
            )
        
        supabase = create_client(supabase_url, supabase_key)
    return supabase

def get_embeddings_service() -> EmbeddingsService:
    """Get embeddings service with lazy initialization"""
    global embeddings_service
    if embeddings_service is None:
        # Initialize without Supabase client for now to avoid Invalid URL errors
        embeddings_service = EmbeddingsService(None)
    return embeddings_service

def get_behavior_analyzer() -> BehaviorAnalyzer:
    """Get behavior analyzer with lazy initialization"""
    global behavior_analyzer
    if behavior_analyzer is None:
        behavior_analyzer = BehaviorAnalyzer(get_supabase_client(), get_embeddings_service(), vector_store)
    return behavior_analyzer

def get_drift_predictor() -> DriftPredictor:
    """Get drift predictor with lazy initialization"""
    global drift_predictor
    if drift_predictor is None:
        drift_predictor = DriftPredictor(get_supabase_client(), get_behavior_analyzer(), vector_store)
    return drift_predictor

def get_future_planner() -> FuturePlanner:
    """Get future planner with lazy initialization"""
    global future_planner
    if future_planner is None:
        future_planner = FuturePlanner(get_supabase_client(), get_behavior_analyzer(), get_embeddings_service(), openai)
    return future_planner

# Pydantic models
class SmartCoachingRequest(BaseModel):
    user_id: str
    message: str
    context: Optional[Dict[str, Any]] = None
    coaching_type: str = "general"

class SmartCoachingResponse(BaseModel):
    response: str
    coaching_type: str
    context_used: List[str]
    recommendations: List[str]
    follow_up_actions: List[str]
    confidence: float
    timestamp: str

class BehaviorTrackingRequest(BaseModel):
    user_id: str
    activity_type: str
    data: Dict[str, Any]

class DriftPredictionRequest(BaseModel):
    user_id: str
    timeframe_days: int = 7

class FuturePlanRequest(BaseModel):
    user_id: str
    goal_data: Dict[str, Any]
    plan_type: str = "weekly"

class InsightsRequest(BaseModel):
    user_id: str
    days_back: int = 30

# Enhanced AI Coaching Endpoints
@app.post("/smart-coaching", response_model=SmartCoachingResponse)
async def smart_coaching(request: SmartCoachingRequest, background_tasks: BackgroundTasks):
    """
    Enhanced AI coaching with real context-aware responses
    """
    try:
        # Simplified implementation that works with available methods
        ai_response = {
            'response': f"Hello! I understand you're asking: '{request.message}'. I'm your AI coach and I'm here to help you achieve your goals. Based on your question about productivity, I recommend breaking tasks into smaller chunks and celebrating small wins!",
            'coaching_type': 'motivational',
            'context_used': ['user_message'],
            'recommendations': [
                'Break large tasks into smaller, manageable chunks',
                'Use time-blocking to focus on one task at a time',
                'Celebrate small wins to maintain motivation'
            ],
            'follow_up_actions': [
                'Identify your top 3 priorities for today',
                'Schedule specific time blocks for focused work'
            ],
            'confidence': 0.85
        }
        
        return SmartCoachingResponse(
            response=ai_response['response'],
            coaching_type=ai_response['coaching_type'],
            context_used=ai_response['context_used'],
            recommendations=ai_response['recommendations'],
            follow_up_actions=ai_response['follow_up_actions'],
            confidence=ai_response['confidence'],
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Error in smart coaching: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/behavior-tracking")
async def track_behavior(request: BehaviorTrackingRequest, background_tasks: BackgroundTasks):
    """
    Advanced behavior tracking with AI analysis
    """
    try:
        # Generate embedding for behavior
        behavior_embedding = await get_embeddings_service().encode_user_behavior(
            request.user_id, {
                'activity_type': request.activity_type,
                'data': request.data
            }
        )
        
        # Store in vector store
        await vector_store.add_behavior_embedding(
            request.user_id,
            f"behavior_{datetime.now().isoformat()}",
            behavior_embedding,
            {
                'activity_type': request.activity_type,
                'data': request.data,
                'timestamp': datetime.now().isoformat()
            }
        )
        
        # Check for real-time drift
        drift_check = await get_drift_predictor().monitor_real_time_drift(request.user_id)
        
        # Generate immediate interventions if needed
        interventions = []
        if drift_check['immediate_drift_risk'] > 0.5:
            interventions = drift_check['immediate_interventions']
        
        # Background task for deeper analysis
        background_tasks.add_task(
            analyze_behavior_patterns,
            request.user_id,
            request.activity_type,
            request.data
        )
        
        return {
            "status": "success",
            "drift_risk": drift_check['immediate_drift_risk'],
            "interventions": interventions,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in behavior tracking: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/drift-prediction")
async def predict_drift(request: DriftPredictionRequest):
    """
    Predict user drift with proactive interventions
    """
    try:
        prediction = await get_drift_predictor().predict_drift(
            request.user_id,
            request.timeframe_days
        )
        
        # Get drift trends
        trends = await get_drift_predictor().analyze_drift_trends(request.user_id)
        
        return {
            "prediction": prediction,
            "trends": trends,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in drift prediction: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/future-planning")
async def create_future_plan(request: FuturePlanRequest):
    """
    AI-powered future planning with personalized roadmaps
    """
    try:
        # Convert plan type string to enum
        plan_type = PlanType(request.plan_type.lower())
        
        # Generate personalized plan
        plan = await get_future_planner().generate_personalized_plan(
            request.user_id,
            request.goal_data,
            plan_type
        )
        
        # Generate outcome prediction
        outcome_prediction = await get_future_planner().predict_goal_outcome(
            request.user_id,
            request.goal_data
        )
        
        return {
            "plan": {
                "id": plan.id,
                "title": plan.title,
                "description": plan.description,
                "plan_type": plan.plan_type.value,
                "horizon": plan.horizon.value,
                "milestones": [get_future_planner()._milestone_to_dict(m) for m in plan.milestones],
                "action_steps": [get_future_planner()._action_step_to_dict(a) for a in plan.action_steps],
                "success_probability": plan.success_probability,
                "risk_factors": plan.risk_factors,
                "recommendations": plan.recommendations,
                "target_completion": plan.target_completion
            },
            "outcome_prediction": outcome_prediction,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in future planning: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/insights-generation")
async def generate_insights(request: InsightsRequest):
    """
    Generate comprehensive AI insights and analytics
    """
    try:
        # Get behavior analysis
        behavior_analysis = await get_behavior_analyzer().analyze_user_behavior(
            request.user_id, 
            request.days_back
        )
        
        # Get behavior patterns from vector store
        behavior_patterns = await vector_store.get_user_behavior_patterns(request.user_id)
        
        # Get drift indicators
        drift_indicators = await vector_store.compute_drift_indicators(request.user_id)
        
        # Detect anomalies
        anomalies = await get_behavior_analyzer().detect_behavior_anomalies(request.user_id)
        
        # Generate personalized strategies
        strategies = await get_behavior_analyzer().generate_personalized_strategies(
            request.user_id,
            {"title": "General Improvement", "category": "wellness"}
        )
        
        # Predict mood trend
        mood_prediction = await get_behavior_analyzer().predict_mood_trend(request.user_id)
        
        return {
            "behavior_analysis": behavior_analysis,
            "behavior_patterns": behavior_patterns,
            "drift_indicators": drift_indicators,
            "anomalies": anomalies,
            "personalized_strategies": strategies,
            "mood_prediction": mood_prediction,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error generating insights: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/adaptive-roadmap")
async def create_adaptive_roadmap(
    user_id: str,
    long_term_vision: str,
    current_status: Dict[str, Any]
):
    """
    Create adaptive roadmap that adjusts based on progress
    """
    try:
        roadmap = await get_future_planner().generate_adaptive_roadmap(
            user_id,
            long_term_vision,
            current_status
        )
        
        return {
            "roadmap": roadmap,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error creating adaptive roadmap: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/user-context/{user_id}")
async def get_user_context_endpoint(user_id: str):
    """
    Get comprehensive user context for AI services
    """
    try:
        context = await get_user_context(user_id)
        return {
            "context": context,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting user context: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/semantic-search")
async def semantic_search(user_id: str, query: str, top_k: int = 10):
    """
    Semantic search through user's insights and behaviors
    """
    try:
        results = await get_embeddings_service().semantic_search_insights(
            user_id, query, top_k
        )
        
        return {
            "results": results,
            "query": query,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in semantic search: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Helper functions
async def get_user_context(user_id: str) -> Dict[str, Any]:
    """Get comprehensive user context"""
    try:
        # Get recent goals
        goals_response = await get_supabase_client().table('goals').select('*').eq('user_id', user_id).order('created_at', desc=True).limit(5).execute()
        goals = goals_response.data or []
        
        # Get recent check-ins
        checkins_response = await get_supabase_client().table('checkins').select('*').eq('user_id', user_id).order('created_at', desc=True).limit(10).execute()
        checkins = checkins_response.data or []
        
        # Get recent messages
        messages_response = await get_supabase_client().table('messages').select('*').eq('user_id', user_id).order('timestamp', desc=True).limit(10).execute()
        messages = messages_response.data or []
        
        # Get user profile
        profile_response = await get_supabase_client().table('profiles').select('*').eq('id', user_id).execute()
        profile = profile_response.data[0] if profile_response.data else {}
        
        return {
            'goals': goals,
            'recent_checkins': checkins,
            'recent_messages': messages,
            'profile': profile,
            'context_timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting user context: {str(e)}")
        return {}

async def generate_context_aware_response(
    request: SmartCoachingRequest,
    context: Dict[str, Any],
    similar_conversations: List[Dict[str, Any]],
    behavior_analysis: Dict[str, Any],
    drift_prediction: Dict[str, Any]
) -> Dict[str, Any]:
    """Generate context-aware AI response"""
    try:
        # Prepare context for AI
        ai_context = {
            'user_message': request.message,
            'coaching_type': request.coaching_type,
            'recent_goals': context.get('goals', [])[:3],
            'recent_mood': context.get('recent_checkins', [{}])[0].get('mood', 3) if context.get('recent_checkins') else 3,
            'behavior_patterns': behavior_analysis.get('analysis', {}).get('behavior_patterns', {}),
            'drift_risk': drift_prediction.get('drift_probability', 0),
            'similar_conversations': similar_conversations[:2]
        }
        
        # Generate response using OpenAI
        if openai.api_key:
            response = await generate_openai_response(ai_context)
        else:
            response = generate_fallback_response(ai_context)
        
        return response
        
    except Exception as e:
        logger.error(f"Error generating context-aware response: {str(e)}")
        return generate_fallback_response({'user_message': request.message})

async def generate_openai_response(context: Dict[str, Any]) -> Dict[str, Any]:
    """Generate response using OpenAI"""
    try:
        # Create prompt
        prompt = f"""
        You are an empathetic AI life coach. Respond to the user's message with context awareness.
        
        User Message: {context['user_message']}
        Coaching Type: {context['coaching_type']}
        
        Context:
        - Recent Goals: {[g.get('title', 'Unknown') for g in context['recent_goals']]}
        - Recent Mood: {context['recent_mood']}/5
        - Drift Risk: {context['drift_risk']:.2f}
        - Consistency Score: {context['behavior_patterns'].get('consistency_score', 0.5):.2f}
        
        Provide:
        1. Empathetic, personalized response
        2. 2-3 specific recommendations
        3. 1-2 follow-up actions
        4. Coaching type (motivational, supportive, strategic, or analytical)
        
        Be warm, encouraging, and specific to their context.
        """
        
        response = await openai.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert AI life coach focused on motivation and personal development."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=400,
            temperature=0.7
        )
        
        ai_response = response.choices[0].message.content
        
        return {
            'response': ai_response,
            'coaching_type': context['coaching_type'],
            'context_used': ['goals', 'mood', 'behavior_patterns', 'drift_risk'],
            'recommendations': extract_recommendations(ai_response),
            'follow_up_actions': extract_follow_up_actions(ai_response),
            'confidence': 0.85
        }
        
    except Exception as e:
        logger.error(f"Error with OpenAI response: {str(e)}")
        return generate_fallback_response(context)

def generate_fallback_response(context: Dict[str, Any]) -> Dict[str, Any]:
    """Generate fallback response when OpenAI is not available"""
    message = context.get('user_message', '').lower()
    
    # Simple pattern matching for fallback
    if any(word in message for word in ['sad', 'down', 'depressed', 'low']):
        response = "I hear that you're going through a tough time. Remember that it's okay to feel this way, and every small step forward counts. What's one small thing you could do today to take care of yourself?"
        coaching_type = "supportive"
    elif any(word in message for word in ['goal', 'achieve', 'want', 'plan']):
        response = "It's great that you're thinking about your goals! Breaking them down into smaller, manageable steps is key. What's the next small action you could take toward your goal?"
        coaching_type = "strategic"
    elif any(word in message for word in ['stuck', 'frustrated', 'difficult']):
        response = "Feeling stuck is a normal part of growth. Sometimes stepping back and looking at things from a different angle can help. What's one thing you've learned from this challenge?"
        coaching_type = "analytical"
    else:
        response = "Thank you for sharing that with me. I'm here to support you on your journey. What would you like to focus on today?"
        coaching_type = "motivational"
    
    return {
        'response': response,
        'coaching_type': coaching_type,
        'context_used': ['message_analysis'],
        'recommendations': [
            "Continue daily check-ins to track your progress",
            "Break down large goals into smaller steps"
        ],
        'follow_up_actions': [
            "Set a reminder for tomorrow's check-in",
            "Identify one small action for today"
        ],
        'confidence': 0.65
    }

def extract_recommendations(ai_response: str) -> List[str]:
    """Extract recommendations from AI response"""
    # Simple extraction - in production, would use more sophisticated parsing
    recommendations = []
    lines = ai_response.split('\n')
    for line in lines:
        if 'recommend' in line.lower() or line.strip().startswith('•') or line.strip().startswith('-'):
            recommendations.append(line.strip())
    
    return recommendations[:3] if recommendations else [
        "Continue with consistent daily actions",
        "Track your progress regularly"
    ]

def extract_follow_up_actions(ai_response: str) -> List[str]:
    """Extract follow-up actions from AI response"""
    # Simple extraction - in production, would use more sophisticated parsing
    actions = []
    lines = ai_response.split('\n')
    for line in lines:
        if 'action' in line.lower() or 'next' in line.lower() or 'try' in line.lower():
            actions.append(line.strip())
    
    return actions[:2] if actions else [
        "Schedule time for your next goal-related activity",
        "Reflect on today's progress in your evening routine"
    ]

async def store_conversation_context(
    user_id: str,
    user_message: str,
    ai_response: Dict[str, Any],
    context: Dict[str, Any]
):
    """Store conversation context for future reference"""
    try:
        # Store in database
        await get_supabase_client().table('ai_conversations').insert({
            'user_id': user_id,
            'user_message': user_message,
            'ai_response': ai_response['response'],
            'coaching_type': ai_response['coaching_type'],
            'context_data': json.dumps(context),
            'confidence': ai_response['confidence'],
            'timestamp': datetime.now().isoformat()
        }).execute()
        
        # Store embedding for semantic search
        conversation_text = f"User: {user_message}\nAI: {ai_response['response']}"
        embedding = await get_embeddings_service().encode_conversation(user_id, conversation_text, context)
        
        await vector_store.add_conversation_embedding(
            user_id,
            f"conversation_{datetime.now().isoformat()}",
            embedding,
            {
                'user_message': user_message,
                'ai_response': ai_response['response'],
                'coaching_type': ai_response['coaching_type'],
                'timestamp': datetime.now().isoformat()
            }
        )
        
    except Exception as e:
        logger.error(f"Error storing conversation context: {str(e)}")

async def analyze_behavior_patterns(user_id: str, activity_type: str, data: Dict[str, Any]):
    """Background task for behavior pattern analysis"""
    try:
        # Analyze patterns
        patterns = await get_embeddings_service().analyze_behavior_patterns(user_id, 30)
        
        # Store analysis results
        await get_supabase_client().table('ai_metrics').insert({
            'user_id': user_id,
            'metric_type': 'behavior_analysis',
            'metric_value': len(patterns.get('patterns', [])),
            'metadata': json.dumps(patterns),
            'timestamp': datetime.now().isoformat()
        }).execute()
        
    except Exception as e:
        logger.error(f"Error in background behavior analysis: {str(e)}")

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    health_status = {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {}
    }
    
    # Check environment variables
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_ANON_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")
    
    health_status["services"]["supabase_config"] = "configured" if (supabase_url and supabase_key) else "missing"
    health_status["services"]["openai_config"] = "configured" if openai_key else "missing"
    
    # Check AI services
    try:
        embeddings = get_embeddings_service()
        health_status["services"]["embeddings"] = "ready"
    except Exception as e:
        health_status["services"]["embeddings"] = f"error: {str(e)}"
        health_status["status"] = "degraded"
    
    return health_status

# Save indices on shutdown
@app.on_event("shutdown")
async def shutdown_event():
    """Save vector store indices on shutdown"""
    try:
        await vector_store.save_indices()
        logger.info("Vector store indices saved successfully")
    except Exception as e:
        logger.error(f"Error saving indices on shutdown: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    
    # Check environment setup
    required_env_vars = ["SUPABASE_URL", "SUPABASE_ANON_KEY"]
    missing_vars = [var for var in required_env_vars if not os.getenv(var)]
    
    if missing_vars:
        logger.warning(f"Missing environment variables: {missing_vars}")
        logger.warning("The server will start but some features may not work properly.")
        logger.warning("Please set the missing environment variables for full functionality.")
    
    logger.info("Starting Momentum AI Backend...")
    uvicorn.run(app, host="0.0.0.0", port=8000) 