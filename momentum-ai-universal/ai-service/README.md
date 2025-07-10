# 🚀 Momentum AI Backend Service

A comprehensive AI backend service for the Momentum AI React Native app, featuring real-time coaching, behavior analysis, drift prediction, and future planning.

## 🎯 Features

### Core AI Capabilities
- **Smart Coaching**: Context-aware AI coach with personalized responses
- **Behavior Analysis**: Real-time pattern recognition and user behavior tracking
- **Drift Prediction**: Proactive intervention when users lose momentum
- **Future Planning**: AI-powered goal strategies and timeline generation
- **Semantic Search**: Find similar contexts and conversations using embeddings

### Technical Stack
- **FastAPI**: High-performance async web framework
- **Nomic & LLMWare**: State-of-the-art embeddings and RAG
- **FAISS/Milvus/PGVector**: Fast similarity search and clustering
- **Llama/Mistral/Gemma**: Open source language models via Ollama
- **Supabase**: Real-time database integration
- **Streamlit**: AI monitoring dashboard

## 🛠️ Installation

### Prerequisites
- Python 3.9+
- Node.js 18+ (for React Native app)
- Ollama (for local LLM hosting)
- PostgreSQL (via Supabase)
- Redis (optional, for caching)

### Setup Steps

1. **Clone and Install Dependencies**
```bash
cd ai-service
pip install -r requirements.txt
```

2. **Install Ollama**
```bash
# macOS/Linux
curl https://ollama.ai/install.sh | sh

# Windows
# Download from https://ollama.ai/download
```

3. **Pull Required Models**
```bash
# Pull base models
ollama pull llama2-7b-chat
ollama pull mistral-7b
ollama pull gemma-7b
ollama pull qwen-7b
```

4. **Environment Configuration**
Create a `.env` file with the following variables:
```env
# Database Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
DATABASE_URL=your_database_url

# LLM Configuration (Ollama)
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama2-7b-chat  # or mistral-7b, gemma-7b, qwen-7b

# Embeddings Configuration
EMBEDDING_PROVIDER=nomic  # or jina, llmware
EMBEDDING_MODEL=nomic-embed-text-v1
EMBEDDING_DIMENSION=768

# Vector Store Configuration
VECTOR_STORE=faiss  # or milvus, pgvector
MILVUS_HOST=localhost
MILVUS_PORT=19530

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
LOG_LEVEL=INFO

# Cache Configuration (Optional)
REDIS_URL=redis://localhost:6379

# Streamlit Configuration (Optional)
STREAMLIT_PORT=8501
STREAMLIT_THEME=dark
```

5. **Start Services**
```bash
# Start Ollama
ollama serve

# Start API server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Start Streamlit dashboard (optional)
streamlit run dashboard.py
```

## 📈 Performance Optimization

### Vector Search Strategy
- FAISS for in-memory vector search (default)
- Milvus for distributed vector search
- PGVector for PostgreSQL-native vector operations

### Model Selection
- Llama 2 7B Chat: General purpose coaching (default)
- Mistral 7B: Enhanced reasoning capabilities
- Gemma 7B: Efficient and compact model
- Qwen 7B: Strong multilingual support

### Caching Strategy
- Redis for frequent queries
- In-memory LRU cache for embeddings
- Persistent vector storage

### Scalability Features
- Async processing for all AI operations
- Batch processing for embeddings
- Distributed vector search support
- Load balancing ready

## 🔧 Integration with React Native App

### Update lib/config.ts
```typescript
export const AI_CONFIG = {
  BASE_URL: 'http://your-ai-service:8000',
  ENDPOINTS: {
    SMART_COACH: '/api/ai/smart-coach',
    BEHAVIOR_TRACK: '/api/ai/track-behavior',
    DRIFT_PREDICT: '/api/ai/predict-drift',
    INSIGHTS: '/api/ai/insights',
    FUTURE_PLAN: '/api/ai/future-planning'
  }
}
```

## 📚 Additional Resources

- [Ollama Documentation](https://ollama.ai/docs)
- [Nomic Documentation](https://docs.nomic.ai)
- [LLMWare Documentation](https://docs.llmware.ai)
- [FAISS Documentation](https://github.com/facebookresearch/faiss/wiki)
- [Milvus Documentation](https://milvus.io/docs)
- [PGVector Documentation](https://github.com/pgvector/pgvector)

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our repository.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- GitHub Issues for bug reports
- Documentation: [link-to-docs]
- Community Discord: [link-to-discord]

---

**Built with ❤️ for the Momentum AI community** 