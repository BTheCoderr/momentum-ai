#!/usr/bin/env python3
"""
Simple test script for our AI setup
"""
import requests
import json

def test_ollama_connection():
    """Test if Ollama is running and accessible"""
    try:
        response = requests.get('http://localhost:11434/api/tags', timeout=5)
        if response.status_code == 200:
            print("✅ Ollama is running!")
            models = response.json().get('models', [])
            if models:
                print(f"📦 Available models: {[m['name'] for m in models]}")
            else:
                print("📦 No models found. Let's install llama2...")
                return False
            return True
        else:
            print(f"❌ Ollama responded with status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Could not connect to Ollama: {e}")
        return False

def test_basic_chat():
    """Test basic chat functionality with Ollama"""
    try:
        payload = {
            "model": "llama2",
            "prompt": "Hello! Please respond with just 'AI is working!' and nothing else.",
            "stream": False
        }
        
        response = requests.post(
            'http://localhost:11434/api/generate',
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Chat test successful!")
            print(f"🤖 Response: {result.get('response', 'No response')}")
            return True
        else:
            print(f"❌ Chat test failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Chat test error: {e}")
        return False

def main():
    print("🚀 Testing AI Setup...")
    print("=" * 50)
    
    # Test 1: Ollama connection
    print("\n1. Testing Ollama connection...")
    if not test_ollama_connection():
        print("\n⚠️  Ollama is not running or llama2 model is not installed.")
        print("Please run: ollama pull llama2")
        return
    
    # Test 2: Basic chat
    print("\n2. Testing basic chat...")
    if test_basic_chat():
        print("\n🎉 All tests passed! Your AI setup is working!")
    else:
        print("\n❌ Chat test failed. Check Ollama logs.")
    
    print("\n" + "=" * 50)
    print("🎯 Next steps:")
    print("1. Set up FAISS for vector search")
    print("2. Implement RAG with LLMWare")
    print("3. Create custom model configurations")

if __name__ == "__main__":
    main() 