#!/bin/bash

echo "🚀 Setting up Momentum AI - Local AI Stack"
echo "=========================================="

# Install Ollama (Local LLM Runtime)
echo "📦 Installing Ollama..."
if ! command -v ollama &> /dev/null; then
    curl -fsSL https://ollama.com/install.sh | sh
    echo "✅ Ollama installed successfully"
else
    echo "✅ Ollama already installed"
fi

# Start Ollama service
echo "🔄 Starting Ollama service..."
ollama serve &
sleep 5

# Pull required models
echo "🧠 Downloading AI models..."
echo "This may take a while for the first time..."

# Lightweight models for different coaching styles
echo "Downloading Llama 3.2 (3B) - Momentum Master Coach..."
ollama pull llama3.2:3b

echo "Downloading Phi-3 Mini - Empathy Coach..."
ollama pull phi3:mini

echo "Downloading Mistral (7B) - Performance Optimizer..."
ollama pull mistral:7b

# Test models
echo "🧪 Testing AI models..."
echo "Testing Llama 3.2..."
ollama run llama3.2:3b "Hello, I'm testing the coaching AI. Please respond with motivation." --format json

echo "Testing Phi-3..."
ollama run phi3:mini "Provide a supportive response for someone struggling with goals." --format json

echo "Testing Mistral..."
ollama run mistral:7b "Give productivity advice in 50 words or less." --format json

echo "✅ All models downloaded and tested successfully!"
echo ""
echo "🎯 Setup Complete! Your local AI stack is ready:"
echo "   - Ollama running on: http://localhost:11434"
echo "   - Models available: llama3.2:3b, phi3:mini, mistral:7b"
echo "   - Privacy: All AI processing happens locally"
echo "   - Cost: $0 per request (vs $0.01-0.03 per request for cloud APIs)"
echo ""
echo "💡 Next steps:"
echo "   1. Restart your app: npm run dev"
echo "   2. Set environment variable: EXPO_PUBLIC_AI_PROVIDER=ollama"
echo "   3. Test the AI coach in your app!"
echo ""
echo "📊 Model Performance:"
echo "   - Llama 3.2: Best for general coaching, pattern analysis"
echo "   - Phi-3: Excellent for empathy, emotional support"
echo "   - Mistral: Optimized for productivity, tactical advice"
echo ""
echo "🔧 To add more models: ollama pull <model-name>"
echo "🔧 To stop Ollama: killall ollama"
echo "🔧 To check status: ollama ps" 