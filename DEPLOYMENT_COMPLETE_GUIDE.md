# 🚀 Complete Deployment Guide - Momentum AI

## 📱 Mobile App (React Native/Expo)

### Local Development
```bash
cd momentum-ai-universal
npm install
npx expo start --clear
```

### Production Build (App Store/Play Store)
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Submit to App Store
eas submit --platform ios

# Submit to Play Store
eas submit --platform android
```

## 🌐 Web App Deployment

### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# - NEXTAUTH_SECRET
# - GROQ_API_KEY
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_KEY
```

### Option 2: Render
```bash
# Connect GitHub repo to Render
# Use render.yaml configuration (already created)
# Set environment variables in Render dashboard
```

### Option 3: Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=.next
```

## 🔧 Environment Variables

### Web App (.env.local)
```env
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key
GROQ_API_KEY=your-groq-key
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_KEY=your-supabase-service-key
```

### Mobile App (app.json)
- Local: `http://YOUR_IP:3000/api`
- Production: `https://your-domain.com/api`

## 🏗️ Build Commands

### Web App
```bash
npm run build    # Build for production
npm start        # Start production server
npm run dev      # Start development server
```

### Mobile App
```bash
npx expo start                    # Development
npx expo build:ios               # iOS build
npx expo build:android           # Android build
eas build --platform all         # Build both platforms
```

## 📊 Monitoring & Analytics

### Health Check Endpoints
- Web: `https://your-domain.com/api/health`
- Mobile: Built-in Expo analytics

### Performance Monitoring
- Vercel Analytics (automatic)
- Sentry (optional)
- Google Analytics (optional)

## 🔒 Security Checklist

- ✅ Environment variables secured
- ✅ API keys not in source code
- ✅ HTTPS enabled
- ✅ Authentication implemented
- ✅ Rate limiting configured
- ✅ CORS properly set

## 🚀 Quick Deploy Commands

### Deploy Web App to Vercel
```bash
vercel --prod
```

### Deploy Mobile App to Expo
```bash
eas update --branch production
```

### Full Production Deploy
```bash
# Web
npm run build && vercel --prod

# Mobile  
eas build --platform all && eas submit --platform all
``` 