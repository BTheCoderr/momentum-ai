# Database Fix Instructions

## Issue: "relation 'public.checkins' does not exist" Error

The app is trying to access a `checkins` table that doesn't exist in the database.

## Solution: Run Migration

### Option 1: Through Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** 
3. Copy and paste the contents of `lib/migrations/006_create_checkins_table.sql`
4. Click **Run** to execute the migration

### Option 2: Using the Setup Script
```bash
# Set your Supabase service key (get from Supabase Dashboard > Settings > API)
export SUPABASE_SERVICE_KEY="your_service_key_here"

# Run the migration
node scripts/setup-database.js
```

## What This Fixes
- ✅ Creates the missing `checkins` table with proper schema
- ✅ Adds proper Row Level Security (RLS) policies
- ✅ Enables "Do Check-In" and "Set Goals" buttons to work
- ✅ Fixes AI chat context (no more duplicate responses)
- ✅ Connects all parts of the app together

## After Running Migration
The following should work:
- Daily check-ins will save to database
- AI coach will have proper context from your check-ins
- Pattern recognition will work with real data
- Progress tracking will be accurate 