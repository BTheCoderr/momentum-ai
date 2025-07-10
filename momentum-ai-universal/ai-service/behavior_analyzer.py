import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
import logging
import json
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, mean_squared_error
import joblib
import os
from supabase import Client

class BehaviorAnalyzer:
    """
    Advanced behavior analysis system that learns from user patterns
    and predicts outcomes using machine learning
    """
    
    def __init__(self, supabase_client: Client, embeddings_service, vector_store):
        self.supabase = supabase_client
        self.embeddings_service = embeddings_service
        self.vector_store = vector_store
        
        # ML models
        self.success_predictor = RandomForestClassifier(n_estimators=100, random_state=42)
        self.mood_predictor = RandomForestRegressor(n_estimators=100, random_state=42)
        self.engagement_predictor = RandomForestClassifier(n_estimators=100, random_state=42)
        
        # Scalers
        self.scaler = StandardScaler()
        
        # Model paths
        self.model_dir = os.path.join(os.getcwd(), 'models')
        os.makedirs(self.model_dir, exist_ok=True)
        
        # Load existing models
        self._load_models()
    
    async def analyze_user_behavior(self, user_id: str, days_back: int = 30) -> Dict[str, Any]:
        """
        Comprehensive behavior analysis for a user
        """
        try:
            # Gather user data
            user_data = await self._gather_user_data(user_id, days_back)
            
            if not user_data or len(user_data.get('behaviors', [])) < 5:
                return {
                    "analysis": "Insufficient data for comprehensive analysis",
                    "recommendations": ["Continue daily check-ins to build your behavior profile"],
                    "confidence": 0.1
                }
            
            # Analyze patterns
            behavior_patterns = await self._analyze_behavior_patterns(user_data)
            
            # Predict outcomes
            predictions = await self._predict_outcomes(user_data)
            
            # Generate insights
            insights = await self._generate_behavioral_insights(user_data, behavior_patterns, predictions)
            
            # Calculate risk factors
            risk_factors = await self._calculate_risk_factors(user_data, behavior_patterns)
            
            # Generate recommendations
            recommendations = await self._generate_recommendations(user_data, behavior_patterns, predictions, risk_factors)
            
            return {
                "analysis": {
                    "behavior_patterns": behavior_patterns,
                    "predictions": predictions,
                    "risk_factors": risk_factors,
                    "total_behaviors": len(user_data.get('behaviors', []))
                },
                "insights": insights,
                "recommendations": recommendations,
                "confidence": self._calculate_confidence(user_data),
                "last_analyzed": datetime.now().isoformat()
            }
            
        except Exception as e:
            logging.error(f"Error analyzing user behavior: {str(e)}")
            return {
                "analysis": "Error occurred during analysis",
                "recommendations": ["Please try again later"],
                "confidence": 0.0
            }
    
    async def predict_success_probability(self, user_id: str, goal_data: Dict[str, Any]) -> float:
        """
        Predict the probability of success for a specific goal
        """
        try:
            # Gather user historical data
            user_data = await self._gather_user_data(user_id, 60)
            
            if not user_data:
                return 0.5  # Default probability
            
            # Extract features for prediction
            features = self._extract_goal_features(user_data, goal_data)
            
            # Make prediction
            if hasattr(self.success_predictor, 'predict_proba'):
                try:
                    features_scaled = self.scaler.transform([features])
                    probability = self.success_predictor.predict_proba(features_scaled)[0][1]
                    return float(probability)
                except:
                    # Fallback to heuristic calculation
                    return self._calculate_heuristic_success_probability(user_data, goal_data)
            
            return self._calculate_heuristic_success_probability(user_data, goal_data)
            
        except Exception as e:
            logging.error(f"Error predicting success probability: {str(e)}")
            return 0.5
    
    async def predict_mood_trend(self, user_id: str, days_ahead: int = 7) -> Dict[str, Any]:
        """
        Predict mood trend for the next few days
        """
        try:
            # Gather user data
            user_data = await self._gather_user_data(user_id, 30)
            
            if not user_data or len(user_data.get('checkins', [])) < 7:
                return {
                    "trend": "stable",
                    "predicted_mood": 3.0,
                    "confidence": 0.2,
                    "factors": ["Insufficient data for prediction"]
                }
            
            # Extract mood features
            mood_features = self._extract_mood_features(user_data)
            
            # Make prediction
            try:
                features_scaled = self.scaler.transform([mood_features])
                predicted_mood = self.mood_predictor.predict(features_scaled)[0]
                
                # Determine trend
                recent_moods = [c.get('mood', 3) for c in user_data['checkins'][-7:]]
                avg_recent_mood = sum(recent_moods) / len(recent_moods)
                
                if predicted_mood > avg_recent_mood + 0.5:
                    trend = "improving"
                elif predicted_mood < avg_recent_mood - 0.5:
                    trend = "declining"
                else:
                    trend = "stable"
                
                return {
                    "trend": trend,
                    "predicted_mood": float(predicted_mood),
                    "current_avg": float(avg_recent_mood),
                    "confidence": 0.75,
                    "factors": self._identify_mood_factors(user_data)
                }
                
            except:
                # Fallback to trend analysis
                return self._analyze_mood_trend_fallback(user_data)
            
        except Exception as e:
            logging.error(f"Error predicting mood trend: {str(e)}")
            return {
                "trend": "stable",
                "predicted_mood": 3.0,
                "confidence": 0.1,
                "factors": ["Error in prediction"]
            }
    
    async def detect_behavior_anomalies(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Detect anomalies in user behavior patterns
        """
        try:
            # Get user behavior patterns from vector store
            patterns = await self.vector_store.get_user_behavior_patterns(user_id)
            
            if not patterns or patterns.get('total_behaviors', 0) < 10:
                return []
            
            # Gather recent behavior data
            user_data = await self._gather_user_data(user_id, 14)
            
            # Detect anomalies
            anomalies = []
            
            # Check for unusual activity patterns
            if user_data.get('behaviors'):
                recent_activities = [b.get('activity_type') for b in user_data['behaviors'][-7:]]
                activity_counts = {}
                for activity in recent_activities:
                    activity_counts[activity] = activity_counts.get(activity, 0) + 1
                
                # Check for sudden changes
                if 'checkin' in activity_counts and activity_counts['checkin'] == 0:
                    anomalies.append({
                        'type': 'missing_checkins',
                        'severity': 'high',
                        'description': 'No check-ins in the last 7 days',
                        'recommendation': 'Resume daily check-ins to maintain momentum'
                    })
                
                # Check for unusual goal activity
                if 'goal_created' in activity_counts and activity_counts['goal_created'] > 3:
                    anomalies.append({
                        'type': 'excessive_goal_creation',
                        'severity': 'medium',
                        'description': 'Created many goals recently',
                        'recommendation': 'Focus on completing existing goals before creating new ones'
                    })
            
            # Check mood anomalies
            if user_data.get('checkins'):
                recent_moods = [c.get('mood', 3) for c in user_data['checkins'][-7:]]
                if recent_moods:
                    avg_mood = sum(recent_moods) / len(recent_moods)
                    if avg_mood < 2.0:
                        anomalies.append({
                            'type': 'low_mood_pattern',
                            'severity': 'high',
                            'description': 'Consistently low mood scores',
                            'recommendation': 'Consider reaching out for support or adjusting your goals'
                        })
            
            return anomalies
            
        except Exception as e:
            logging.error(f"Error detecting behavior anomalies: {str(e)}")
            return []
    
    async def learn_from_outcomes(self, user_id: str, goal_id: str, outcome: str, context: Dict[str, Any]):
        """
        Learn from goal outcomes to improve future predictions
        """
        try:
            # Gather user data at the time of goal completion
            user_data = await self._gather_user_data(user_id, 60)
            
            if not user_data:
                return
            
            # Extract features
            features = self._extract_goal_features(user_data, context)
            
            # Convert outcome to binary (success/failure)
            success = 1 if outcome in ['completed', 'achieved', 'success'] else 0
            
            # Store training data
            training_data = {
                'user_id': user_id,
                'goal_id': goal_id,
                'features': features,
                'outcome': success,
                'timestamp': datetime.now().isoformat(),
                'context': context
            }
            
            # Save to database for future training
            await self._store_training_data(training_data)
            
            # Retrain models if we have enough new data
            await self._retrain_models_if_needed()
            
        except Exception as e:
            logging.error(f"Error learning from outcomes: {str(e)}")
    
    async def generate_personalized_strategies(self, user_id: str, goal_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Generate personalized strategies based on user behavior patterns
        """
        try:
            # Analyze user behavior
            behavior_analysis = await self.analyze_user_behavior(user_id)
            
            # Get success probability
            success_prob = await self.predict_success_probability(user_id, goal_data)
            
            # Generate strategies based on analysis
            strategies = []
            
            # Strategy based on success probability
            if success_prob > 0.7:
                strategies.append({
                    'id': 'maintain_momentum',
                    'title': 'Maintain Your Momentum',
                    'description': 'You have a high success probability. Keep doing what you\'re doing!',
                    'priority': 'high',
                    'actions': [
                        'Continue your daily check-ins',
                        'Monitor your progress weekly',
                        'Celebrate small wins'
                    ]
                })
            elif success_prob < 0.4:
                strategies.append({
                    'id': 'build_foundation',
                    'title': 'Build a Strong Foundation',
                    'description': 'Let\'s establish consistent habits before tackling bigger goals.',
                    'priority': 'high',
                    'actions': [
                        'Start with smaller, achievable goals',
                        'Focus on daily consistency',
                        'Track your habits regularly'
                    ]
                })
            
            # Strategy based on behavior patterns
            patterns = behavior_analysis.get('analysis', {}).get('behavior_patterns', {})
            
            if patterns.get('consistency_score', 0) < 0.5:
                strategies.append({
                    'id': 'improve_consistency',
                    'title': 'Improve Consistency',
                    'description': 'Your behavior patterns show room for improvement in consistency.',
                    'priority': 'medium',
                    'actions': [
                        'Set daily reminders',
                        'Create a routine',
                        'Track your daily activities'
                    ]
                })
            
            # Strategy based on mood trends
            mood_prediction = await self.predict_mood_trend(user_id)
            
            if mood_prediction.get('trend') == 'declining':
                strategies.append({
                    'id': 'mood_support',
                    'title': 'Mood Support Strategy',
                    'description': 'Your mood trend suggests you might benefit from additional support.',
                    'priority': 'high',
                    'actions': [
                        'Practice daily gratitude',
                        'Engage in activities you enjoy',
                        'Consider talking to someone you trust'
                    ]
                })
            
            return strategies
            
        except Exception as e:
            logging.error(f"Error generating personalized strategies: {str(e)}")
            return []
    
    # Private helper methods
    async def _gather_user_data(self, user_id: str, days_back: int) -> Dict[str, Any]:
        """Gather comprehensive user data"""
        try:
            cutoff_date = datetime.now() - timedelta(days=days_back)
            
            # Get behaviors
            behaviors_response = await self.supabase.table('behavior_data').select('*').eq('user_id', user_id).gte('timestamp', cutoff_date.isoformat()).order('timestamp', desc=True).execute()
            
            # Get check-ins
            checkins_response = await self.supabase.table('checkins').select('*').eq('user_id', user_id).gte('created_at', cutoff_date.isoformat()).order('created_at', desc=True).execute()
            
            # Get goals
            goals_response = await self.supabase.table('goals').select('*').eq('user_id', user_id).gte('created_at', cutoff_date.isoformat()).order('created_at', desc=True).execute()
            
            # Get messages
            messages_response = await self.supabase.table('messages').select('*').eq('user_id', user_id).gte('timestamp', cutoff_date.isoformat()).order('timestamp', desc=True).execute()
            
            return {
                'behaviors': behaviors_response.data or [],
                'checkins': checkins_response.data or [],
                'goals': goals_response.data or [],
                'messages': messages_response.data or []
            }
            
        except Exception as e:
            logging.error(f"Error gathering user data: {str(e)}")
            return {}
    
    async def _analyze_behavior_patterns(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze behavior patterns from user data"""
        try:
            behaviors = user_data.get('behaviors', [])
            checkins = user_data.get('checkins', [])
            
            if not behaviors and not checkins:
                return {}
            
            # Analyze activity frequency
            activity_counts = {}
            for behavior in behaviors:
                activity_type = behavior.get('activity_type', 'unknown')
                activity_counts[activity_type] = activity_counts.get(activity_type, 0) + 1
            
            # Analyze check-in patterns
            checkin_pattern = self._analyze_checkin_patterns(checkins)
            
            # Analyze temporal patterns
            temporal_pattern = self._analyze_temporal_patterns(behaviors + checkins)
            
            return {
                'activity_distribution': activity_counts,
                'checkin_pattern': checkin_pattern,
                'temporal_pattern': temporal_pattern,
                'total_activities': len(behaviors),
                'consistency_score': self._calculate_consistency_score(behaviors, checkins)
            }
            
        except Exception as e:
            logging.error(f"Error analyzing behavior patterns: {str(e)}")
            return {}
    
    async def _predict_outcomes(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Predict various outcomes based on user data"""
        try:
            # Predict engagement level
            engagement_score = self._calculate_engagement_score(user_data)
            
            # Predict goal completion probability
            goal_completion_prob = self._predict_goal_completion(user_data)
            
            # Predict streak continuation
            streak_continuation_prob = self._predict_streak_continuation(user_data)
            
            return {
                'engagement_score': engagement_score,
                'goal_completion_probability': goal_completion_prob,
                'streak_continuation_probability': streak_continuation_prob
            }
            
        except Exception as e:
            logging.error(f"Error predicting outcomes: {str(e)}")
            return {}
    
    def _extract_goal_features(self, user_data: Dict[str, Any], goal_data: Dict[str, Any]) -> List[float]:
        """Extract features for goal success prediction"""
        features = []
        
        # User activity features
        behaviors = user_data.get('behaviors', [])
        checkins = user_data.get('checkins', [])
        
        # Feature 1: Activity frequency
        features.append(len(behaviors) / 30.0)  # Normalize to per-day
        
        # Feature 2: Check-in frequency
        features.append(len(checkins) / 30.0)
        
        # Feature 3: Average mood
        moods = [c.get('mood', 3) for c in checkins]
        avg_mood = sum(moods) / len(moods) if moods else 3.0
        features.append(avg_mood / 5.0)  # Normalize to 0-1
        
        # Feature 4: Goal complexity (heuristic)
        goal_title = goal_data.get('title', '')
        complexity = min(len(goal_title.split()) / 10.0, 1.0)
        features.append(complexity)
        
        # Feature 5: Historical goal completion rate
        goals = user_data.get('goals', [])
        completed_goals = [g for g in goals if g.get('completed', False)]
        completion_rate = len(completed_goals) / len(goals) if goals else 0.5
        features.append(completion_rate)
        
        # Feature 6: Consistency score
        consistency = self._calculate_consistency_score(behaviors, checkins)
        features.append(consistency)
        
        # Feature 7: Engagement score
        engagement = self._calculate_engagement_score(user_data)
        features.append(engagement)
        
        # Feature 8: Days since last activity
        if behaviors:
            last_activity = max(behaviors, key=lambda x: x.get('timestamp', ''))
            days_since = (datetime.now() - datetime.fromisoformat(last_activity['timestamp'].replace('Z', '+00:00'))).days
            features.append(min(days_since / 7.0, 1.0))  # Normalize to weeks
        else:
            features.append(1.0)
        
        return features
    
    def _calculate_heuristic_success_probability(self, user_data: Dict[str, Any], goal_data: Dict[str, Any]) -> float:
        """Calculate success probability using heuristic approach"""
        try:
            # Base probability
            base_prob = 0.5
            
            # Adjust based on check-in frequency
            checkins = user_data.get('checkins', [])
            if len(checkins) >= 7:  # Regular check-ins
                base_prob += 0.2
            elif len(checkins) >= 3:
                base_prob += 0.1
            
            # Adjust based on mood
            if checkins:
                avg_mood = sum(c.get('mood', 3) for c in checkins) / len(checkins)
                if avg_mood >= 4:
                    base_prob += 0.2
                elif avg_mood <= 2:
                    base_prob -= 0.2
            
            # Adjust based on previous goal completion
            goals = user_data.get('goals', [])
            if goals:
                completed = [g for g in goals if g.get('completed', False)]
                completion_rate = len(completed) / len(goals)
                base_prob += (completion_rate - 0.5) * 0.4
            
            return max(0.0, min(1.0, base_prob))
            
        except Exception as e:
            logging.error(f"Error calculating heuristic success probability: {str(e)}")
            return 0.5
    
    def _analyze_checkin_patterns(self, checkins: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze check-in patterns"""
        if not checkins:
            return {}
        
        # Calculate frequency
        if len(checkins) > 1:
            first_checkin = datetime.fromisoformat(checkins[-1]['created_at'].replace('Z', '+00:00'))
            last_checkin = datetime.fromisoformat(checkins[0]['created_at'].replace('Z', '+00:00'))
            days_span = (last_checkin - first_checkin).days
            frequency = len(checkins) / max(days_span, 1)
        else:
            frequency = 1.0
        
        # Calculate mood trend
        moods = [c.get('mood', 3) for c in checkins]
        mood_trend = 'stable'
        if len(moods) > 2:
            recent_avg = sum(moods[:3]) / 3
            older_avg = sum(moods[-3:]) / 3
            if recent_avg > older_avg + 0.5:
                mood_trend = 'improving'
            elif recent_avg < older_avg - 0.5:
                mood_trend = 'declining'
        
        return {
            'frequency': frequency,
            'mood_trend': mood_trend,
            'average_mood': sum(moods) / len(moods),
            'total_checkins': len(checkins)
        }
    
    def _analyze_temporal_patterns(self, activities: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze temporal patterns in activities"""
        if not activities:
            return {}
        
        # Group by day of week
        day_counts = {}
        for activity in activities:
            timestamp = activity.get('timestamp') or activity.get('created_at')
            if timestamp:
                try:
                    dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                    day = dt.strftime('%A')
                    day_counts[day] = day_counts.get(day, 0) + 1
                except:
                    continue
        
        # Find most active day
        most_active_day = max(day_counts, key=day_counts.get) if day_counts else None
        
        return {
            'day_distribution': day_counts,
            'most_active_day': most_active_day,
            'total_activities': len(activities)
        }
    
    def _calculate_consistency_score(self, behaviors: List[Dict[str, Any]], checkins: List[Dict[str, Any]]) -> float:
        """Calculate consistency score based on activity patterns"""
        try:
            all_activities = behaviors + checkins
            if len(all_activities) < 2:
                return 0.0
            
            # Calculate time intervals between activities
            timestamps = []
            for activity in all_activities:
                timestamp = activity.get('timestamp') or activity.get('created_at')
                if timestamp:
                    try:
                        dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                        timestamps.append(dt)
                    except:
                        continue
            
            if len(timestamps) < 2:
                return 0.0
            
            timestamps.sort()
            intervals = [(timestamps[i+1] - timestamps[i]).total_seconds() for i in range(len(timestamps)-1)]
            
            # Calculate coefficient of variation (lower is more consistent)
            if not intervals:
                return 0.0
            
            mean_interval = sum(intervals) / len(intervals)
            variance = sum((x - mean_interval) ** 2 for x in intervals) / len(intervals)
            std_dev = variance ** 0.5
            
            if mean_interval == 0:
                return 0.0
            
            cv = std_dev / mean_interval
            consistency_score = max(0.0, 1.0 - cv)
            
            return consistency_score
            
        except Exception as e:
            logging.error(f"Error calculating consistency score: {str(e)}")
            return 0.0
    
    def _calculate_engagement_score(self, user_data: Dict[str, Any]) -> float:
        """Calculate user engagement score"""
        try:
            behaviors = user_data.get('behaviors', [])
            checkins = user_data.get('checkins', [])
            messages = user_data.get('messages', [])
            
            # Base score from activity frequency
            total_activities = len(behaviors) + len(checkins) + len(messages)
            activity_score = min(total_activities / 30.0, 1.0)  # Normalize to 30 days
            
            # Bonus for variety
            activity_types = set(b.get('activity_type', '') for b in behaviors)
            variety_score = min(len(activity_types) / 5.0, 1.0)
            
            # Bonus for recent activity
            recent_activity_score = 0.0
            if behaviors:
                try:
                    last_activity = max(behaviors, key=lambda x: x.get('timestamp', ''))
                    days_since = (datetime.now() - datetime.fromisoformat(last_activity['timestamp'].replace('Z', '+00:00'))).days
                    recent_activity_score = max(0.0, 1.0 - days_since / 7.0)
                except:
                    pass
            
            # Combine scores
            engagement_score = (activity_score * 0.5 + variety_score * 0.3 + recent_activity_score * 0.2)
            
            return max(0.0, min(1.0, engagement_score))
            
        except Exception as e:
            logging.error(f"Error calculating engagement score: {str(e)}")
            return 0.0
    
    def _calculate_confidence(self, user_data: Dict[str, Any]) -> float:
        """Calculate confidence level for analysis"""
        try:
            total_data_points = (
                len(user_data.get('behaviors', [])) +
                len(user_data.get('checkins', [])) +
                len(user_data.get('messages', []))
            )
            
            # More data points = higher confidence
            confidence = min(total_data_points / 50.0, 1.0)
            
            # Bonus for variety of data types
            data_types = 0
            if user_data.get('behaviors'):
                data_types += 1
            if user_data.get('checkins'):
                data_types += 1
            if user_data.get('messages'):
                data_types += 1
            
            variety_bonus = data_types / 3.0 * 0.2
            
            return max(0.1, min(1.0, confidence + variety_bonus))
            
        except Exception as e:
            logging.error(f"Error calculating confidence: {str(e)}")
            return 0.1
    
    def _load_models(self):
        """Load pre-trained models"""
        try:
            success_model_path = os.path.join(self.model_dir, 'success_predictor.pkl')
            if os.path.exists(success_model_path):
                self.success_predictor = joblib.load(success_model_path)
            
            mood_model_path = os.path.join(self.model_dir, 'mood_predictor.pkl')
            if os.path.exists(mood_model_path):
                self.mood_predictor = joblib.load(mood_model_path)
            
            engagement_model_path = os.path.join(self.model_dir, 'engagement_predictor.pkl')
            if os.path.exists(engagement_model_path):
                self.engagement_predictor = joblib.load(engagement_model_path)
            
            scaler_path = os.path.join(self.model_dir, 'scaler.pkl')
            if os.path.exists(scaler_path):
                self.scaler = joblib.load(scaler_path)
                
        except Exception as e:
            logging.error(f"Error loading models: {str(e)}")
    
    def _save_models(self):
        """Save trained models"""
        try:
            joblib.dump(self.success_predictor, os.path.join(self.model_dir, 'success_predictor.pkl'))
            joblib.dump(self.mood_predictor, os.path.join(self.model_dir, 'mood_predictor.pkl'))
            joblib.dump(self.engagement_predictor, os.path.join(self.model_dir, 'engagement_predictor.pkl'))
            joblib.dump(self.scaler, os.path.join(self.model_dir, 'scaler.pkl'))
            
        except Exception as e:
            logging.error(f"Error saving models: {str(e)}")
    
    async def _store_training_data(self, training_data: Dict[str, Any]):
        """Store training data for future model updates"""
        try:
            await self.supabase.table('ai_metrics').insert({
                'user_id': training_data['user_id'],
                'metric_type': 'training_data',
                'metric_value': training_data['outcome'],
                'metadata': json.dumps({
                    'goal_id': training_data['goal_id'],
                    'features': training_data['features'],
                    'context': training_data['context']
                }),
                'timestamp': training_data['timestamp']
            }).execute()
            
        except Exception as e:
            logging.error(f"Error storing training data: {str(e)}")
    
    async def _retrain_models_if_needed(self):
        """Retrain models if we have enough new training data"""
        try:
            # Get training data count
            response = await self.supabase.table('ai_metrics').select('count').eq('metric_type', 'training_data').execute()
            
            training_count = len(response.data) if response.data else 0
            
            # Retrain if we have enough data (every 100 new samples)
            if training_count % 100 == 0 and training_count > 0:
                await self._retrain_models()
                
        except Exception as e:
            logging.error(f"Error checking for model retraining: {str(e)}")
    
    async def _retrain_models(self):
        """Retrain models with new data"""
        try:
            # Get all training data
            response = await self.supabase.table('ai_metrics').select('*').eq('metric_type', 'training_data').execute()
            
            training_data = response.data if response.data else []
            
            if len(training_data) < 10:
                return
            
            # Prepare training data
            X = []
            y = []
            
            for sample in training_data:
                metadata = json.loads(sample.get('metadata', '{}'))
                features = metadata.get('features', [])
                outcome = sample.get('metric_value', 0)
                
                if features:
                    X.append(features)
                    y.append(outcome)
            
            if len(X) < 10:
                return
            
            # Convert to numpy arrays
            X = np.array(X)
            y = np.array(y)
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
            
            # Scale features
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
            
            # Train success predictor
            self.success_predictor.fit(X_train_scaled, y_train)
            
            # Evaluate model
            y_pred = self.success_predictor.predict(X_test_scaled)
            accuracy = accuracy_score(y_test, y_pred)
            
            logging.info(f"Model retrained with accuracy: {accuracy:.3f}")
            
            # Save models
            self._save_models()
            
        except Exception as e:
            logging.error(f"Error retraining models: {str(e)}")
    
    # Additional helper methods for mood and engagement prediction
    def _extract_mood_features(self, user_data: Dict[str, Any]) -> List[float]:
        """Extract features for mood prediction"""
        features = []
        
        checkins = user_data.get('checkins', [])
        behaviors = user_data.get('behaviors', [])
        
        # Recent mood trend
        if checkins:
            recent_moods = [c.get('mood', 3) for c in checkins[-5:]]
            features.append(sum(recent_moods) / len(recent_moods) / 5.0)
        else:
            features.append(0.6)  # Default
        
        # Activity level
        features.append(len(behaviors) / 30.0)
        
        # Check-in frequency
        features.append(len(checkins) / 30.0)
        
        # Engagement score
        features.append(self._calculate_engagement_score(user_data))
        
        # Consistency score
        features.append(self._calculate_consistency_score(behaviors, checkins))
        
        return features
    
    def _identify_mood_factors(self, user_data: Dict[str, Any]) -> List[str]:
        """Identify factors affecting mood"""
        factors = []
        
        checkins = user_data.get('checkins', [])
        behaviors = user_data.get('behaviors', [])
        
        if checkins:
            # Recent check-in frequency
            if len(checkins) >= 7:
                factors.append("Regular check-ins")
            elif len(checkins) < 3:
                factors.append("Infrequent check-ins")
            
            # Mood variability
            moods = [c.get('mood', 3) for c in checkins]
            if len(moods) > 2:
                mood_std = np.std(moods)
                if mood_std > 1.0:
                    factors.append("High mood variability")
        
        # Activity patterns
        if behaviors:
            activity_types = set(b.get('activity_type', '') for b in behaviors)
            if len(activity_types) > 3:
                factors.append("Diverse activities")
            elif len(activity_types) == 1:
                factors.append("Limited activity variety")
        
        return factors or ["Insufficient data for factor analysis"]
    
    def _analyze_mood_trend_fallback(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback mood trend analysis"""
        checkins = user_data.get('checkins', [])
        
        if not checkins:
            return {
                "trend": "stable",
                "predicted_mood": 3.0,
                "confidence": 0.1,
                "factors": ["No check-in data available"]
            }
        
        moods = [c.get('mood', 3) for c in checkins]
        
        if len(moods) < 3:
            return {
                "trend": "stable",
                "predicted_mood": float(sum(moods) / len(moods)),
                "confidence": 0.3,
                "factors": ["Limited data for trend analysis"]
            }
        
        recent_avg = sum(moods[:3]) / 3
        older_avg = sum(moods[-3:]) / 3
        
        if recent_avg > older_avg + 0.5:
            trend = "improving"
        elif recent_avg < older_avg - 0.5:
            trend = "declining"
        else:
            trend = "stable"
        
        return {
            "trend": trend,
            "predicted_mood": recent_avg,
            "current_avg": recent_avg,
            "confidence": 0.6,
            "factors": self._identify_mood_factors(user_data)
        }
    
    def _predict_goal_completion(self, user_data: Dict[str, Any]) -> float:
        """Predict goal completion probability"""
        goals = user_data.get('goals', [])
        
        if not goals:
            return 0.5
        
        # Calculate completion rate
        completed_goals = [g for g in goals if g.get('completed', False)]
        completion_rate = len(completed_goals) / len(goals)
        
        # Adjust based on activity level
        behaviors = user_data.get('behaviors', [])
        activity_bonus = min(len(behaviors) / 30.0, 0.3)
        
        return max(0.0, min(1.0, completion_rate + activity_bonus))
    
    def _predict_streak_continuation(self, user_data: Dict[str, Any]) -> float:
        """Predict streak continuation probability"""
        checkins = user_data.get('checkins', [])
        
        if not checkins:
            return 0.1
        
        # Calculate recent check-in frequency
        if len(checkins) >= 7:
            return 0.8
        elif len(checkins) >= 3:
            return 0.6
        else:
            return 0.3
    
    async def _generate_behavioral_insights(self, user_data: Dict[str, Any], patterns: Dict[str, Any], predictions: Dict[str, Any]) -> List[str]:
        """Generate behavioral insights"""
        insights = []
        
        # Consistency insights
        consistency = patterns.get('consistency_score', 0)
        if consistency > 0.7:
            insights.append("You show excellent consistency in your activities")
        elif consistency < 0.3:
            insights.append("Your activity patterns could benefit from more consistency")
        
        # Engagement insights
        engagement = predictions.get('engagement_score', 0)
        if engagement > 0.7:
            insights.append("You maintain high engagement with your goals")
        elif engagement < 0.4:
            insights.append("Consider ways to increase your engagement")
        
        # Pattern insights
        activity_dist = patterns.get('activity_distribution', {})
        if 'checkin' in activity_dist and activity_dist['checkin'] > 15:
            insights.append("Your regular check-ins are building strong momentum")
        
        return insights or ["Continue your current activities to build more insights"]
    
    async def _calculate_risk_factors(self, user_data: Dict[str, Any], patterns: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Calculate risk factors for goal failure"""
        risk_factors = []
        
        # Low check-in frequency
        checkins = user_data.get('checkins', [])
        if len(checkins) < 3:
            risk_factors.append({
                'factor': 'Low check-in frequency',
                'severity': 'medium',
                'description': 'Infrequent check-ins may indicate reduced engagement'
            })
        
        # Low mood trend
        if checkins:
            recent_moods = [c.get('mood', 3) for c in checkins[-5:]]
            if recent_moods and sum(recent_moods) / len(recent_moods) < 2.5:
                risk_factors.append({
                    'factor': 'Low mood trend',
                    'severity': 'high',
                    'description': 'Recent mood scores suggest you may need additional support'
                })
        
        # Low consistency
        consistency = patterns.get('consistency_score', 0)
        if consistency < 0.3:
            risk_factors.append({
                'factor': 'Low consistency',
                'severity': 'medium',
                'description': 'Inconsistent activity patterns may impact goal achievement'
            })
        
        return risk_factors
    
    async def _generate_recommendations(self, user_data: Dict[str, Any], patterns: Dict[str, Any], predictions: Dict[str, Any], risk_factors: List[Dict[str, Any]]) -> List[str]:
        """Generate personalized recommendations"""
        recommendations = []
        
        # Address risk factors
        for risk in risk_factors:
            if risk['factor'] == 'Low check-in frequency':
                recommendations.append("Set daily reminders to complete your check-ins")
            elif risk['factor'] == 'Low mood trend':
                recommendations.append("Consider activities that boost your mood, like exercise or connecting with friends")
            elif risk['factor'] == 'Low consistency':
                recommendations.append("Try to establish a daily routine that includes your goal activities")
        
        # Leverage strengths
        engagement = predictions.get('engagement_score', 0)
        if engagement > 0.7:
            recommendations.append("Your high engagement is a strength - use it to tackle more challenging goals")
        
        consistency = patterns.get('consistency_score', 0)
        if consistency > 0.7:
            recommendations.append("Your consistent behavior is excellent - maintain this momentum")
        
        # General recommendations
        if not recommendations:
            recommendations.append("Continue your current activities and check in regularly")
            recommendations.append("Consider setting specific daily goals to maintain momentum")
        
        return recommendations 