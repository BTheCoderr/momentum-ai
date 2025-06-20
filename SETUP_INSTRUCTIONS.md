# 🚀 Momentum AI - Complete Setup Guide

## Quick Start (5 minutes)

### 1. Database Setup (Manual - Required)

Since the automated schema setup requires special permissions, follow these steps:

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Open the SQL Editor** (left sidebar)
3. **Copy and paste the entire contents** of `supabase_schema.sql` into the SQL editor
4. **Click "Run"** to execute all the SQL statements

This will create:
- `user_events` table (for check-ins and behavioral data)
- `insights` table (for AI-generated coaching insights)  
- `user_streaks` table (for tracking consistency)
- All necessary indexes and RLS policies

### 2. AI Setup (Optional but Recommended)

1. **Get a free Groq API key**: https://console.groq.com/
2. **Add it to your `.env.local` file**:
   ```bash
   GROQ_API_KEY=your_actual_groq_key_here
   ```

### 3. Start the App

```bash
npm run dev
```

Visit http://localhost:3000 and you're ready to go! 🎉

---

## 🧠 What You Just Built

### Core Features
- **Daily Check-ins**: Mood, energy, progress tracking
- **AI Insights**: Personalized behavioral coaching with Groq
- **Pattern Recognition**: Identifies energy peaks, mood trends, productivity patterns
- **Streak Tracking**: Gamified consistency tracking
- **Shareable Cards**: Instagram-ready insight sharing

### AI Brain Architecture
```
User Check-in → Behavioral Analysis → AI Insight Generation → Personalized Coaching
     ↓                    ↓                      ↓                      ↓
  Database            Pattern Detection      Groq API              User Interface
```

### Database Schema
- **user_events**: Every user interaction (check-ins, mood, energy, wins, challenges)
- **insights**: AI-generated coaching messages with tags and ratings
- **user_streaks**: Consistency tracking and gamification

---

## 🎯 Y Combinator-Level Features

### Phase 1: AI Brain ✅
- [x] Behavioral data collection
- [x] AI insight generation with Groq
- [x] Pattern recognition algorithms
- [x] Personalized coaching prompts

### Phase 2: Retention Engine 🚧
- [ ] Daily notification system
- [ ] Habit streak gamification
- [ ] Weekly insight summaries
- [ ] Progress milestone celebrations

### Phase 3: Social & Viral 🚧
- [ ] Accountability partner system
- [ ] Shareable insight cards (partially done)
- [ ] Community challenges
- [ ] TikTok-style progress videos

### Phase 4: Monetization 🚧
- [ ] Freemium model (5 insights/month free)
- [ ] Premium AI coach ($9/month)
- [ ] Team/enterprise features ($29/month)

---

## 🔧 Technical Architecture

### Frontend Stack
- **Next.js 15** - React framework
- **Tailwind CSS** - Styling system
- **TypeScript** - Type safety
- **Lucide Icons** - Modern iconography

### Backend Stack
- **Supabase** - Database & authentication
- **Groq API** - AI inference (Llama 3)
- **Vercel** - Deployment platform
- **Next.js API Routes** - Backend logic

### AI Pipeline
```typescript
// 1. Collect behavioral data
const checkInData = {
  mood: 'energized',
  progress: 75,
  energy_level: 8,
  wins: 'Completed morning workout',
  challenges: 'Distracted in afternoon'
};

// 2. Generate AI insight
const insight = await generateInsightFromGroq(pattern, checkInData, 'energy_optimization');

// 3. Save and display
await supabase.from('insights').insert({ insight, user_id, tags });
```

---

## 🚀 Next Steps to Unicorn Status

### Immediate (This Week)
1. **Add Groq API key** to enable real AI insights
2. **Complete 5 daily check-ins** to see pattern recognition
3. **Test insight sharing** functionality
4. **Gather user feedback** from friends/family

