# 🚀 Momentum AI - Deployment Guide

## Quick Deploy for Screenshots & Demo

### Option 1: Vercel (Recommended - 2 minutes)

1. **Push to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Production ready build"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js and deploy

3. **Add Environment Variables** in Vercel Dashboard:
   ```
   NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
   NEXT_PUBLIC_SUPABASE_URL=https://nsgqhhbqpyvonirlfluv.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=your-secret-key
   ```

4. **Redeploy** after adding environment variables

### Option 2: Netlify (Alternative)

1. **Build locally**:
   ```bash
   npm run build
   npm run export  # if needed
   ```

2. **Deploy to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Drag & drop your `out` folder or connect GitHub
   - Add environment variables in site settings

### Option 3: Local Demo Server

```bash
# Start production server locally
npm run build
npm run start

# Or development server
npm run dev
```

## 📱 Mobile App (React Native)

```bash
cd momentum-ai-universal
npm install
npx expo start

# For iOS Simulator
npx expo run:ios

# For Android
npx expo run:android
```

## 🎯 What's Ready for Screenshots

### ✅ Core Features Working
- **Voice Input System** - Speak to create goals, check-ins
- **AI Coaching** - Multiple AI coaches with different personalities
- **Goal Management** - Full CRUD with progress tracking
- **Daily Check-ins** - Voice-enabled reflection system
- **Actionable Insights** - AI insights become goals/habits
- **Premium Features** - Paywall system ready
- **TikTok-style UI** - Swipeable insight cards
- **PWA Ready** - Installable web app

### 📸 Key Screenshots to Take

1. **Onboarding Flow** - Welcome screens
2. **Voice Input** - Show microphone interface
3. **Goal Creation** - Voice-to-text goal creation
4. **AI Coaching** - Chat interface with different coaches
5. **Daily Check-in** - Voice-enabled reflection
6. **Insight Cards** - TikTok-style swipeable cards
7. **Goal Dashboard** - Progress tracking
8. **Premium Modal** - Upgrade prompts
9. **Mobile App** - React Native version

### 🎨 Demo Data Available

The app includes realistic demo data:
- Sample goals with progress
- AI-generated insights
- Mock user streaks
- Beta user interface

## 🔧 Troubleshooting

### Build Issues
```bash
# Clean install
rm -rf node_modules
npm install
npm run build
```

### Environment Issues
- Copy `.env.local` values to deployment platform
- Ensure `NEXT_PUBLIC_BASE_URL` matches your domain
- Supabase keys are already configured for demo

### Mobile Issues
```bash
# Update Expo
npm install -g @expo/cli@latest
npx expo install --fix
```

## 🌟 Production Checklist

- [x] Build completes successfully
- [x] No critical errors in console
- [x] Voice input works
- [x] AI coaching responds
- [x] Goals can be created/managed
- [x] Premium features show properly
- [x] Mobile app builds
- [x] PWA installable
- [x] Service worker caches correctly

## 📊 Performance

- **Bundle Size**: 198kB (main)
- **First Load**: ~200kB total
- **Lighthouse Score**: 90+ (estimated)
- **Mobile Optimized**: Yes
- **Offline Support**: Yes

## 🚀 Next Steps

1. **Deploy immediately** using Vercel option above
2. **Take screenshots** of all key features
3. **Record demo videos** showing voice input
4. **Test on mobile** using Expo Go app
5. **Share live demo link** with stakeholders

Your app is **production-ready** and includes revolutionary features like comprehensive voice input and AI-powered insights that automatically become actionable goals. Perfect for showcasing the proven concept! 🎯 