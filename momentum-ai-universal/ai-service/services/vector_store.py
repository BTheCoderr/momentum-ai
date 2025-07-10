"""
Service for vector storage and search using FAISS
"""
import os
import numpy as np
import faiss
from typing import List, Dict, Any, Optional
from ai_service.config.ai_config import AIConfig, VectorStore

class VectorStoreService:
    def __init__(self, config: AIConfig):
        self.config = config
        self.dimension = config.vector_store_config["dimension"]
        self.index = self._create_index()
        self.documents: List[Dict[str, Any]] = []
        
    def _create_index(self) -> faiss.Index:
        """Create FAISS index based on configuration"""
        if self.config.vector_store_config["index_type"] == "IndexFlatL2":
            return faiss.IndexFlatL2(self.dimension)
        else:
            raise ValueError(f"Unsupported index type: {self.config.vector_store_config['index_type']}")
            
    def add_documents(
        self,
        documents: List[Dict[str, Any]],
        embeddings: np.ndarray
    ) -> None:
        """
        Add documents and their embeddings to the vector store
        
        Args:
            documents: List of document dictionaries with metadata
            embeddings: numpy array of document embeddings
        """
        if len(documents) != embeddings.shape[0]:
            raise ValueError("Number of documents must match number of embeddings")
            
        # Add to FAISS index
        self.index.add(embeddings)
        
        # Store documents
        self.documents.extend(documents)
        
    def search(
        self,
        query_embedding: np.ndarray,
        k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Search for similar documents using query embedding
        
        Args:
            query_embedding: Query embedding vector
            k: Number of results to return
            
        Returns:
            List of similar documents with scores
        """
        # Reshape query embedding if needed
        if len(query_embedding.shape) == 1:
            query_embedding = query_embedding.reshape(1, -1)
            
        # Search index
        distances, indices = self.index.search(query_embedding, k)
        
        # Get documents and add distances
        results = []
        for i, (distance, idx) in enumerate(zip(distances[0], indices[0])):
            if idx < len(self.documents):  # Check if index is valid
                doc = self.documents[idx].copy()
                doc["score"] = float(1.0 / (1.0 + distance))  # Convert distance to similarity score
                results.append(doc)
                
        return results
        
    def save(self, path: Optional[str] = None) -> None:
        """Save index and documents to disk"""
        if path is None:
            path = self.config.vector_store_path
            
        # Create directory if it doesn't exist
        os.makedirs(path, exist_ok=True)
        
        # Save FAISS index
        index_path = os.path.join(path, "index.faiss")
        faiss.write_index(self.index, index_path)
        
        # Save documents
        import json
        docs_path = os.path.join(path, "documents.json")
        with open(docs_path, "w") as f:
            json.dump(self.documents, f)
            
    def load(self, path: Optional[str] = None) -> None:
        """Load index and documents from disk"""
        if path is None:
            path = self.config.vector_store_path
            
        # Load FAISS index
        index_path = os.path.join(path, "index.faiss")
        if os.path.exists(index_path):
            self.index = faiss.read_index(index_path)
        
        # Load documents
        docs_path = os.path.join(path, "documents.json")
        if os.path.exists(docs_path):
            import json
            with open(docs_path, "r") as f:
                self.documents = json.load(f) 