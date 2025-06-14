#!/bin/bash

echo "🚀 Setting up Momentum AI for production..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << EOL
# Database (Replace with your Supabase connection string)
DATABASE_URL="postgresql://username:password@localhost:5432/momentum_ai"

# NextAuth (Generate a random secret)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"

# AI Integration (Get from console.groq.com)
GROQ_API_KEY="your-groq-api-key-here"

# Google OAuth (Optional - get from Google Cloud Console)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
EOL
    echo "✅ Created .env.local - Please update with your actual values!"
else
    echo "✅ .env.local already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
npx prisma generate

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Get a free database at https://supabase.com"
echo "2. Update DATABASE_URL in .env.local"
echo "3. Get free AI API key at https://console.groq.com"
echo "4. Update GROQ_API_KEY in .env.local"
echo "5. Run: npm run db:push"
echo "6. Run: npm run dev"
echo ""
 