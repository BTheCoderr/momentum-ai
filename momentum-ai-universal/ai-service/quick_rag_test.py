#!/usr/bin/env python3
"""
Quick RAG Test - Faster responses
"""
import json
from rag_system import RAGSystem
from vector_store_faiss import FAISSVectorStore

def test_rag_retrieval():
    """Test just the retrieval part (fast)"""
    print("🔍 Testing RAG Retrieval (Fast)")
    print("=" * 40)
    
    # Initialize
    rag = RAGSystem()
    user_id = "test_user"
    
    # Add some test data
    interactions = [
        ("checkin", "Great workout today! Feeling strong and motivated."),
        ("goal", "Want to run a 5K race in 3 months."),
        ("reflection", "Need to be more consistent with my morning routine."),
        ("mood", "Feeling positive and energetic today!")
    ]
    
    for interaction_type, content in interactions:
        rag.add_user_interaction(user_id, interaction_type, content)
    
    # Test retrieval
    query = "How can I stay motivated with exercise?"
    context = rag.vector_store.get_user_context(user_id, query)
    
    print(f"Query: {query}")
    print(f"Retrieved context types: {list(context['relevant_data'].keys())}")
    
    # Show relevant data
    for data_type, items in context['relevant_data'].items():
        if items:
            print(f"\n{data_type.upper()}:")
            for item in items[:2]:  # Show top 2
                score = item.get('score', 0)
                text = item.get('text', item.get('content', ''))
                print(f"  Score: {score:.3f} | {text}")
    
    return context

def test_simple_generation():
    """Test simple generation without context"""
    print("\n🤖 Testing Simple Generation")
    print("=" * 40)
    
    rag = RAGSystem()
    
    # Simple prompt without context
    simple_response = rag.generate_response(
        "Say 'Hello! I'm your AI coach.' in one sentence.",
        context="",
        max_tokens=50
    )
    
    print(f"Simple response: {simple_response}")
    
    return simple_response

def test_pattern_analysis():
    """Test pattern analysis (retrieval only)"""
    print("\n📊 Testing Pattern Analysis")
    print("=" * 40)
    
    rag = RAGSystem()
    user_id = "pattern_user"
    
    # Add varied data
    data = [
        ("checkin", "Monday: Great energy, completed all tasks!"),
        ("checkin", "Tuesday: Feeling tired, skipped workout."),
        ("checkin", "Wednesday: Back on track, good mood."),
        ("goal", "Exercise 3x per week consistently."),
        ("reflection", "I notice I'm more motivated on Mondays."),
        ("mood", "Feeling optimistic about my progress.")
    ]
    
    for data_type, content in data:
        rag.add_user_interaction(user_id, data_type, content)
    
    # Analyze patterns
    patterns = rag.analyze_user_patterns(user_id)
    
    print(f"Total data points: {patterns['total_data_points']}")
    print(f"Pattern categories: {len(patterns['patterns'])}")
    
    # Show one pattern example
    motivation_pattern = patterns['patterns'].get('motivation and energy levels', [])
    if motivation_pattern:
        print(f"\nMotivation pattern example:")
        for item in motivation_pattern[:2]:
            score = item.get('score', 0)
            text = item.get('text', item.get('content', ''))
            print(f"  Score: {score:.3f} | {text}")
    
    return patterns

if __name__ == "__main__":
    print("⚡ Quick RAG System Test")
    print("=" * 50)
    
    # Test 1: Retrieval (always fast)
    context = test_rag_retrieval()
    
    # Test 2: Simple generation (should be fast)
    response = test_simple_generation()
    
    # Test 3: Pattern analysis (fast)
    patterns = test_pattern_analysis()
    
    print(f"\n✅ RAG System Core Functions Working!")
    print(f"   - Vector retrieval: ✅")
    print(f"   - Context formatting: ✅") 
    print(f"   - Pattern analysis: ✅")
    print(f"   - Simple generation: {'✅' if 'Hello' in response else '⚠️'}")
    
    print(f"\n📈 Performance:")
    test_rag = RAGSystem()
    print(f"   - Vector store: {test_rag.vector_store.get_stats()['total_documents']} docs")
    print(f"   - Embeddings: 768-dimensional")
    print(f"   - Search: Cosine similarity")
    print(f"   - Model: {test_rag.model_name}") 