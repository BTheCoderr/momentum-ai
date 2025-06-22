# 🏗️ Momentum AI - Repository Structure Outline

## 📁 Root Directory Structure

```
momentum-ai/
├── 📱 Web Application (Next.js 15)
│   ├── app/                          # Next.js App Router
│   ├── src/                          # Source components & logic
│   ├── public/                       # Static assets
│   └── Configuration files
│
├── 📱 Mobile Application (React Native/Expo)
│   └── momentum-ai-universal/        # Cross-platform mobile app
│
├── 🗄️ Database & Backend
│   ├── lib/                          # Database connections
│   ├── shared/                       # Shared utilities
│   └── supabase_schema.sql          # Database schema
│
├── 📚 Documentation
│   ├── Setup & Deployment guides
│   ├── Feature audits
│   └── Testing guides
│
└── ⚙️ Configuration & Scripts
    ├── Environment files
    ├── Build configurations
    └── Utility scripts
```

## 📂 Detailed Directory Breakdown

### 🌐 **Web Application (`/app` - Next.js 15)**

```
app/
├── 📄 Core Pages
│   ├── page.tsx                      # Main dashboard/home page
│   ├── layout.tsx                    # Root layout with metadata
│   ├── globals.css                   # Global styles & Tailwind
│   ├── auth/signin/page.tsx          # Authentication page
│   ├── launch/page.tsx               # Product launch page
│   └── test/page.tsx                 # Testing/demo page
│
└── 🔌 API Routes (/api)
    ├── 🤖 AI Services
    │   ├── ai/advanced-coach/route.ts     # Advanced AI coaching
    │   ├── ai/insights/route.ts           # AI insight generation
    │   ├── ai/productivity-coach/route.ts # Productivity coaching
    │   ├── ai/reflect/route.ts            # Reflection AI
    │   └── ai/smart-coach/route.ts        # Smart coaching AI
    │
    ├── 💬 Chat & Communication
    │   ├── chat/route.ts                  # Main chat API
    │   ├── chat/history/route.ts          # Chat history
    │   └── messages/route.ts              # Message handling
    │
    ├── 🎯 Goal Management
    │   ├── goals/route.ts                 # CRUD operations for goals
    │   ├── checkins/route.ts              # Daily check-ins
    │   └── streaks/route.ts               # Streak tracking
    │
    ├── 👤 User Management
    │   ├── user/profile/route.ts          # User profiles
    │   ├── user/stats/route.ts            # User statistics
    │   └── auth/[...nextauth]/route.ts    # NextAuth integration
    │
    ├── 📊 Analytics & Insights
    │   ├── insights/route.ts              # User insights
    │   └── patterns/user/route.ts         # Behavior patterns
    │
    └── 🛠️ Admin & Utilities
        └── admin/cleanup/route.ts         # Data cleanup utilities
```

### 🧩 **Frontend Components (`/src`)**

