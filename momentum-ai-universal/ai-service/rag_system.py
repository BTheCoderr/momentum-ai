#!/usr/bin/env python3
"""
Complete RAG (Retrieval Augmented Generation) System
Combines FAISS vector search with Ollama LLM generation
"""
import json
import requests
from typing import List, Dict, Any, Optional
from datetime import datetime
from vector_store_faiss import FAISSVectorStore

class RAGSystem:
    def __init__(self, vector_store: FAISSVectorStore = None, model_name: str = "phi3:mini"):
        """
        Initialize RAG system
        
        Args:
            vector_store: FAISS vector store instance
            model_name: Ollama model to use for generation
        """
        self.vector_store = vector_store or FAISSVectorStore()
        self.model_name = model_name
        self.ollama_url = "http://localhost:11434/api/generate"
    
    def generate_response(self, prompt: str, context: str = "", max_tokens: int = 500) -> str:
        """
        Generate response using Ollama LLM
        
        Args:
            prompt: User prompt
            context: Retrieved context
            max_tokens: Maximum tokens to generate
            
        Returns:
            Generated response
        """
        # Construct full prompt with context
        full_prompt = f"""Context: {context}

User Query: {prompt}

Please provide a helpful, personalized response based on the context above. Be supportive and actionable."""

        try:
            payload = {
                "model": self.model_name,
                "prompt": full_prompt,
                "stream": False,
                "options": {
                    "num_predict": max_tokens,
                    "temperature": 0.7,
                    "top_p": 0.9
                }
            }
            
            response = requests.post(self.ollama_url, json=payload, timeout=60)
            
            if response.status_code == 200:
                result = response.json()
                return result.get('response', 'Sorry, I could not generate a response.')
            else:
                return f"Error: Could not generate response (status {response.status_code})"
                
        except Exception as e:
            return f"Error generating response: {str(e)}"
    
    def retrieve_and_generate(self, user_id: str, query: str, k: int = 3) -> Dict[str, Any]:
        """
        Main RAG pipeline: retrieve relevant context and generate response
        
        Args:
            user_id: User identifier
            query: User query
            k: Number of documents to retrieve
            
        Returns:
            Complete RAG response with context and generation
        """
        # Step 1: Retrieve relevant context
        context_data = self.vector_store.get_user_context(user_id, query)
        
        # Step 2: Format context for LLM
        context_text = self._format_context(context_data, k)
        
        # Step 3: Generate response
        response = self.generate_response(query, context_text)
        
        # Step 4: Return complete result
        return {
            "user_id": user_id,
            "query": query,
            "response": response,
            "context_used": context_data,
            "context_text": context_text,
            "timestamp": datetime.now().isoformat(),
            "model_used": self.model_name
        }
    
    def _format_context(self, context_data: Dict[str, Any], k: int) -> str:
        """
        Format retrieved context for LLM consumption
        
        Args:
            context_data: Retrieved context from vector store
            k: Number of items per category
            
        Returns:
            Formatted context string
        """
        context_parts = []
        
        for data_type, items in context_data.get("relevant_data", {}).items():
            if items:
                context_parts.append(f"\n{data_type.upper()} HISTORY:")
                for i, item in enumerate(items[:k]):
                    score = item.get('score', 0)
                    text = item.get('text', item.get('content', ''))
                    timestamp = item.get('timestamp', '')
                    context_parts.append(f"  {i+1}. [{score:.3f}] {text} (from {timestamp[:10]})")
        
        return "\n".join(context_parts) if context_parts else "No relevant context found."
    
    def add_user_interaction(self, user_id: str, interaction_type: str, content: str, metadata: Dict[str, Any] = None):
        """
        Add user interaction to the vector store
        
        Args:
            user_id: User identifier
            interaction_type: Type of interaction (checkin, goal, chat, etc.)
            content: Content to store
            metadata: Additional metadata
        """
        extra_metadata = metadata or {}
        extra_metadata.update({
            "interaction_type": interaction_type,
            "timestamp": datetime.now().isoformat()
        })
        
        return self.vector_store.add_user_data(user_id, interaction_type, content, extra_metadata)
    
    def get_coaching_response(self, user_id: str, message: str, coaching_type: str = "general") -> Dict[str, Any]:
        """
        Get AI coaching response with personalized context
        
        Args:
            user_id: User identifier
            message: User message
            coaching_type: Type of coaching (motivation, planning, reflection)
            
        Returns:
            Coaching response with context
        """
        # Enhance query with coaching context
        enhanced_query = f"[{coaching_type.upper()} COACHING] {message}"
        
        # Get RAG response
        rag_response = self.retrieve_and_generate(user_id, enhanced_query)
        
        # Add coaching-specific enhancements
        rag_response["coaching_type"] = coaching_type
        rag_response["personalized"] = len(rag_response["context_used"]["relevant_data"]) > 0
        
        return rag_response
    
    def analyze_user_patterns(self, user_id: str) -> Dict[str, Any]:
        """
        Analyze user patterns using vector search
        
        Args:
            user_id: User identifier
            
        Returns:
            Pattern analysis
        """
        # Search for different types of patterns
        pattern_queries = [
            "motivation and energy levels",
            "goals and achievements",
            "challenges and obstacles",
            "positive experiences and success",
            "mood and emotional state"
        ]
        
        patterns = {}
        for query in pattern_queries:
            results = self.vector_store.search_user_data(user_id, query, k=5)
            patterns[query] = results
        
        return {
            "user_id": user_id,
            "patterns": patterns,
            "analysis_timestamp": datetime.now().isoformat(),
            "total_data_points": sum(len(results) for results in patterns.values())
        }
    
    def get_system_stats(self) -> Dict[str, Any]:
        """Get RAG system statistics"""
        vector_stats = self.vector_store.get_stats()
        
        return {
            "rag_system": {
                "model_name": self.model_name,
                "ollama_url": self.ollama_url,
                "status": "operational"
            },
            "vector_store": vector_stats,
            "timestamp": datetime.now().isoformat()
        }

