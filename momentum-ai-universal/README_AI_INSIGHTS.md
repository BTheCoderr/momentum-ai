# AI-Powered Insights System 🧠

## Overview
Your Momentum AI app now has a comprehensive AI insights system powered by Claude 3 that analyzes user check-in patterns and provides personalized coaching.

## What's Been Added

### ✅ Core AI Functions
- **`generateInsights(userId)`** - Analyzes check-in history to find behavioral patterns
- **`getSuggestions(userId)`** - Creates actionable recommendations based on patterns
- **`callClaude(prompt)`** - Direct interface to Claude 3 API
- **`getCoachingMessage(userId, context?)`** - Personalized motivational messages
- **`getComprehensiveAnalysis(userId)`** - Complete analysis combining all AI features

### ✅ New Components
- **`AIInsightsCard`** - Beautiful tabbed interface showing insights, suggestions, and coaching
- **Updated SmartSuggestions** - Now uses Claude-powered suggestions
- **Integration with existing services** - Seamlessly works with your current app

### ✅ Features
- **Pattern Recognition**: Identifies mood, energy, and behavioral trends
- **Smart Suggestions**: Specific, actionable advice based on user data
- **Motivational Coaching**: Personalized messages that adapt to user progress
- **Progress Tracking**: Visual stats showing check-in consistency and averages
- **Graceful Fallbacks**: Works even without Claude API key (uses intelligent defaults)

## How It Works

### 1. Data Analysis
```typescript
// Analyzes recent check-ins for patterns
const insights = await generateInsights(userId);
// Example output:
// • Your energy peaks around 10 AM - schedule important tasks then
// • You handle stress better after completing morning routines
// • Your mood improves significantly on days you journal
```

### 2. Smart Suggestions
```typescript
// Generates actionable recommendations
const suggestions = await getSuggestions(userId);
// Example output:
// • Block 9-11 AM for deep work when your energy is highest
// • Try a 5-minute breathing exercise when stress hits 4/5
// • Set a daily journaling reminder for 7 AM
```

### 3. Coaching Messages
```typescript
// Provides personalized encouragement
const message = await getCoachingMessage(userId, "I'm feeling stressed");
// Example output:
// "I notice you've been consistent with check-ins for 12 days - that's fantastic! 
// Your data shows you handle stress best after morning routines. 
// Maybe try that 5-minute breathing exercise we discussed?"
```

## Configuration

### Environment Variables
Add one of these to your environment:
```bash
# Option 1: Claude API key
CLAUDE_API_KEY=your_claude_api_key_here

# Option 2: Anthropic API key
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Option 3: Generic AI key
AI_API_KEY=your_claude_api_key_here
```

### Getting Your Claude API Key
1. Go to [Anthropic Console](https://console.anthropic.com)
2. Create an account or sign in
3. Go to API Keys section
4. Create a new API key
5. Add it to your environment variables

## Integration Points

### In Your Screens
```typescript
// Use the new AI insights card
import { AIInsightsCard } from '../components/AIInsightsCard';

// In your component
<AIInsightsCard userId={userId} />
```

### In Your Services
```typescript
// Get AI insights
const insights = await aiServices.getInsights(userId);

// Get suggestions
const suggestions = await getSuggestions(userId);

// Get coaching message
const message = await getCoachingMessage(userId, userMessage);
```

## Current Integration Status

### ✅ Fixed Issues
- **Database**: Created missing `checkins` table
- **Modal Buttons**: Fixed "Do Check-In" and "Set Goals" navigation
- **AI Context**: Chat now gets proper context from check-ins
- **Integration**: All parts now communicate properly

### ✅ New Capabilities
- **Pattern Analysis**: Finds trends in mood, energy, and behavior
- **Smart Coaching**: Contextual advice based on user data
- **Progress Tracking**: Visual insights about user improvement
- **Fallback System**: Works even without API key

## Usage Examples

### Basic Usage
```typescript
// Get comprehensive analysis
const analysis = await getComprehensiveAnalysis(userId);
console.log(analysis.insights);      // Pattern insights
console.log(analysis.suggestions);   // Actionable tips
console.log(analysis.coachingMessage); // Motivational message
console.log(analysis.stats);         // Progress statistics
```

### Advanced Usage
```typescript
// Custom coaching with context
const contextualMessage = await getCoachingMessage(
  userId, 
  "I completed my morning routine and feel energized!"
);

// Get specific insights
const patterns = await generateInsights(userId);
const actionableTips = await getSuggestions(userId);
```

## Files Added/Modified

### New Files
- `lib/ai-insights.ts` - Core AI system
- `lib/claude-config.ts` - Claude API configuration
- `lib/environment.ts` - Environment management
- `components/AIInsightsCard.tsx` - UI component
- `lib/migrations/006_create_checkins_table.sql` - Database fix

### Modified Files
- `screens/InsightsScreen.tsx` - Fixed modal buttons
- `components/SmartSuggestions.tsx` - Added Claude integration
- `lib/services.ts` - Updated AI services integration

## Next Steps

1. **Add your Claude API key** to environment variables
2. **Run the app** - AI insights will work with fallbacks even without the key
3. **Test the features** - Try the "Do Check-In" and "Set Goals" buttons
4. **Check the insights** - See AI analysis in the InsightsScreen

## Testing

The system is designed to work immediately:
- ✅ **With Claude API Key**: Full AI-powered insights
- ✅ **Without API Key**: Intelligent fallback responses
- ✅ **Offline Mode**: Cached insights from previous sessions
- ✅ **New Users**: Encouraging messages to start building patterns

Your app now has a sophisticated AI coaching system that grows smarter with each check-in! 🚀 