```
src/
├── 🎨 Components (/components)
│   ├── 🚀 Core Features
│   │   ├── AICoachPanel.tsx           # AI chat interface
│   │   ├── GoalManager.tsx            # Goal CRUD interface
│   │   ├── VoiceInput.tsx             # Universal voice input
│   │   ├── SmartCheckIn.tsx           # Daily check-in system
│   │   └── OnboardingFlow.tsx         # User onboarding
│   │
│   ├── 💡 Insights & Analytics
│   │   ├── InsightCards.tsx           # TikTok-style insight cards
│   │   ├── ShareableInsightCard.tsx   # Social sharing
│   │   ├── StreakCard.tsx             # Streak visualization
│   │   └── ProgressDashboard.tsx      # Progress tracking
│   │
│   ├── 💰 Premium Features
│   │   ├── PremiumFeatureManager.tsx  # Feature gating
│   │   ├── SubscriptionManager.tsx    # Subscription handling
│   │   ├── PaymentIntegration.tsx     # Payment processing
│   │   └── PricingTiers.tsx           # Pricing display
│   │
│   ├── 🔧 Utility Components
│   │   ├── BetaUserBanner.tsx         # Beta user interface
│   │   ├── PWAInstaller.tsx           # PWA installation
│   │   ├── OfflineIndicator.tsx       # Offline status
│   │   └── ReminderEngine.tsx         # Smart reminders
│   │
│   └── index.ts                       # Component exports
│
├── 🪝 Custom Hooks (/hooks)
│   ├── useAuth.tsx                    # Authentication logic
│   ├── useGoals.ts                    # Goal management
│   ├── useMessages.ts                 # Message handling
│   ├── useSpeechRecognition.ts        # Voice input logic
│   ├── useSubscription.ts             # Premium features
│   └── useLocalStorage.ts             # Local data persistence
│
├── 📚 Core Libraries (/lib)
│   ├── supabase.ts                    # Database client
│   ├── auth.ts                        # Authentication setup
│   ├── analytics.ts                   # User analytics
│   ├── ai-patterns.ts                 # AI behavior patterns
│   └── onboarding.ts                  # Onboarding logic
│
├── ⚙️ Configuration (/config)
│   └── subscription-tiers.ts          # Premium tier definitions
│
├── 🧭 Navigation (/navigation)
│   ├── index.tsx                      # Navigation setup
│   └── types.ts                       # Navigation types
│
├── 📱 Mobile Screens (/screens)
│   ├── HomeScreen.tsx                 # Mobile home
│   ├── ChatScreen.tsx                 # Mobile chat
│   ├── GoalsScreen.tsx                # Mobile goals
│   ├── ProfileScreen.tsx              # Mobile profile
│   └── [8 more screens]               # Additional mobile screens
│
└── 🔤 Type Definitions (/types)
    └── index.ts                       # TypeScript interfaces
```

### 📱 **Mobile Application (`/momentum-ai-universal`)**

```
momentum-ai-universal/
├── 📄 Core Files
│   ├── App.tsx                        # Main mobile app component
│   ├── index.js                       # Entry point
│   ├── app.json                       # Expo configuration
│   └── package.json                   # Mobile dependencies
│
├── ⚙️ Configuration
│   ├── babel.config.js                # Babel configuration
│   ├── metro.config.js                # Metro bundler config
│   ├── tsconfig.json                  # TypeScript config
│   └── lib/config.ts                  # App configuration
│
├── 🎨 Assets (/assets)
│   ├── adaptive-icon.png              # Android adaptive icon
│   ├── favicon.png                    # Web favicon
│   ├── icon.png                       # App icon
│   └── splash-icon.png                # Splash screen icon
│
└── 🔗 Shared Code (/shared)
    ├── lib/                           # Shared utilities
    ├── types/                         # Shared type definitions
    └── utils/                         # Shared helper functions
```

### 🗄️ **Database & Backend**

```
Database Structure:
├── 📊 Core Tables
│   ├── users                          # User profiles & auth
│   ├── goals                          # Goal management
│   ├── check_ins                      # Daily check-in data
│   ├── insights                       # AI-generated insights
│   ├── chat_messages                  # Chat history
│   ├── user_events                    # Behavior tracking
│   └── subscriptions                  # Premium subscriptions
│
├── 🔗 Shared Libraries
│   ├── lib/supabase.ts                # Main database client
│   └── shared/lib/supabase.ts         # Shared database utilities
│
└── 📋 Schema Definition
    └── supabase_schema.sql            # Complete database schema
```

### 🌐 **Static Assets (`/public`)**

```
public/
├── 🖼️ Images (/images)
│   ├── momentum-logo.svg              # Main logo
│   ├── icon-192.png                   # PWA icon 192x192
│   ├── icon-512.png                   # PWA icon 512x512
│   ├── icon-maskable-192.png          # Maskable icon 192x192
│   └── icon-maskable-512.png          # Maskable icon 512x512
│
├── 📱 PWA Configuration
│   ├── manifest.json                  # Web app manifest
│   ├── sw.js                          # Service worker
│   └── favicon.ico                    # Browser favicon
│
└── 🎨 UI Assets
    ├── file.svg                       # File icon
    ├── globe.svg                      # Globe icon
    ├── next.svg                       # Next.js logo
    ├── vercel.svg                     # Vercel logo
    └── window.svg                     # Window icon
```

### 📚 **Documentation**

