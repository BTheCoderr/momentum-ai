import numpy as np
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any, Optional, Tuple
import logging
import json
from datetime import datetime
import asyncio
from concurrent.futures import ThreadPoolExecutor
import hashlib
from supabase import Client
import os

class EmbeddingsService:
    """
    Advanced embeddings service using reliable sentence transformers models
    """
    
    def __init__(self, supabase_client: Optional[Client] = None):
        self.supabase = supabase_client
        self.model = None
        self.embedding_dim = 384  # Default dimension for all-MiniLM-L6-v2
        self.executor = ThreadPoolExecutor(max_workers=4)
        self.cache = {}  # Simple in-memory cache
        
        # Initialize model
        self._load_model()
    
    def _load_model(self):
        """Load a reliable sentence transformer model"""
        try:
            # Use a smaller, more reliable model that's commonly available
            model_name = os.getenv('EMBEDDINGS_MODEL', 'all-MiniLM-L6-v2')
            logging.info(f"Loading embeddings model: {model_name}")
            
            self.model = SentenceTransformer(model_name)
            self.embedding_dim = self.model.get_sentence_embedding_dimension()
            
            logging.info(f"Embeddings model loaded successfully. Dimension: {self.embedding_dim}")
        except Exception as e:
            logging.error(f"Failed to load embeddings model: {str(e)}")
            # Create a fallback dummy model
            self.model = None
            self.embedding_dim = 384
            logging.warning("Using fallback dummy embeddings")
    
    async def encode_text(self, text: str) -> np.ndarray:
        """
        Encode text to embeddings
        """
        try:
            # Check cache first
            text_hash = hashlib.md5(text.encode()).hexdigest()
            if text_hash in self.cache:
                return self.cache[text_hash]
            
            if self.model is None:
                # Return dummy embedding if model failed to load
                embedding_array = np.random.random(self.embedding_dim).astype(np.float32)
                self.cache[text_hash] = embedding_array
                return embedding_array
            
            # Encode text in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            embedding = await loop.run_in_executor(
                self.executor, 
                self.model.encode, 
                [text]
            )
            
            # Cache the result
            embedding_array = embedding[0]
            self.cache[text_hash] = embedding_array
            
            return embedding_array
            
        except Exception as e:
            logging.error(f"Error encoding text: {str(e)}")
            return np.random.random(self.embedding_dim).astype(np.float32)
    
    async def encode_batch(self, texts: List[str]) -> np.ndarray:
        """
        Encode multiple texts in batch for efficiency
        """
        try:
            if self.model is None:
                return np.random.random((len(texts), self.embedding_dim)).astype(np.float32)
                
            loop = asyncio.get_event_loop()
            embeddings = await loop.run_in_executor(
                self.executor, 
                self.model.encode, 
                texts
            )
            return embeddings
            
        except Exception as e:
            logging.error(f"Error encoding batch: {str(e)}")
            return np.random.random((len(texts), self.embedding_dim)).astype(np.float32)
    
    async def encode_user_behavior(self, user_id: str, behavior_data: Dict[str, Any]) -> np.ndarray:
        """
        Convert user behavior data to embeddings for pattern analysis
        """
        try:
            # Create textual representation of behavior
            behavior_text = self._behavior_to_text(behavior_data)
            
            # Generate embedding
            embedding = await self.encode_text(behavior_text)
            
            # Store in database for future retrieval
            await self._store_behavior_embedding(user_id, behavior_data, embedding)
            
            return embedding
            
        except Exception as e:
            logging.error(f"Error encoding user behavior: {str(e)}")
            return np.zeros(self.embedding_dim)
    
    async def encode_conversation(self, user_id: str, message: str, context: Dict[str, Any]) -> np.ndarray:
        """
        Encode conversation with context for semantic search
        """
        try:
            # Combine message with context
            conversation_text = self._conversation_to_text(message, context)
            
            # Generate embedding
            embedding = await self.encode_text(conversation_text)
            
            # Store in context cache
            await self._store_conversation_embedding(user_id, conversation_text, embedding)
            
            return embedding
            
        except Exception as e:
            logging.error(f"Error encoding conversation: {str(e)}")
            return np.zeros(self.embedding_dim)
    
    async def find_similar_behaviors(self, user_id: str, query_embedding: np.ndarray, top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Find similar user behaviors using semantic search
        """
        try:
            # Get user's behavior embeddings from database
            behavior_embeddings = await self._get_user_behavior_embeddings(user_id)
            
            if not behavior_embeddings:
                return []
            
            # Calculate cosine similarities
            similarities = []
            for behavior in behavior_embeddings:
                if behavior.get('embedding'):
                    stored_embedding = np.array(behavior['embedding'])
                    similarity = self._cosine_similarity(query_embedding, stored_embedding)
                    similarities.append({
                        'behavior': behavior,
                        'similarity': similarity
                    })
            
            # Sort by similarity and return top_k
            similarities.sort(key=lambda x: x['similarity'], reverse=True)
            return similarities[:top_k]
            
        except Exception as e:
            logging.error(f"Error finding similar behaviors: {str(e)}")
            return []
    
    async def find_similar_conversations(self, user_id: str, query_embedding: np.ndarray, top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Find similar conversations for context-aware responses
        """
        try:
            # Get user's conversation embeddings from cache
            conversation_embeddings = await self._get_user_conversation_embeddings(user_id)
            
            if not conversation_embeddings:
                return []
            
            # Calculate similarities
            similarities = []
            for conversation in conversation_embeddings:
                if conversation.get('embedding'):
                    stored_embedding = np.array(conversation['embedding'])
                    similarity = self._cosine_similarity(query_embedding, stored_embedding)
                    similarities.append({
                        'conversation': conversation,
                        'similarity': similarity
                    })
            
            # Sort and return top_k
            similarities.sort(key=lambda x: x['similarity'], reverse=True)
            return similarities[:top_k]
            
        except Exception as e:
            logging.error(f"Error finding similar conversations: {str(e)}")
            return []
    
    async def analyze_behavior_patterns(self, user_id: str, timeframe_days: int = 30) -> Dict[str, Any]:
        """
        Analyze user behavior patterns using embeddings clustering
        """
        try:
            # Get recent behavior embeddings
            behaviors = await self._get_recent_behavior_embeddings(user_id, timeframe_days)
            
            if len(behaviors) < 3:
                return {"patterns": [], "clusters": 0, "insights": []}
            
            # Extract embeddings for clustering
            embeddings = [np.array(b['embedding']) for b in behaviors if b.get('embedding')]
            
            if not embeddings:
                return {"patterns": [], "clusters": 0, "insights": []}
            
            # Perform clustering analysis
            clusters = await self._cluster_embeddings(embeddings)
            
            # Generate insights from clusters
            insights = await self._generate_pattern_insights(behaviors, clusters)
            
            return {
                "patterns": clusters,
                "clusters": len(clusters),
                "insights": insights,
                "total_behaviors": len(behaviors)
            }
            
        except Exception as e:
            logging.error(f"Error analyzing behavior patterns: {str(e)}")
            return {"patterns": [], "clusters": 0, "insights": []}
    
    async def semantic_search_insights(self, user_id: str, query: str, top_k: int = 10) -> List[Dict[str, Any]]:
        """
        Search user's insights and behaviors using semantic similarity
        """
        try:
            # Encode the query
            query_embedding = await self.encode_text(query)
            
            # Search behaviors and conversations
            similar_behaviors = await self.find_similar_behaviors(user_id, query_embedding, top_k//2)
            similar_conversations = await self.find_similar_conversations(user_id, query_embedding, top_k//2)
            
            # Combine and rank results
            all_results = []
            
            for result in similar_behaviors:
                all_results.append({
                    'type': 'behavior',
                    'content': result['behavior'],
                    'similarity': result['similarity'],
                    'timestamp': result['behavior'].get('timestamp')
                })
            
            for result in similar_conversations:
                all_results.append({
                    'type': 'conversation',
                    'content': result['conversation'],
                    'similarity': result['similarity'],
                    'timestamp': result['conversation'].get('timestamp')
                })
            
            # Sort by similarity
            all_results.sort(key=lambda x: x['similarity'], reverse=True)
            
            return all_results[:top_k]
            
        except Exception as e:
            logging.error(f"Error in semantic search: {str(e)}")
            return []
    
    # Private helper methods
    def _behavior_to_text(self, behavior_data: Dict[str, Any]) -> str:
        """Convert behavior data to text representation"""
        activity_type = behavior_data.get('activity_type', 'unknown')
        data = behavior_data.get('data', {})
        
        text_parts = [f"Activity: {activity_type}"]
        
        # Add specific data based on activity type
        if activity_type == 'checkin':
            mood = data.get('mood', 3)
            energy = data.get('energy', 3)
            stress = data.get('stress', 3)
            text_parts.append(f"Mood: {mood}/5, Energy: {energy}/5, Stress: {stress}/5")
        
        elif activity_type == 'goal_created':
            title = data.get('title', 'Unknown goal')
            category = data.get('category', 'general')
            text_parts.append(f"Goal: {title}, Category: {category}")
        
        elif activity_type == 'ai_interaction':
            interaction_type = data.get('interaction_type', 'unknown')
            text_parts.append(f"AI Interaction: {interaction_type}")
        
        # Add any additional data
        for key, value in data.items():
            if key not in ['mood', 'energy', 'stress', 'title', 'category', 'interaction_type']:
                text_parts.append(f"{key}: {value}")
        
        return " | ".join(text_parts)
    
    def _conversation_to_text(self, message: str, context: Dict[str, Any]) -> str:
        """Convert conversation to text representation"""
        text_parts = [f"Message: {message}"]
        
        # Add context information
        if context.get('goals'):
            goals = context['goals'][:3]  # First 3 goals
            goal_titles = [g.get('title', 'Unknown') for g in goals]
            text_parts.append(f"Active Goals: {', '.join(goal_titles)}")
        
        if context.get('recent_checkins'):
            checkins = context['recent_checkins'][:5]  # Last 5 checkins
            avg_mood = sum(c.get('mood', 3) for c in checkins) / len(checkins)
            text_parts.append(f"Recent Mood Average: {avg_mood:.1f}/5")
        
        return " | ".join(text_parts)
    
    def _cosine_similarity(self, a: np.ndarray, b: np.ndarray) -> float:
        """Calculate cosine similarity between two embeddings"""
        try:
            dot_product = np.dot(a, b)
            norm_a = np.linalg.norm(a)
            norm_b = np.linalg.norm(b)
            
            if norm_a == 0 or norm_b == 0:
                return 0.0
            
            return dot_product / (norm_a * norm_b)
        except Exception:
            return 0.0
    
    async def _store_behavior_embedding(self, user_id: str, behavior_data: Dict[str, Any], embedding: np.ndarray):
        """Store behavior embedding in database"""
        try:
            await self.supabase.table('behavior_data').insert({
                'user_id': user_id,
                'activity_type': behavior_data.get('activity_type', 'unknown'),
                'data': json.dumps(behavior_data),
                'embedding': embedding.tolist(),
                'timestamp': datetime.now().isoformat()
            }).execute()
        except Exception as e:
            logging.error(f"Error storing behavior embedding: {str(e)}")
    
    async def _store_conversation_embedding(self, user_id: str, conversation_text: str, embedding: np.ndarray):
        """Store conversation embedding in context cache"""
        try:
            await self.supabase.table('ai_context_cache').insert({
                'user_id': user_id,
                'context_type': 'conversation',
                'context_data': json.dumps({'text': conversation_text}),
                'embedding': embedding.tolist(),
                'created_at': datetime.now().isoformat()
            }).execute()
        except Exception as e:
            logging.error(f"Error storing conversation embedding: {str(e)}")
    
    async def _get_user_behavior_embeddings(self, user_id: str) -> List[Dict[str, Any]]:
        """Get user's behavior embeddings from database"""
        try:
            response = await self.supabase.table('behavior_data').select('*').eq('user_id', user_id).order('timestamp', desc=True).limit(50).execute()
            return response.data or []
        except Exception as e:
            logging.error(f"Error getting behavior embeddings: {str(e)}")
            return []
    
    async def _get_user_conversation_embeddings(self, user_id: str) -> List[Dict[str, Any]]:
        """Get user's conversation embeddings from cache"""
        try:
            response = await self.supabase.table('ai_context_cache').select('*').eq('user_id', user_id).eq('context_type', 'conversation').order('created_at', desc=True).limit(20).execute()
            return response.data or []
        except Exception as e:
            logging.error(f"Error getting conversation embeddings: {str(e)}")
            return []
    
    async def _get_recent_behavior_embeddings(self, user_id: str, days: int) -> List[Dict[str, Any]]:
        """Get recent behavior embeddings for pattern analysis"""
        try:
            cutoff_date = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
            cutoff_date = cutoff_date.replace(day=cutoff_date.day - days)
            
            response = await self.supabase.table('behavior_data').select('*').eq('user_id', user_id).gte('timestamp', cutoff_date.isoformat()).order('timestamp', desc=True).execute()
            return response.data or []
        except Exception as e:
            logging.error(f"Error getting recent behavior embeddings: {str(e)}")
            return []
    
    async def _cluster_embeddings(self, embeddings: List[np.ndarray]) -> List[Dict[str, Any]]:
        """Cluster embeddings to find behavior patterns"""
        try:
            from sklearn.cluster import KMeans
            from sklearn.metrics import silhouette_score
            
            # Convert to numpy array
            embeddings_array = np.array(embeddings)
            
            # Determine optimal number of clusters
            max_clusters = min(8, len(embeddings) // 2)
            best_clusters = 2
            best_score = -1
            
            for n_clusters in range(2, max_clusters + 1):
                kmeans = KMeans(n_clusters=n_clusters, random_state=42)
                cluster_labels = kmeans.fit_predict(embeddings_array)
                score = silhouette_score(embeddings_array, cluster_labels)
                
                if score > best_score:
                    best_score = score
                    best_clusters = n_clusters
            
            # Perform final clustering
            kmeans = KMeans(n_clusters=best_clusters, random_state=42)
            cluster_labels = kmeans.fit_predict(embeddings_array)
            
            # Group embeddings by cluster
            clusters = []
            for i in range(best_clusters):
                cluster_embeddings = embeddings_array[cluster_labels == i]
                cluster_center = kmeans.cluster_centers_[i]
                
                clusters.append({
                    'cluster_id': i,
                    'size': len(cluster_embeddings),
                    'center': cluster_center.tolist(),
                    'cohesion': float(best_score)
                })
            
            return clusters
            
        except Exception as e:
            logging.error(f"Error clustering embeddings: {str(e)}")
            return []
    
    async def _generate_pattern_insights(self, behaviors: List[Dict[str, Any]], clusters: List[Dict[str, Any]]) -> List[str]:
        """Generate insights from behavior patterns"""
        insights = []
        
        try:
            # Analyze cluster sizes
            total_behaviors = len(behaviors)
            largest_cluster = max(clusters, key=lambda x: x['size'])
            
            if largest_cluster['size'] > total_behaviors * 0.4:
                insights.append(f"You have a dominant behavior pattern representing {largest_cluster['size']} out of {total_behaviors} activities")
            
            # Analyze cluster diversity
            if len(clusters) > 3:
                insights.append("You show diverse behavior patterns, indicating good variety in your activities")
            elif len(clusters) == 2:
                insights.append("You have two main behavior patterns - consider expanding your activity types")
            
            # Analyze cohesion
            if clusters and clusters[0].get('cohesion', 0) > 0.5:
                insights.append("Your behavior patterns are well-defined and consistent")
            elif clusters and clusters[0].get('cohesion', 0) < 0.3:
                insights.append("Your behavior patterns vary significantly - this could indicate exploration or inconsistency")
            
            return insights
            
        except Exception as e:
            logging.error(f"Error generating pattern insights: {str(e)}")
            return ["Unable to generate pattern insights at this time"] 