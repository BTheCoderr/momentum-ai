# Momentum AI

Your AI-powered accountability agent that helps you stay emotionally connected to your goals.

## 🎯 Features

### Core Functionality
- **Goal Setting & Management** - Create goals with deep emotional context
- **AI Accountability Dashboard** - Visual progress tracking with insights
- **Progress Analytics** - Charts showing trends and patterns  
- **AI Coach Interface** - Chat-like coaching conversations
- **Proactive Interventions** - AI predicts when you'll drift and intervenes

### Key Differentiators
- **Emotional Connection Focus** - Goes beyond task management to understand your deeper motivations
- **Pattern Recognition** - Learns when you're most productive and motivated
- **Mini-Therapist + Detective** - Understands the psychology behind goal achievement
- **Proactive vs Reactive** - Prevents failures before they happen

## 🚀 Tech Stack

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Charts**: Recharts for beautiful data visualization
- **Icons**: Lucide React for modern iconography
- **Styling**: Tailwind CSS with custom gradients and animations

## 📦 Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd momentum-ai

# Install dependencies
npm install

# Set up AI integration (FREE!)
# 1. Create .env.local file
echo "GROQ_API_KEY=your-key-here" > .env.local

# 2. Get free Groq API key at: https://console.groq.com/keys
# 3. Replace 'your-key-here' with your actual key

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### 🤖 AI Setup (Required for real AI responses)

1. **Get Free Groq API Key:**
   - Go to [https://console.groq.com/keys](https://console.groq.com/keys)
   - Sign up (no credit card required!)
   - Create new API key
   
2. **Add to Environment:**
   ```bash
   # Create .env.local file
   GROQ_API_KEY=your-actual-api-key-here
   ```
   
3. **Restart Server:**
   ```bash
   npm run dev
   ```

**Without API key:** App works with fallback responses  
**With API key:** Real AI coaching conversations! 🚀

## 🏗️ Project Structure

```
src/
├── app/
│   ├── page.tsx          # Main dashboard
│   ├── layout.tsx        # App layout
│   └── globals.css       # Global styles
└── components/
    ├── GoalCard.tsx              # Individual goal display
    ├── ProgressDashboard.tsx     # Analytics & insights
    ├── AICoachPanel.tsx          # Chat interface
    └── GoalCreationModal.tsx     # Goal creation flow
```

## 🎨 Design System

### Colors
- **Primary**: Blue to Purple gradients (#3b82f6 → #8b5cf6)
- **Success**: Green (#10b981)
- **Warning**: Amber (#f59e0b)
- **Emotional**: Pink to Purple (#ec4899 → #8b5cf6)

### Key UX Principles
- **Emotional First** - Always connect actions to deeper motivations
- **Visual Progress** - Make progress tangible and rewarding
- **Gentle Nudging** - AI interventions feel supportive, not pushy
- **Pattern Awareness** - Help users understand their own behaviors

## 💰 Business Model

- **$19/month subscription** for AI accountability coaching
- **Freemium** basic goal tracking
- **Enterprise** team accountability features

## 🔮 Future Features

- [ ] Mobile app (React Native)
- [ ] Real AI integration (OpenAI/Anthropic)
- [ ] Team accountability features
- [ ] Integration with calendars/productivity tools
- [ ] Habit tracking and streaks
- [ ] Goal templates and coaching programs
- [ ] Advanced analytics and reporting

## 🛠️ Development

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 📝 Notes

This is the initial MVP focusing on the core user experience and interface. The AI functionality is currently simulated with mock data and responses. Real AI integration would require:

1. Backend API integration
2. User authentication
3. Data persistence (database)
4. AI/ML model integration
5. Payment processing
6. Analytics tracking

---

Built with ❤️ for helping people achieve their dreams through emotional accountability.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
