# 🚀 RAG Integration Setup Guide

## ✅ **STEP 1: Start the RAG Service**

### Option A: Quick Start (Recommended)
```bash
# Navigate to ai-service directory
cd ai-service

# Activate virtual environment
source ../ai-env/bin/activate

# Start the RAG service
python react_native_integration.py
```

### Option B: Background Service
```bash
# Start in background
cd ai-service && python react_native_integration.py &

# Check if running
curl http://localhost:8000/
```

## ✅ **STEP 2: Test the Integration**

### Quick Test
```bash
# Test the service
node test_rag_live.js
```

Expected output:
```
🧪 Testing RAG Service Integration
✅ Service is healthy: healthy
✅ Added checkin: Added checkin for user test-user-live
✅ RAG Chat Response:
📝 Response: I understand that motivation can be challenging...
📊 Context Used: ['checkin', 'goal', 'reflection']
🎯 Confidence: 0.85
```

## ✅ **STEP 3: Use in Your React Native App**

### Your ChatScreen is Already Upgraded!
The `screens/ChatScreen.tsx` has been enhanced with:

- **🧠 Smart Memory Toggle**: Turn RAG on/off
- **📊 Context Display**: Shows what context was used
- **🎯 Confidence Scores**: AI confidence levels
- **🛡️ Automatic Fallback**: Works even if RAG fails

### Key Features Added:

1. **RAG-Powered Responses**
   ```typescript
   // Automatically uses RAG when enabled
   const response = await fetch('http://localhost:8000/chat', {
     method: 'POST',
     body: JSON.stringify({
       message: inputText,
       userId: userId,
       coachingType: selectedCoach.type,
     }),
   });
   ```

2. **Context Tracking**
   ```typescript
   // Every interaction is tracked for future context
   await trackUserInteraction(userId, 'checkin', inputText);
   ```

3. **Smart Fallback**
   ```typescript
   // Falls back to existing service if RAG fails
   if (ragError) {
     response = await messageServices.sendMessage(inputText);
   }
   ```

## ✅ **STEP 4: Enhanced Services Available**

### Use Enhanced Services (Optional)
Replace your existing service calls with RAG-enhanced versions:

```typescript
// Instead of:
import { messageServices } from './lib/services';

// Use:
import { messageServices } from './lib/services-rag-enhanced';
```

### Available Enhanced Services:

1. **Enhanced Message Service**
   - RAG-powered responses
   - Automatic context tracking
   - Contextual fallbacks

2. **Enhanced Check-in Service**
   - Tracks check-ins for future context
   - Provides insights based on patterns

3. **Enhanced Goal Service**
   - AI-powered goal coaching
   - Progress tracking with context

4. **Enhanced Insights Service**
   - Personalized insights from user data
   - Pattern analysis and recommendations

## 🎯 **How It Works**

### The Magic Behind RAG:

1. **User Interaction** → Tracked in vector store
2. **New Message** → Searches similar past interactions
3. **Context Retrieved** → Relevant goals, check-ins, reflections
4. **AI Response** → Generated with full user context
5. **Personalized Coaching** → Based on user's actual history

### Example Flow:
```
User: "I'm feeling unmotivated"
↓
RAG finds: Previous workouts, energy patterns, goals
↓
AI Response: "Last week you pushed through by going for a walk. 
Your energy is usually higher in mornings. Want to try that again?"
```

## 🔧 **Configuration Options**

### In ChatScreen:
- **Smart Memory Toggle**: Users can turn RAG on/off
- **Coach Selection**: Different coaching styles (motivational, analytical, supportive)
- **Context Display**: Shows what data was used for responses

### Service Configuration:
```typescript
// In lib/rag-client.ts
const ragClient = new RAGClient('http://localhost:8000', true);

// Fallback enabled by default
// Will use existing services if RAG fails
```

## 📊 **Monitoring & Debug**

### Check System Status:
```bash
curl http://localhost:8000/system-stats
```

### View User Context:
```bash
curl "http://localhost:8000/user-context/USER_ID?query=motivation"
```

### Get User Patterns:
```bash
curl http://localhost:8000/user-patterns/USER_ID
```

## 🚀 **Next Steps**

### Immediate Value (Working Now):
- ✅ Contextual chat responses
- ✅ User interaction tracking
- ✅ Pattern analysis
- ✅ Fallback support

### Coming Next (Path B & C):
- ⚡ Groq integration for faster responses
- 🧠 Claude integration for deeper insights
- 📈 Predictive analytics
- 🎯 Goal progress scoring

## 🛡️ **Troubleshooting**

### Service Not Starting:
```bash
# Check if port is in use
lsof -ti :8000

# Kill existing service
kill $(lsof -ti :8000)

# Restart
cd ai-service && python react_native_integration.py
```

### RAG Not Working:
- Check service is running: `curl http://localhost:8000/`
- Check logs in terminal where service is running
- App will automatically fall back to existing services

### No Context Retrieved:
- Add some user interactions first (check-ins, goals)
- Wait a moment for vector indexing
- Check user ID matches between app and service

## 🎉 **You're Ready!**

Your app now has:
- **Memory**: Remembers user goals, check-ins, progress
- **Context**: AI responses based on user's actual history
- **Intelligence**: Pattern recognition and personalized coaching
- **Reliability**: Fallback to existing services if needed

**Test it now**: Open ChatScreen, toggle "Smart Memory: ON", and ask about motivation or goals!

---

**Need help?** Check the logs in the terminal where the RAG service is running for detailed debugging information. 