```
Documentation Files:
├── 🚀 Setup & Deployment
│   ├── README.md                      # Main project documentation
│   ├── SETUP.md                       # Setup instructions
│   ├── SETUP_INSTRUCTIONS.md          # Detailed setup guide
│   ├── SETUP_GUIDE.md                 # Quick setup guide
│   ├── DEPLOYMENT_GUIDE.md            # Production deployment
│   └── IMPLEMENTATION_GUIDE.md        # Implementation details
│
├── 📋 Feature Documentation
│   ├── FEATURE_AUDIT.md               # Complete feature audit
│   ├── READY_FOR_SUBMISSION.md        # Submission readiness
│   ├── PRODUCTION_ROADMAP.md          # Production roadmap
│   └── APP_STORE_READY_2030.md        # App store preparation
│
├── 📱 Mobile Specific
│   ├── MOBILE_README.md               # Mobile app documentation
│   ├── MOBILE_LAUNCH_GUIDE.md         # Mobile launch guide
│   ├── MOBILE_QUICK_FIX.md            # Mobile troubleshooting
│   ├── MOBILE_APP_FIXES.md            # Mobile bug fixes
│   └── MOBILE_TESTING_GUIDE.md        # Mobile testing guide
│
└── 🧪 Testing & QA
    ├── UI_TESTING_CHECKLIST.md        # UI testing checklist
    ├── LAUNCH_CHECKLIST.md            # Pre-launch checklist
    └── app-store-checklist.md         # App store submission
```

### ⚙️ **Configuration & Scripts**

```
Configuration:
├── 🔧 Build Configuration
│   ├── next.config.js                 # Next.js configuration
│   ├── tailwind.config.js             # Tailwind CSS config
│   ├── postcss.config.mjs             # PostCSS configuration
│   ├── tsconfig.json                  # TypeScript configuration
│   └── eslint.config.mjs              # ESLint configuration
│
├── 🌍 Environment Files
│   ├── .env.local                     # Local environment variables
│   ├── .env                           # Default environment
│   ├── .env.example                   # Environment template
│   ├── .env.backup                    # Environment backup
│   └── .env.test                      # Testing environment
│
├── 📦 Package Management
│   ├── package.json                   # Main dependencies
│   ├── package-lock.json              # Dependency lock file
│   └── momentum-ai-universal/package.json # Mobile dependencies
│
├── 🚀 Deployment
│   ├── vercel.json                    # Vercel deployment config
│   ├── netlify.toml                   # Netlify deployment config
│   └── app.json                       # App configuration
│
├── 🛠️ Utility Scripts (/scripts)
│   ├── setup.sh                       # Environment setup
│   ├── setup-ai-brain.js              # AI system setup
│   └── test-insights.js               # Insight testing
│
└── 🧪 Testing Files
    ├── test-everything.js              # Comprehensive tests
    ├── simple-test.js                  # Basic functionality tests
    ├── test-app-store-readiness.js     # App store readiness
    ├── check-status.js                 # Status checking
    └── migrate.js                      # Database migrations
```

## 🔍 **Key Architecture Highlights**

### **Frontend Architecture:**
- **Framework:** Next.js 15 with App Router
- **Styling:** Tailwind CSS with custom components
- **State Management:** React hooks with local storage
- **Mobile:** React Native with Expo for cross-platform

### **Backend Architecture:**
- **Database:** Supabase (PostgreSQL) with real-time subscriptions
- **API:** Next.js API routes with TypeScript
- **Authentication:** NextAuth.js integration
- **AI Services:** Multiple AI endpoints for different coaching styles

### **Key Features:**
- **Voice Input:** Universal speech recognition across all components
- **AI Coaching:** Multiple AI personalities with chat interfaces
- **Goal Management:** Complete CRUD with progress tracking
- **Premium Features:** Subscription-based feature gating
- **PWA Support:** Offline functionality with service workers
- **Cross-Platform:** Shared components between web and mobile

### **Business Logic:**
- **Freemium Model:** Strategic feature gating with premium tiers
- **User Analytics:** Comprehensive behavior tracking
- **Subscription Management:** Complete billing and tier management
- **Data Export:** User data portability features

This repository structure represents a **production-ready, full-stack application** with comprehensive documentation, testing, and deployment configurations. Perfect for app audit and technical review purposes! 🚀 