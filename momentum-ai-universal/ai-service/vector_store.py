from typing import List, Dict, Any, Optional, Tuple
import numpy as np
from sklearn.neighbors import NearestNeighbors
from sklearn.metrics.pairwise import cosine_similarity
import json
import os
from datetime import datetime

class VectorStore:
    def __init__(self, dimension: int = 384):
        """
        Initialize vector store with scikit-learn NearestNeighbors
        """
        self.dimension = dimension
        self.index = NearestNeighbors(n_neighbors=10, metric='cosine')
        self.vectors = []
        self.metadata = []
        self.user_indices = {}
        self.is_fitted = False
        
    def add_vectors(self, vectors: List[List[float]], metadata: List[Dict[str, Any]]) -> List[int]:
        """
        Add vectors to the store
        """
        vector_ids = []
        
        for i, (vector, meta) in enumerate(zip(vectors, metadata)):
            vector_id = len(self.vectors)
            self.vectors.append(vector)
            self.metadata.append({
                **meta,
                'vector_id': vector_id,
                'timestamp': datetime.now().isoformat()
            })
            vector_ids.append(vector_id)
            
            # Track user-specific indices
            user_id = meta.get('user_id')
            if user_id:
                if user_id not in self.user_indices:
                    self.user_indices[user_id] = []
                self.user_indices[user_id].append(vector_id)
        
        # Refit the model with new vectors
        if self.vectors:
            self.index.fit(np.array(self.vectors))
            self.is_fitted = True
            
        return vector_ids
    
    def search(self, query_vector: List[float], k: int = 5, 
               user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Search for similar vectors
        """
        if not self.is_fitted or not self.vectors:
            return []
            
        query_vector = np.array(query_vector).reshape(1, -1)
        
        # Get user-specific indices if specified
        if user_id and user_id in self.user_indices:
            user_vector_ids = self.user_indices[user_id]
            if not user_vector_ids:
                return []
                
            # Filter vectors for this user
            user_vectors = [self.vectors[i] for i in user_vector_ids]
            user_metadata = [self.metadata[i] for i in user_vector_ids]
            
            # Create temporary index for user vectors
            if len(user_vectors) > 0:
                user_index = NearestNeighbors(n_neighbors=min(k, len(user_vectors)), metric='cosine')
                user_index.fit(np.array(user_vectors))
                
                distances, indices = user_index.kneighbors(query_vector)
                
                results = []
                for i, (dist, idx) in enumerate(zip(distances[0], indices[0])):
                    results.append({
                        'metadata': user_metadata[idx],
                        'distance': float(dist),
                        'similarity': float(1 - dist)  # Convert cosine distance to similarity
                    })
                return results
        else:
            # Search all vectors
            distances, indices = self.index.kneighbors(query_vector)
            
            results = []
            for i, (dist, idx) in enumerate(zip(distances[0], indices[0])):
                results.append({
                    'metadata': self.metadata[idx],
                    'distance': float(dist),
                    'similarity': float(1 - dist)  # Convert cosine distance to similarity
                })
            return results
        
        return []
    
    def get_user_vectors(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Get all vectors for a specific user
        """
        if user_id not in self.user_indices:
            return []
            
        user_vector_ids = self.user_indices[user_id]
        return [self.metadata[i] for i in user_vector_ids]
    
    def delete_user_vectors(self, user_id: str) -> int:
        """
        Delete all vectors for a specific user
        """
        if user_id not in self.user_indices:
            return 0
            
        # Mark for deletion (in a real implementation, you'd rebuild the index)
        deleted_count = 0
        for vector_id in self.user_indices[user_id]:
            if vector_id < len(self.metadata):
                self.metadata[vector_id]['deleted'] = True
                deleted_count += 1
                
        del self.user_indices[user_id]
        return deleted_count
    
    def store_behavior_pattern(self, user_id: str, pattern_type: str, 
                             embedding: List[float], metadata: Dict[str, Any]) -> int:
        """
        Store a behavior pattern
        """
        pattern_metadata = {
            'user_id': user_id,
            'type': 'behavior_pattern',
            'pattern_type': pattern_type,
            'timestamp': datetime.now().isoformat(),
            **metadata
        }
        
        vector_ids = self.add_vectors([embedding], [pattern_metadata])
        return vector_ids[0] if vector_ids else -1
    
    def find_similar_patterns(self, user_id: str, pattern_embedding: List[float], 
                            k: int = 5) -> List[Dict[str, Any]]:
        """
        Find similar behavior patterns for a user
        """
        results = self.search(pattern_embedding, k=k, user_id=user_id)
        
        # Filter for behavior patterns only
        pattern_results = []
        for result in results:
            if result['metadata'].get('type') == 'behavior_pattern':
                pattern_results.append(result)
                
        return pattern_results
    
    def store_drift_indicator(self, user_id: str, indicator_type: str,
                            embedding: List[float], metadata: Dict[str, Any]) -> int:
        """
        Store drift indicators
        """
        drift_metadata = {
            'user_id': user_id,
            'type': 'drift_indicator',
            'indicator_type': indicator_type,
            'timestamp': datetime.now().isoformat(),
            **metadata
        }
        
        vector_ids = self.add_vectors([embedding], [drift_metadata])
        return vector_ids[0] if vector_ids else -1
    
    def analyze_drift_patterns(self, user_id: str, current_embedding: List[float],
                             lookback_days: int = 7) -> Dict[str, Any]:
        """
        Analyze drift patterns
        """
        # Get recent drift indicators
        user_vectors = self.get_user_vectors(user_id)
        recent_drift = []
        
        cutoff_date = datetime.now()
        for vector_meta in user_vectors:
            if (vector_meta.get('type') == 'drift_indicator' and 
                not vector_meta.get('deleted', False)):
                # Simple date filtering (you'd want proper date parsing in production)
                recent_drift.append(vector_meta)
        
        if not recent_drift:
            return {'drift_detected': False, 'confidence': 0.0}
        
        # Find similar patterns
        similar_patterns = self.search(current_embedding, k=10, user_id=user_id)
        
        # Analyze drift
        drift_scores = []
        for pattern in similar_patterns:
            if pattern['metadata'].get('type') == 'drift_indicator':
                drift_scores.append(pattern['similarity'])
        
        if drift_scores:
            avg_similarity = np.mean(drift_scores)
            drift_detected = avg_similarity < 0.7  # Threshold for drift detection
            
            return {
                'drift_detected': drift_detected,
                'confidence': float(1 - avg_similarity),
                'similar_patterns': len(similar_patterns),
                'drift_indicators': len(recent_drift)
            }
        
        return {'drift_detected': False, 'confidence': 0.0}
    
    def get_stats(self) -> Dict[str, Any]:
        """
        Get vector store statistics
        """
        active_vectors = sum(1 for meta in self.metadata if not meta.get('deleted', False))
        
        return {
            'total_vectors': len(self.vectors),
            'active_vectors': active_vectors,
            'users': len(self.user_indices),
            'dimension': self.dimension,
            'is_fitted': self.is_fitted
        }

# Global instance
vector_store = VectorStore() 