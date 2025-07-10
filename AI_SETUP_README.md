# 🤖 Momentum AI - Machine Learning Setup

## Overview
Your AI-powered accountability system with **real pattern recognition** and behavioral analysis.

## 🚀 Quick Start

### 1. Install AI Service Dependencies
```bash
# Create Python virtual environment
cd ai-service
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install ML dependencies
pip install -r requirements.txt
```

### 2. Start AI Service
```bash
# Start the FastAPI ML service
python main.py

# Should start on http://localhost:8001
```

### 3. Environment Variables
```bash
# Add to your .env.local
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:8001
```

### 4. Test AI Integration
```bash
# Test the API
curl -X POST http://localhost:8001/api/track-behavior \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test123",
    "timestamp": "2024-01-01T10:00:00Z",
    "action_type": "goal_update",
    "progress_delta": 0.1
  }'
```

## 🧠 AI Features

### 1. **Drift Prediction**
- Predicts when users will abandon goals
- Risk scoring (0-1 scale)
- Confidence intervals
- Intervention recommendations

### 2. **Behavioral Analysis**
- Engagement patterns
- Time-based activity analysis
- Progress trend detection
- Sentiment tracking

### 3. **Pattern Recognition**
- Daily/weekly routine detection
- Session duration analysis
- Streak calculations
- Consistency scoring

## 📊 Data Collection Points

### Automatic Tracking
```typescript
// In your React components
import { aiClient } from '@/lib/ai-client';

// Track goal updates
await aiClient.trackGoalUpdate(userId, goalId, progressDelta);

// Track chat interactions
await aiClient.trackChatInteraction(userId, sessionDuration, sentimentScore);

// Track daily check-ins
await aiClient.trackDailyCheckin(userId);

// Track app opens
await aiClient.trackAppOpen(userId);
```

### Custom Tracking
```typescript
await aiClient.trackBehavior({
  user_id: "user123",
  timestamp: new Date().toISOString(),
  action_type: "custom_action",
  goal_id: "goal456",
  progress_delta: 0.05,
  sentiment_score: 0.8,
  session_duration: 300
});
```

## 🔮 AI Predictions

### Risk Assessment
```typescript
const prediction = await aiClient.predictDrift(userId, 7); // 7 days ahead

console.log({
  riskScore: prediction.risk_score,        // 0.0 - 1.0
  driftDate: prediction.predicted_drift_date,
  interventions: prediction.intervention_recommendations,
  confidence: prediction.confidence
});
```

### User Insights
```typescript
const insights = await aiClient.getUserInsights(userId);

console.log({
  totalActions: insights.total_actions,
  currentStreak: insights.current_streak,
  activityPatterns: insights.activity_patterns,
  features: insights.features
});
```

## 🎯 Intervention System

### Risk Levels
- **0.0-0.3**: ✅ Low Risk - User on track
- **0.3-0.6**: ⚠️ Medium Risk - Watch closely
- **0.6-0.8**: 🚨 High Risk - Intervention needed
- **0.8-1.0**: 💀 Critical - Immediate action

### Auto Interventions
- Push notifications for inactive users
- Goal breakdown suggestions
- Motivational content delivery
- Routine adjustment recommendations

## 🔧 Advanced Configuration

### Model Training
```python
# Train custom models with your data
from sklearn.ensemble import RandomForestClassifier

# Add to ai-service/main.py
def train_custom_model(user_data):
    # Your custom ML model training
    model = RandomForestClassifier()
    # ... training logic
    return model
```

### Real-time Analytics
```python
# Add Redis for real-time pattern detection
import redis

r = redis.Redis(host='localhost', port=6379, db=0)

# Stream behavioral data
def stream_behavior(user_id, behavior):
    r.lpush(f"user:{user_id}:stream", json.dumps(behavior))
```

## 📈 Production Deployment

### Docker Setup
```dockerfile
# ai-service/Dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8001

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
```

### Kubernetes
```yaml
# k8s/ai-service.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: momentum-ai-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: momentum-ai-service
  template:
    metadata:
      labels:
        app: momentum-ai-service
    spec:
      containers:
      - name: ai-service
        image: momentum-ai/ai-service:latest
        ports:
        - containerPort: 8001
```

### Database Integration
```python
# Replace in-memory storage with PostgreSQL
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql://user:password@localhost/momentum_ai"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
```

## 🔍 Monitoring & Analytics

### Health Checks
```bash
# Check AI service health
curl http://localhost:8001/health

# Check model performance
curl http://localhost:8001/api/model-stats
```

### Metrics Dashboard
- Prediction accuracy
- API response times
- User engagement trends
- Model drift detection

## 🛠️ Troubleshooting

### Common Issues
1. **Import Errors**: Ensure all Python dependencies installed
2. **Port Conflicts**: Change AI service port in config
3. **CORS Issues**: Add proper CORS headers for web requests
4. **Memory Issues**: Optimize pandas operations for large datasets

### Debug Mode
```python
# Enable debug logging
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 🚀 Next Steps

1. **Start with basic tracking** - Goal updates and check-ins
2. **Collect 1-2 weeks of data** - Build user behavior baseline
3. **Enable predictions** - Start with simple risk scoring
4. **Add interventions** - Automated notifications and suggestions
5. **Advanced ML** - Custom models, deep learning, NLP

---

**Your AI system is now ready to predict user behavior and prevent goal abandonment! 🎯** 