### Short Term (Next Month)
1. **Implement push notifications** for daily check-ins
2. **Add weekly/monthly analytics** dashboards
3. **Build accountability partner** system
4. **Create TikTok-ready** progress videos

### Long Term (3-6 Months)
1. **Launch beta program** with 100 users
2. **Implement freemium model** with Stripe
3. **Add team/enterprise** features
4. **Apply to Y Combinator** with traction data

---

## 🐛 Troubleshooting

### "Error fetching insights" 
- ✅ **Fixed**: InsightCards now shows fallback insights while database is setting up
- Run the SQL schema in Supabase dashboard to enable real insights

### No AI insights generating
- Add `GROQ_API_KEY` to `.env.local`
- Restart the development server
- Complete a daily check-in to trigger insight generation

### Build errors
- Run `npm run build` to check for TypeScript errors
- All current errors should be resolved

### Mobile vs Web differences
- Both now use the same component system
- Consistent styling with Tailwind CSS
- Responsive design works on all devices

---

## 🎉 Success Metrics

Track these KPIs to measure unicorn potential:

### User Engagement
- **Daily Check-in Rate**: Target 60%+ 
- **Insight Read Rate**: Target 80%+
- **Weekly Retention**: Target 40%+

### AI Performance  
- **Insight Relevance**: User ratings 4.2+ stars
- **Pattern Recognition**: Actionable insights 70%+
- **Behavioral Change**: Self-reported improvement 50%+

### Growth Metrics
- **Viral Coefficient**: 0.3+ (each user brings 0.3 new users)
- **Monthly Growth Rate**: 20%+ month-over-month
- **Revenue per User**: $5+ monthly (premium features)

---

## 💡 Pro Tips

1. **Focus on emotional connection** - users don't just want data, they want to feel understood
2. **Make insights actionable** - every AI message should suggest a specific next action
3. **Celebrate small wins** - dopamine hits from micro-achievements drive retention
4. **Build sharing moments** - insights that make users look good on social media
5. **Personalization is key** - generic advice doesn't create unicorns

---

## 🆘 Need Help?

- **Database Issues**: Check Supabase dashboard and run the SQL schema
- **AI Not Working**: Verify GROQ_API_KEY in .env.local
- **Build Problems**: Run `npm run build` and fix TypeScript errors
- **Feature Requests**: The codebase is modular and ready for rapid iteration

**You're now ready to build the next AI unicorn! 🦄** 

# 🧠 Momentum AI - Setup Instructions

## AI-Powered Check-In System

This guide will help you set up the complete AI accountability system with behavioral tracking and personalized insights.

## 🚀 Quick Start

### 1. Database Setup

Run the database setup script to create all necessary tables:

```bash
node scripts/setup-ai-brain.js
```

This creates:
- `user_events` - Tracks all behavioral data (check-ins, moods, progress)
- `insights` - Stores AI-generated insights and recommendations  
- `goals` - Manages user goals and habits
- Sample data for testing

### 2. Environment Variables

Add these to your `.env.local` file:

```env
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Groq AI (optional - will use mock insights if not provided)
GROQ_API_KEY=your_groq_api_key
```

### 3. Test the System

1. Start your development server: `npm run dev`
2. Open the app and trigger a daily check-in
3. Complete the 4-step check-in flow
4. Check the insights section for AI-generated feedback

## 📊 How It Works

### Check-In Flow
1. **Mood Selection** - User selects current emotional state
2. **Energy Level** - Rate energy from 1-10
3. **Goal Progress** - Update progress on active goals
4. **Reflection** - Capture wins, challenges, and tomorrow's focus

### AI Insight Generation
- Analyzes patterns from recent check-ins
- Uses Groq AI (mixtral-8x7b-32768) for personalized insights
- Fallback to pattern-based mock insights if no API key
- Stores insights with tags and metadata

### Data Structure

