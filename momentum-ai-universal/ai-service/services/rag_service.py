"""
Service for RAG (Retrieval Augmented Generation) using LLMWare
"""
from typing import List, Dict, Any, Optional
import numpy as np
from llmware.configs import LLMWareConfig
from llmware.embeddings import EmbeddingHandler
from llmware.prompts import PromptHandler
from llmware.retrieval import SemanticRetriever

from ai_service.services.ollama_service import OllamaService
from ai_service.services.vector_store import VectorStoreService
from ai_service.config.ai_config import AIConfig

class RAGService:
    def __init__(
        self,
        config: AIConfig,
        ollama_service: OllamaService,
        vector_store: VectorStoreService
    ):
        self.config = config
        self.ollama_service = ollama_service
        self.vector_store = vector_store
        
        # Initialize LLMWare components
        self.embedding_handler = EmbeddingHandler()
        self.prompt_handler = PromptHandler()
        
    def add_documents(self, documents: List[Dict[str, Any]]) -> None:
        """
        Add documents to the RAG system
        
        Args:
            documents: List of document dictionaries with text and metadata
        """
        # Generate embeddings
        texts = [doc["text"] for doc in documents]
        embeddings = self.embedding_handler.embed_texts(texts)
        
        # Add to vector store
        self.vector_store.add_documents(documents, embeddings)
        
    def generate_response(
        self,
        query: str,
        k: int = 3,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Generate response using RAG
        
        Args:
            query: User query
            k: Number of documents to retrieve
            temperature: Model temperature
            max_tokens: Maximum tokens to generate
            
        Returns:
            Dictionary containing response and retrieved documents
        """
        # Generate query embedding
        query_embedding = self.embedding_handler.embed_text(query)
        
        # Retrieve relevant documents
        retrieved_docs = self.vector_store.search(query_embedding, k=k)
        
        # Build context from retrieved documents
        context = "\n\n".join([doc["text"] for doc in retrieved_docs])
        
        # Generate prompt
        prompt = self.prompt_handler.create_qa_prompt(
            query=query,
            context=context
        )
        
        # Generate response
        response = self.ollama_service.generate(
            prompt=prompt,
            temperature=temperature,
            max_tokens=max_tokens
        )
        
        return {
            "response": response,
            "retrieved_documents": retrieved_docs
        }
        
    def chat_with_rag(
        self,
        messages: List[Dict[str, str]],
        k: int = 3,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Chat with RAG system
        
        Args:
            messages: List of message dictionaries with role and content
            k: Number of documents to retrieve
            temperature: Model temperature
            max_tokens: Maximum tokens to generate
            
        Returns:
            Dictionary containing response and retrieved documents
        """
        # Get last user message
        last_user_msg = None
        for msg in reversed(messages):
            if msg["role"] == "user":
                last_user_msg = msg["content"]
                break
                
        if not last_user_msg:
            raise ValueError("No user message found in chat history")
            
        # Generate response using RAG
        rag_result = self.generate_response(
            query=last_user_msg,
            k=k,
            temperature=temperature,
            max_tokens=max_tokens
        )
        
        return rag_result 