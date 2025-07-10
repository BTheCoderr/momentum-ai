import numpy as np
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
import logging
import json
from dataclasses import dataclass
from enum import Enum
from supabase import Client

class RiskLevel(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class InterventionType(Enum):
    NOTIFICATION = "notification"
    COACH_MESSAGE = "coach_message"
    GOAL_ADJUSTMENT = "goal_adjustment"
    SUPPORT_OUTREACH = "support_outreach"
    HABIT_REMINDER = "habit_reminder"

@dataclass
class DriftIndicator:
    name: str
    value: float
    threshold: float
    severity: float
    description: str
    trend: str  # "increasing", "decreasing", "stable"

@dataclass
class Intervention:
    type: InterventionType
    message: str
    urgency: str
    timing: str
    metadata: Dict[str, Any]

class DriftPredictor:
    """
    Advanced drift prediction system that detects when users are losing momentum
    and generates proactive interventions
    """
    
    def __init__(self, supabase_client: Client, behavior_analyzer, vector_store):
        self.supabase = supabase_client
        self.behavior_analyzer = behavior_analyzer
        self.vector_store = vector_store
        
        # Drift thresholds
        self.thresholds = {
            'checkin_frequency': 0.5,    # Check-ins per day
            'goal_progress': 0.3,        # Progress rate
            'mood_decline': 2.5,         # Average mood
            'engagement_drop': 0.4,      # Engagement score
            'consistency_loss': 0.3,     # Consistency score
            'response_delay': 72,        # Hours since last activity
            'pattern_deviation': 0.7     # Deviation from normal pattern
        }
        
        # Intervention templates
        self.intervention_templates = {
            InterventionType.NOTIFICATION: {
                'low': "👋 Hey there! Just checking in - how's your momentum today?",
                'medium': "🌟 I noticed you haven't checked in lately. How are you feeling?",
                'high': "💪 Your streak is important! Let's get back on track together.",
                'critical': "🚨 I'm here for you. Let's reconnect and rebuild your momentum."
            },
            InterventionType.COACH_MESSAGE: {
                'low': "Your consistency has been great! Keep up the momentum.",
                'medium': "I've noticed some changes in your pattern. What's on your mind?",
                'high': "Let's talk about what's been challenging lately. I'm here to help.",
                'critical': "I'm concerned about your recent activity. Can we schedule a check-in?"
            },
            InterventionType.GOAL_ADJUSTMENT: {
                'medium': "Maybe it's time to adjust your goals to better fit your current situation?",
                'high': "Let's revisit your goals and make them more achievable.",
                'critical': "I think we should reset your goals to help you regain momentum."
            },
            InterventionType.SUPPORT_OUTREACH: {
                'high': "Sometimes we all need support. Have you considered talking to someone?",
                'critical': "It might be helpful to reach out to friends, family, or a professional for support."
            },
            InterventionType.HABIT_REMINDER: {
                'low': "🔔 Gentle reminder: Your daily check-in is waiting!",
                'medium': "⏰ It's been a while since your last activity. Ready to jump back in?",
                'high': "📅 Let's rebuild that habit together. Start with just one small action today."
            }
        }
    
    async def predict_drift(self, user_id: str, timeframe_days: int = 7) -> Dict[str, Any]:
        """
        Predict drift probability and generate intervention recommendations
        """
        try:
            # Gather user data
            user_data = await self._gather_user_data(user_id, timeframe_days * 2)  # Get more data for comparison
            
            if not user_data:
                return {
                    "drift_probability": 0.0,
                    "risk_level": RiskLevel.LOW.value,
                    "indicators": [],
                    "interventions": [],
                    "confidence": 0.1
                }
            
            # Calculate drift indicators
            indicators = await self._calculate_drift_indicators(user_data, timeframe_days)
            
            # Calculate overall drift probability
            drift_probability = self._calculate_drift_probability(indicators)
            
            # Determine risk level
            risk_level = self._determine_risk_level(drift_probability, indicators)
            
            # Generate interventions
            interventions = await self._generate_interventions(user_id, risk_level, indicators, user_data)
            
            # Store prediction for tracking
            await self._store_drift_prediction(user_id, drift_probability, risk_level, indicators, interventions)
            
            return {
                "drift_probability": float(drift_probability),
                "risk_level": risk_level.value,
                "indicators": [self._indicator_to_dict(ind) for ind in indicators],
                "interventions": [self._intervention_to_dict(inv) for inv in interventions],
                "confidence": self._calculate_confidence(user_data, indicators),
                "prediction_timestamp": datetime.now().isoformat(),
                "timeframe_days": timeframe_days
            }
            
        except Exception as e:
            logging.error(f"Error predicting drift for user {user_id}: {str(e)}")
            return {
                "drift_probability": 0.0,
                "risk_level": RiskLevel.LOW.value,
                "indicators": [],
                "interventions": [],
                "confidence": 0.0,
                "error": str(e)
            }
    
    async def monitor_real_time_drift(self, user_id: str) -> Dict[str, Any]:
        """
        Real-time drift monitoring for immediate intervention
        """
        try:
            # Get recent activity (last 24 hours)
            recent_data = await self._gather_user_data(user_id, 1)
            
            # Quick drift indicators
            quick_indicators = []
            
            # Check for complete inactivity
            if not recent_data.get('behaviors') and not recent_data.get('checkins'):
                quick_indicators.append(DriftIndicator(
                    name="no_activity_24h",
                    value=1.0,
                    threshold=0.5,
                    severity=0.8,
                    description="No activity in the last 24 hours",
                    trend="increasing"
                ))
            
            # Check for missed check-ins
            checkins = recent_data.get('checkins', [])
            if len(checkins) == 0:
                # Check if user usually checks in daily
                historical_data = await self._gather_user_data(user_id, 7)
                avg_checkins_per_day = len(historical_data.get('checkins', [])) / 7.0
                
                if avg_checkins_per_day > 0.5:  # User usually checks in
                    quick_indicators.append(DriftIndicator(
                        name="missed_checkin",
                        value=1.0,
                        threshold=0.3,
                        severity=0.6,
                        description="Missed expected daily check-in",
                        trend="stable"
                    ))
            
            # Calculate quick drift probability
            if quick_indicators:
                drift_prob = sum(ind.severity for ind in quick_indicators) / len(quick_indicators)
            else:
                drift_prob = 0.0
            
            # Generate immediate interventions if needed
            interventions = []
            if drift_prob > 0.5:
                interventions = await self._generate_immediate_interventions(user_id, quick_indicators)
            
            return {
                "immediate_drift_risk": float(drift_prob),
                "indicators": [self._indicator_to_dict(ind) for ind in quick_indicators],
                "immediate_interventions": [self._intervention_to_dict(inv) for inv in interventions],
                "monitoring_timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logging.error(f"Error in real-time drift monitoring: {str(e)}")
            return {
                "immediate_drift_risk": 0.0,
                "indicators": [],
                "immediate_interventions": [],
                "error": str(e)
            }
    
    async def analyze_drift_trends(self, user_id: str, weeks_back: int = 4) -> Dict[str, Any]:
        """
        Analyze drift trends over time to identify patterns
        """
        try:
            # Get historical drift predictions
            drift_history = await self._get_drift_history(user_id, weeks_back)
            
            if len(drift_history) < 3:
                return {
                    "trend": "insufficient_data",
                    "trend_direction": "stable",
                    "average_drift": 0.0,
                    "risk_periods": [],
                    "recommendations": ["Continue regular check-ins to build trend data"]
                }
            
            # Calculate trend metrics
            drift_scores = [h.get('drift_probability', 0) for h in drift_history]
            
            # Trend direction
            recent_avg = sum(drift_scores[:len(drift_scores)//2]) / max(len(drift_scores)//2, 1)
            older_avg = sum(drift_scores[len(drift_scores)//2:]) / max(len(drift_scores) - len(drift_scores)//2, 1)
            
            if recent_avg > older_avg + 0.1:
                trend_direction = "increasing"
            elif recent_avg < older_avg - 0.1:
                trend_direction = "decreasing"
            else:
                trend_direction = "stable"
            
            # Identify risk periods
            risk_periods = []
            for i, score in enumerate(drift_scores):
                if score > 0.7:
                    risk_periods.append({
                        'period': f"Week {i+1}",
                        'drift_score': score,
                        'severity': 'high' if score > 0.8 else 'medium'
                    })
            
            # Generate trend-based recommendations
            recommendations = self._generate_trend_recommendations(trend_direction, drift_scores, risk_periods)
            
            return {
                "trend": "sufficient_data",
                "trend_direction": trend_direction,
                "average_drift": float(sum(drift_scores) / len(drift_scores)),
                "recent_average": float(recent_avg),
                "historical_average": float(older_avg),
                "risk_periods": risk_periods,
                "total_predictions": len(drift_history),
                "recommendations": recommendations,
                "analysis_timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logging.error(f"Error analyzing drift trends: {str(e)}")
            return {
                "trend": "error",
                "error": str(e)
            }
    
    async def _calculate_drift_indicators(self, user_data: Dict[str, Any], timeframe_days: int) -> List[DriftIndicator]:
        """
        Calculate various drift indicators from user data
        """
        indicators = []
        
        try:
            # 1. Check-in frequency indicator
            checkins = user_data.get('checkins', [])
            recent_checkins = [c for c in checkins if self._is_recent(c.get('created_at'), timeframe_days)]
            checkin_frequency = len(recent_checkins) / timeframe_days
            
            indicators.append(DriftIndicator(
                name="checkin_frequency",
                value=checkin_frequency,
                threshold=self.thresholds['checkin_frequency'],
                severity=max(0, (self.thresholds['checkin_frequency'] - checkin_frequency) / self.thresholds['checkin_frequency']),
                description=f"Check-in frequency: {checkin_frequency:.2f} per day",
                trend=self._calculate_trend(checkins, 'created_at', timeframe_days)
            ))
            
            # 2. Mood decline indicator
            if recent_checkins:
                recent_moods = [c.get('mood', 3) for c in recent_checkins]
                avg_mood = sum(recent_moods) / len(recent_moods)
                
                indicators.append(DriftIndicator(
                    name="mood_decline",
                    value=avg_mood,
                    threshold=self.thresholds['mood_decline'],
                    severity=max(0, (self.thresholds['mood_decline'] - avg_mood) / self.thresholds['mood_decline']),
                    description=f"Average mood: {avg_mood:.1f}/5",
                    trend=self._calculate_mood_trend(recent_checkins)
                ))
            
            # 3. Activity engagement indicator
            behaviors = user_data.get('behaviors', [])
            recent_behaviors = [b for b in behaviors if self._is_recent(b.get('timestamp'), timeframe_days)]
            
            engagement_score = len(recent_behaviors) / max(timeframe_days * 2, 1)  # Expected 2 activities per day
            
            indicators.append(DriftIndicator(
                name="engagement_drop",
                value=engagement_score,
                threshold=self.thresholds['engagement_drop'],
                severity=max(0, (self.thresholds['engagement_drop'] - engagement_score) / self.thresholds['engagement_drop']),
                description=f"Activity engagement: {engagement_score:.2f}",
                trend=self._calculate_trend(behaviors, 'timestamp', timeframe_days)
            ))
            
            # 4. Goal progress indicator
            goals = user_data.get('goals', [])
            active_goals = [g for g in goals if not g.get('completed', False)]
            
            if active_goals:
                # Simplified progress calculation
                progress_scores = []
                for goal in active_goals:
                    created_date = goal.get('created_at')
                    if created_date:
                        days_since_creation = (datetime.now() - datetime.fromisoformat(created_date.replace('Z', '+00:00'))).days
                        expected_progress = min(days_since_creation / 30.0, 1.0)  # 30 days to complete
                        actual_progress = goal.get('progress', 0) / 100.0
                        progress_scores.append(actual_progress / max(expected_progress, 0.1))
                
                if progress_scores:
                    avg_progress_rate = sum(progress_scores) / len(progress_scores)
                    
                    indicators.append(DriftIndicator(
                        name="goal_progress",
                        value=avg_progress_rate,
                        threshold=self.thresholds['goal_progress'],
                        severity=max(0, (self.thresholds['goal_progress'] - avg_progress_rate) / self.thresholds['goal_progress']),
                        description=f"Goal progress rate: {avg_progress_rate:.2f}",
                        trend="stable"  # Would need historical data for trend
                    ))
            
            # 5. Response delay indicator
            all_activities = checkins + behaviors
            if all_activities:
                # Get the most recent activity
                recent_activity = max(all_activities, key=lambda x: x.get('created_at') or x.get('timestamp', ''))
                last_activity_time = recent_activity.get('created_at') or recent_activity.get('timestamp')
                
                if last_activity_time:
                    hours_since_last = (datetime.now() - datetime.fromisoformat(last_activity_time.replace('Z', '+00:00'))).total_seconds() / 3600
                    
                    indicators.append(DriftIndicator(
                        name="response_delay",
                        value=hours_since_last,
                        threshold=self.thresholds['response_delay'],
                        severity=min(1.0, hours_since_last / self.thresholds['response_delay']),
                        description=f"Hours since last activity: {hours_since_last:.1f}",
                        trend="increasing" if hours_since_last > 24 else "stable"
                    ))
            
            # 6. Pattern deviation indicator (using vector store if available)
            try:
                patterns = await self.vector_store.get_user_behavior_patterns(user_id)
                if patterns and patterns.get('patterns'):
                    consistency_score = patterns['patterns'].get('consistency_score', 1.0)
                    pattern_deviation = 1.0 - consistency_score
                    
                    indicators.append(DriftIndicator(
                        name="pattern_deviation",
                        value=pattern_deviation,
                        threshold=self.thresholds['pattern_deviation'],
                        severity=pattern_deviation,
                        description=f"Behavior pattern deviation: {pattern_deviation:.2f}",
                        trend="stable"
                    ))
            except Exception as e:
                logging.warning(f"Could not calculate pattern deviation: {str(e)}")
            
            return indicators
            
        except Exception as e:
            logging.error(f"Error calculating drift indicators: {str(e)}")
            return []
    
    def _calculate_drift_probability(self, indicators: List[DriftIndicator]) -> float:
        """
        Calculate overall drift probability from indicators
        """
        if not indicators:
            return 0.0
        
        # Weighted average of severity scores
        weights = {
            'checkin_frequency': 0.25,
            'mood_decline': 0.20,
            'engagement_drop': 0.20,
            'goal_progress': 0.15,
            'response_delay': 0.10,
            'pattern_deviation': 0.10
        }
        
        total_weight = 0
        weighted_severity = 0
        
        for indicator in indicators:
            weight = weights.get(indicator.name, 0.1)
            weighted_severity += indicator.severity * weight
            total_weight += weight
        
        if total_weight == 0:
            return 0.0
        
        return min(1.0, weighted_severity / total_weight)
    
    def _determine_risk_level(self, drift_probability: float, indicators: List[DriftIndicator]) -> RiskLevel:
        """
        Determine risk level based on drift probability and indicators
        """
        # Check for critical indicators
        critical_indicators = [ind for ind in indicators if ind.severity > 0.8]
        high_severity_count = len([ind for ind in indicators if ind.severity > 0.6])
        
        if drift_probability > 0.8 or len(critical_indicators) >= 2:
            return RiskLevel.CRITICAL
        elif drift_probability > 0.6 or high_severity_count >= 3:
            return RiskLevel.HIGH
        elif drift_probability > 0.4 or high_severity_count >= 1:
            return RiskLevel.MEDIUM
        else:
            return RiskLevel.LOW
    
    async def _generate_interventions(self, user_id: str, risk_level: RiskLevel, indicators: List[DriftIndicator], user_data: Dict[str, Any]) -> List[Intervention]:
        """
        Generate appropriate interventions based on risk level and indicators
        """
        interventions = []
        
        try:
            # Get user context for personalization
            user_context = await self._get_user_context(user_data)
            
            if risk_level == RiskLevel.LOW:
                # Gentle encouragement
                interventions.append(Intervention(
                    type=InterventionType.NOTIFICATION,
                    message=self._personalize_message(self.intervention_templates[InterventionType.NOTIFICATION]['low'], user_context),
                    urgency="low",
                    timing="next_session",
                    metadata={"context": "encouragement"}
                ))
            
            elif risk_level == RiskLevel.MEDIUM:
                # Check-in reminder and gentle coaching
                interventions.append(Intervention(
                    type=InterventionType.HABIT_REMINDER,
                    message=self._personalize_message(self.intervention_templates[InterventionType.HABIT_REMINDER]['medium'], user_context),
                    urgency="medium",
                    timing="within_24h",
                    metadata={"context": "habit_building"}
                ))
                
                interventions.append(Intervention(
                    type=InterventionType.COACH_MESSAGE,
                    message=self._personalize_message(self.intervention_templates[InterventionType.COACH_MESSAGE]['medium'], user_context),
                    urgency="medium",
                    timing="within_48h",
                    metadata={"context": "check_in"}
                ))
            
            elif risk_level == RiskLevel.HIGH:
                # Multiple interventions
                interventions.append(Intervention(
                    type=InterventionType.COACH_MESSAGE,
                    message=self._personalize_message(self.intervention_templates[InterventionType.COACH_MESSAGE]['high'], user_context),
                    urgency="high",
                    timing="within_12h",
                    metadata={"context": "support"}
                ))
                
                interventions.append(Intervention(
                    type=InterventionType.GOAL_ADJUSTMENT,
                    message=self._personalize_message(self.intervention_templates[InterventionType.GOAL_ADJUSTMENT]['high'], user_context),
                    urgency="high",
                    timing="within_24h",
                    metadata={"context": "goal_revision"}
                ))
                
                # Check for mood-related indicators
                mood_indicators = [ind for ind in indicators if ind.name == "mood_decline" and ind.severity > 0.6]
                if mood_indicators:
                    interventions.append(Intervention(
                        type=InterventionType.SUPPORT_OUTREACH,
                        message=self._personalize_message(self.intervention_templates[InterventionType.SUPPORT_OUTREACH]['high'], user_context),
                        urgency="high",
                        timing="within_24h",
                        metadata={"context": "mood_support"}
                    ))
            
            elif risk_level == RiskLevel.CRITICAL:
                # Immediate and comprehensive intervention
                interventions.append(Intervention(
                    type=InterventionType.NOTIFICATION,
                    message=self._personalize_message(self.intervention_templates[InterventionType.NOTIFICATION]['critical'], user_context),
                    urgency="critical",
                    timing="immediate",
                    metadata={"context": "crisis_support"}
                ))
                
                interventions.append(Intervention(
                    type=InterventionType.COACH_MESSAGE,
                    message=self._personalize_message(self.intervention_templates[InterventionType.COACH_MESSAGE]['critical'], user_context),
                    urgency="critical",
                    timing="immediate",
                    metadata={"context": "urgent_support"}
                ))
                
                interventions.append(Intervention(
                    type=InterventionType.GOAL_ADJUSTMENT,
                    message=self._personalize_message(self.intervention_templates[InterventionType.GOAL_ADJUSTMENT]['critical'], user_context),
                    urgency="critical",
                    timing="within_6h",
                    metadata={"context": "goal_reset"}
                ))
                
                interventions.append(Intervention(
                    type=InterventionType.SUPPORT_OUTREACH,
                    message=self._personalize_message(self.intervention_templates[InterventionType.SUPPORT_OUTREACH]['critical'], user_context),
                    urgency="critical",
                    timing="within_12h",
                    metadata={"context": "professional_support"}
                ))
            
            return interventions
            
        except Exception as e:
            logging.error(f"Error generating interventions: {str(e)}")
            return []
    
    # Helper methods
    async def _gather_user_data(self, user_id: str, days_back: int) -> Dict[str, Any]:
        """Gather user data for analysis"""
        try:
            cutoff_date = datetime.now() - timedelta(days=days_back)
            
            # Get behaviors
            behaviors_response = await self.supabase.table('behavior_data').select('*').eq('user_id', user_id).gte('timestamp', cutoff_date.isoformat()).order('timestamp', desc=True).execute()
            
            # Get check-ins
            checkins_response = await self.supabase.table('checkins').select('*').eq('user_id', user_id).gte('created_at', cutoff_date.isoformat()).order('created_at', desc=True).execute()
            
            # Get goals
            goals_response = await self.supabase.table('goals').select('*').eq('user_id', user_id).execute()
            
            return {
                'behaviors': behaviors_response.data or [],
                'checkins': checkins_response.data or [],
                'goals': goals_response.data or []
            }
            
        except Exception as e:
            logging.error(f"Error gathering user data: {str(e)}")
            return {}
    
    def _is_recent(self, timestamp_str: str, days: int) -> bool:
        """Check if timestamp is within recent days"""
        try:
            if not timestamp_str:
                return False
            
            timestamp = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
            cutoff = datetime.now() - timedelta(days=days)
            return timestamp >= cutoff
            
        except Exception:
            return False
    
    def _calculate_trend(self, data: List[Dict[str, Any]], timestamp_field: str, timeframe_days: int) -> str:
        """Calculate trend direction for data points"""
        try:
            if len(data) < 4:
                return "stable"
            
            # Split data into recent and older halves
            mid_point = len(data) // 2
            recent_data = data[:mid_point]
            older_data = data[mid_point:]
            
            recent_rate = len(recent_data) / max(timeframe_days / 2, 1)
            older_rate = len(older_data) / max(timeframe_days / 2, 1)
            
            if recent_rate > older_rate * 1.2:
                return "increasing"
            elif recent_rate < older_rate * 0.8:
                return "decreasing"
            else:
                return "stable"
                
        except Exception:
            return "stable"
    
    def _calculate_mood_trend(self, checkins: List[Dict[str, Any]]) -> str:
        """Calculate mood trend"""
        try:
            if len(checkins) < 3:
                return "stable"
            
            moods = [c.get('mood', 3) for c in checkins]
            recent_avg = sum(moods[:len(moods)//2]) / max(len(moods)//2, 1)
            older_avg = sum(moods[len(moods)//2:]) / max(len(moods) - len(moods)//2, 1)
            
            if recent_avg > older_avg + 0.5:
                return "increasing"
            elif recent_avg < older_avg - 0.5:
                return "decreasing"
            else:
                return "stable"
                
        except Exception:
            return "stable"
    
    def _calculate_confidence(self, user_data: Dict[str, Any], indicators: List[DriftIndicator]) -> float:
        """Calculate confidence in drift prediction"""
        try:
            # Base confidence on amount of data
            total_data_points = (
                len(user_data.get('behaviors', [])) +
                len(user_data.get('checkins', [])) +
                len(user_data.get('goals', []))
            )
            
            data_confidence = min(total_data_points / 30.0, 1.0)
            
            # Bonus for variety of indicators
            indicator_variety = len(indicators) / 6.0  # Max 6 indicator types
            
            # Penalty for missing critical indicators
            critical_indicators = ['checkin_frequency', 'mood_decline', 'engagement_drop']
            missing_critical = len([name for name in critical_indicators if not any(ind.name == name for ind in indicators)])
            critical_penalty = missing_critical * 0.1
            
            confidence = max(0.1, min(1.0, data_confidence * 0.7 + indicator_variety * 0.3 - critical_penalty))
            
            return confidence
            
        except Exception:
            return 0.5
    
    async def _store_drift_prediction(self, user_id: str, drift_probability: float, risk_level: RiskLevel, indicators: List[DriftIndicator], interventions: List[Intervention]):
        """Store drift prediction in database"""
        try:
            await self.supabase.table('drift_predictions').insert({
                'user_id': user_id,
                'drift_probability': drift_probability,
                'risk_level': risk_level.value,
                'interventions': json.dumps([self._intervention_to_dict(inv) for inv in interventions]),
                'confidence': self._calculate_confidence({'behaviors': [], 'checkins': [], 'goals': []}, indicators),
                'timeframe': 7,
                'created_at': datetime.now().isoformat()
            }).execute()
            
        except Exception as e:
            logging.error(f"Error storing drift prediction: {str(e)}")
    
    async def _get_drift_history(self, user_id: str, weeks_back: int) -> List[Dict[str, Any]]:
        """Get historical drift predictions"""
        try:
            cutoff_date = datetime.now() - timedelta(weeks=weeks_back)
            
            response = await self.supabase.table('drift_predictions').select('*').eq('user_id', user_id).gte('created_at', cutoff_date.isoformat()).order('created_at', desc=True).execute()
            
            return response.data or []
            
        except Exception as e:
            logging.error(f"Error getting drift history: {str(e)}")
            return []
    
    def _indicator_to_dict(self, indicator: DriftIndicator) -> Dict[str, Any]:
        """Convert DriftIndicator to dictionary"""
        return {
            'name': indicator.name,
            'value': indicator.value,
            'threshold': indicator.threshold,
            'severity': indicator.severity,
            'description': indicator.description,
            'trend': indicator.trend
        }
    
    def _intervention_to_dict(self, intervention: Intervention) -> Dict[str, Any]:
        """Convert Intervention to dictionary"""
        return {
            'type': intervention.type.value,
            'message': intervention.message,
            'urgency': intervention.urgency,
            'timing': intervention.timing,
            'metadata': intervention.metadata
        }
    
    async def _generate_immediate_interventions(self, user_id: str, indicators: List[DriftIndicator]) -> List[Intervention]:
        """Generate immediate interventions for real-time monitoring"""
        interventions = []
        
        for indicator in indicators:
            if indicator.name == "no_activity_24h":
                interventions.append(Intervention(
                    type=InterventionType.NOTIFICATION,
                    message="👋 We miss you! How's your day going?",
                    urgency="medium",
                    timing="immediate",
                    metadata={"trigger": "no_activity", "immediate": True}
                ))
            
            elif indicator.name == "missed_checkin":
                interventions.append(Intervention(
                    type=InterventionType.HABIT_REMINDER,
                    message="🔔 Your daily check-in is ready! How are you feeling today?",
                    urgency="low",
                    timing="immediate",
                    metadata={"trigger": "missed_checkin", "immediate": True}
                ))
        
        return interventions
    
    async def _get_user_context(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Get user context for message personalization"""
        context = {}
        
        # Recent goals
        goals = user_data.get('goals', [])
        active_goals = [g for g in goals if not g.get('completed', False)]
        if active_goals:
            context['current_goal'] = active_goals[0].get('title', 'your goal')
        
        # Recent mood
        checkins = user_data.get('checkins', [])
        if checkins:
            recent_mood = checkins[0].get('mood', 3)
            context['recent_mood'] = recent_mood
        
        # Activity level
        behaviors = user_data.get('behaviors', [])
        context['activity_level'] = 'high' if len(behaviors) > 10 else 'moderate' if len(behaviors) > 5 else 'low'
        
        return context
    
    def _personalize_message(self, template: str, context: Dict[str, Any]) -> str:
        """Personalize intervention message with user context"""
        message = template
        
        # Simple personalization based on context
        if 'current_goal' in context:
            message = message.replace('your goals', f'your goal: {context["current_goal"]}')
        
        if 'recent_mood' in context:
            if context['recent_mood'] <= 2:
                message += " Remember, it's okay to have tough days."
            elif context['recent_mood'] >= 4:
                message += " Your positive energy is inspiring!"
        
        return message
    
    def _generate_trend_recommendations(self, trend_direction: str, drift_scores: List[float], risk_periods: List[Dict[str, Any]]) -> List[str]:
        """Generate recommendations based on drift trends"""
        recommendations = []
        
        if trend_direction == "increasing":
            recommendations.append("Your drift risk has been increasing. Let's identify what's changed recently.")
            recommendations.append("Consider returning to activities that worked well for you in the past.")
        
        elif trend_direction == "decreasing":
            recommendations.append("Great! Your momentum is improving. Keep up whatever you're doing differently.")
            recommendations.append("Document what strategies are working so you can repeat them.")
        
        else:  # stable
            if sum(drift_scores) / len(drift_scores) > 0.5:
                recommendations.append("Your drift risk remains elevated. Let's make some adjustments to your approach.")
            else:
                recommendations.append("You're maintaining good momentum. Consider gradually increasing your goals.")
        
        if len(risk_periods) > len(drift_scores) / 2:
            recommendations.append("You've had several high-risk periods. Let's identify triggers and create a prevention plan.")
        
        return recommendations or ["Continue monitoring your patterns and maintain regular check-ins."] 