# Demo and testing
if __name__ == "__main__":
    print("🧠 RAG System Demo")
    print("=" * 50)
    
    # Initialize RAG system
    rag = RAGSystem()
    
    # Add sample user data
    user_id = "demo_user"
    
    sample_interactions = [
        ("checkin", "Had a great workout this morning! Feeling energized and ready for the day."),
        ("goal", "I want to exercise 4 times a week and improve my overall fitness."),
        ("reflection", "I've been struggling with consistency lately, need better motivation."),
        ("mood", "Feeling a bit overwhelmed with work but trying to stay positive."),
        ("activity", "Completed a 30-minute yoga session, very relaxing."),
        ("checkin", "Skipped gym today, feeling guilty about it."),
        ("achievement", "Reached my weekly exercise goal! Very proud of myself.")
    ]
    
    print("📝 Adding sample user interactions...")
    for interaction_type, content in sample_interactions:
        doc_id = rag.add_user_interaction(user_id, interaction_type, content)
        print(f"  Added {interaction_type}: {content[:40]}...")
    
    print(f"\n📊 System Stats:")
    stats = rag.get_system_stats()
    print(f"  Vector Store: {stats['vector_store']['total_documents']} documents")
    print(f"  Model: {stats['rag_system']['model_name']}")
    
    # Test RAG response
    print("\n🤖 Testing RAG Response:")
    query = "I'm feeling unmotivated about exercise lately, can you help?"
    response = rag.retrieve_and_generate(user_id, query)
    
    print(f"Query: {query}")
    print(f"Response: {response['response']}")
    print(f"Context types used: {list(response['context_used']['relevant_data'].keys())}")
    
    # Test coaching response
    print("\n🎯 Testing Coaching Response:")
    coaching_response = rag.get_coaching_response(user_id, "Help me stay motivated", "motivation")
    print(f"Coaching Type: {coaching_response['coaching_type']}")
    print(f"Personalized: {coaching_response['personalized']}")
    print(f"Response: {coaching_response['response'][:100]}...")
    
    # Test pattern analysis
    print("\n📈 Testing Pattern Analysis:")
    patterns = rag.analyze_user_patterns(user_id)
    print(f"Total data points analyzed: {patterns['total_data_points']}")
    print(f"Pattern categories: {list(patterns['patterns'].keys())}")
    
    print("\n✅ RAG System working perfectly!") 