"""
Example script to test the RAG system
"""
import os
import sys

from ai_service.config.ai_config import AIConfig
from ai_service.services.ollama_service import OllamaService
from ai_service.services.vector_store import VectorStoreService
from ai_service.services.rag_service import RAGService

def main():
    # Initialize configuration
    config = AIConfig()
    
    # Initialize services
    ollama_service = OllamaService(config)
    vector_store = VectorStoreService(config)
    rag_service = RAGService(config, ollama_service, vector_store)
    
    # Add some test documents
    documents = [
        {
            "text": "Python is a high-level programming language known for its simplicity and readability.",
            "metadata": {"source": "python_docs", "type": "definition"}
        },
        {
            "text": "Python supports multiple programming paradigms, including procedural, object-oriented, and functional programming.",
            "metadata": {"source": "python_docs", "type": "features"}
        },
        {
            "text": "Python's package manager pip makes it easy to install and manage third-party libraries.",
            "metadata": {"source": "python_docs", "type": "tools"}
        }
    ]
    
    print("Adding documents to RAG system...")
    rag_service.add_documents(documents)
    
    # Test queries
    queries = [
        "What is Python?",
        "How do you install Python packages?",
        "What programming paradigms does Python support?"
    ]
    
    print("\nTesting RAG system with queries:")
    for query in queries:
        print(f"\nQuery: {query}")
        result = rag_service.generate_response(query)
        print(f"Response: {result['response']}")
        print("\nRetrieved documents:")
        for doc in result['retrieved_documents']:
            print(f"- {doc['text']} (score: {doc['score']:.2f})")
            
    # Test chat interface
    messages = [
        {"role": "system", "content": "You are a helpful Python programming assistant."},
        {"role": "user", "content": "Tell me about Python's package management."}
    ]
    
    print("\nTesting chat interface:")
    result = rag_service.chat_with_rag(messages)
    print(f"Response: {result['response']}")
    
    # Save vector store
    print("\nSaving vector store...")
    vector_store.save()

if __name__ == "__main__":
    main() 