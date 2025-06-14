# 🚀 Momentum AI - Production Setup Guide

## Quick Start (15 minutes to fully functional app!)

### 1. Database Setup (5 minutes)

**Get Free PostgreSQL Database:**
1. Go to [supabase.com](https://supabase.com) and sign up
2. Click "New Project" 
3. Name it "momentum-ai"
4. **COPY THE PASSWORD** (you can't see it again!)
5. Click "Create new project"
6. Go to Settings → Database → Copy the "URI" connection string

### 2. Environment Setup (2 minutes)

Create `.env.local` file in your project root:

```bash
# Database (from Supabase)
DATABASE_URL="your-supabase-connection-string-here"

# NextAuth (generate random secret)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-random-secret-key-here"

# AI Integration (FREE!)
GROQ_API_KEY="your-groq-api-key-here"

# Google OAuth (optional but recommended)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 3. Get Free AI API Key (2 minutes)

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up (no credit card needed!)
3. Create API key
4. Add to `.env.local`

### 4. Google OAuth Setup (5 minutes) - Optional

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret to `.env.local`

### 5. Initialize Database (1 minute)

```bash
# Push database schema
npm run db:push

# Generate Prisma client
npx prisma generate
```

### 6. Run the App

```bash
npm run dev
```

## 🎉 You're Done!

Your app now has:
- ✅ Real user authentication
- ✅ Persistent goal storage
- ✅ Functional AI coaching
- ✅ Real progress tracking
- ✅ Streak calculations

## Production Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy!

### Netlify
1. Build command: `npm run build`
2. Publish directory: `.next`
3. Add environment variables

## Troubleshooting

**Database connection issues:**
- Check your DATABASE_URL format
- Ensure Supabase project is active

**Auth not working:**
- Verify NEXTAUTH_SECRET is set
- Check Google OAuth redirect URIs

**AI responses failing:**
- Verify GROQ_API_KEY is correct
- Check API key permissions

## Next Steps

Once running:
1. Create your first goal
2. Test daily check-ins
3. Chat with AI coach
4. Invite beta users!

Ready for Product Hunt in 2 weeks! 🚀 