**user_events table:**
```sql
- id (UUID)
- user_id (UUID) 
- event_type (TEXT) - 'daily_check_in'
- mood (TEXT) - 'happy', 'tired', etc.
- progress (INT) - 0-100 average progress
- meta (JSONB) - energy_level, wins, challenges, etc.
- timestamp (TIMESTAMP)
```

**insights table:**
```sql
- id (UUID)
- user_id (UUID)
- summary (TEXT) - AI-generated insight
- tags (TEXT[]) - behavioral tags
- source (TEXT) - 'groq_ai' or 'fallback'
- meta (JSONB) - analysis metadata
- is_read, is_liked (BOOLEAN)
```

## 🎯 Integration Guide

### Adding Check-In to Your App

```tsx
import SmartCheckIn from '@/src/components/SmartCheckIn';

function YourComponent() {
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [userGoals, setUserGoals] = useState([]);

  return (
    <>
      <button onClick={() => setShowCheckIn(true)}>
        Daily Check-In
      </button>
      
      <SmartCheckIn
        isOpen={showCheckIn}
        onClose={() => setShowCheckIn(false)}
        userGoals={userGoals}
        onCheckInComplete={(data) => {
          console.log('Check-in completed:', data);
          // Handle completion
        }}
      />
    </>
  );
}
```

### Displaying Insights

```tsx
import InsightCards from '@/src/components/InsightCards';

function Dashboard() {
  return (
    <div>
      <h1>Your Dashboard</h1>
      <InsightCards userId="your-user-id" maxInsights={5} />
    </div>
  );
}
```

## 🔧 API Endpoints

### POST /api/ai/insights
Generates AI insights from user patterns:

```json
{
  "userId": "string",
  "pattern": "Mon: happy mood, 75% progress\nTue: tired mood, 60% progress",
  "latestCheckIn": {
    "mood": "happy",
    "energy": 8,
    "wins": "Completed workout",
    "challenges": "Work stress"
  }
}
```

## 🎨 Customization

### Adding New Mood Options
Edit the `moodOptions` array in `SmartCheckIn.tsx`:

```tsx
const moodOptions = [
  { emoji: '🚀', label: 'Energized', value: 'energized' },
  { emoji: '😊', label: 'Happy', value: 'happy' },
  // Add your custom moods
];
```

### Custom AI Prompts
Modify the prompt in `app/api/ai/insights/route.ts`:

```tsx
const prompt = `You are an AI coach analyzing...
// Customize the AI personality and focus areas
`;
```

### Insight Display Styling
Update colors and styling in `InsightCards.tsx`:

```tsx
const getInsightColor = (tags: string[]) => {
  if (tags.includes('positive_trend')) return 'border-green-200 bg-green-50';
  // Add custom tag colors
};
```

## 🚨 Troubleshooting

### Database Issues
- Run `node scripts/setup-ai-brain.js` to reset tables
- Check Supabase credentials in environment variables
- Verify RLS policies if using service role key

### AI Insights Not Generating
- Check GROQ_API_KEY is set correctly
- Verify API endpoint `/api/ai/insights` is accessible
- Check browser console for error messages
- Mock insights will be used as fallback

### Check-ins Not Saving
- Verify Supabase connection
- Check user_id is being passed correctly
- Look for CORS issues in browser dev tools

## 📈 Next Steps

1. **User Authentication** - Replace `test-user-id` with real user IDs
2. **Goal Management** - Implement full CRUD for goals
3. **Advanced Analytics** - Add charts and trend analysis
4. **Notifications** - Remind users to check in daily
5. **Social Features** - Share insights and compete with friends

## 🎉 You're Ready!

Your AI accountability system is now set up and ready to help users build better habits through:
- ✅ Smart daily check-ins
- 🧠 AI-powered behavioral insights  
- 📊 Progress tracking
- 🎯 Goal management

The system will learn from user patterns and provide increasingly personalized recommendations over time. 