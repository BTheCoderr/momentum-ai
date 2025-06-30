#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🗄️  COMPLETE SUPABASE DATABASE SETUP');
console.log('===================================\n');

console.log('🚨 CRITICAL: Your app is failing because several database tables are missing!');
console.log('   Error: "relation \'public.user_stats\' does not exist"');
console.log('   Error: "relation \'public.checkins\' does not exist"');
console.log('   Error: "relation \'public.goals\' does not exist"\n');

console.log('📋 COMPLETE SQL SCHEMA - COPY ALL OF THIS TO SUPABASE:');
console.log('='.repeat(70));

// Read the main schema file
const schemaPath = path.join(__dirname, '..', 'supabase_schema.sql');
const userStatsPath = path.join(__dirname, '..', 'lib', 'migrations', '006_add_user_stats_table.sql');

try {
  const mainSchema = fs.readFileSync(schemaPath, 'utf8');
  const userStatsSchema = fs.readFileSync(userStatsPath, 'utf8');
  
  console.log('-- COMPLETE MOMENTUM AI DATABASE SCHEMA');
  console.log('-- Step 1: Main schema (goals, insights, events, etc.)');
  console.log(mainSchema);
  
  console.log('\n-- Step 2: Add missing checkins table');
  console.log(`-- Missing checkins table that the app needs
CREATE TABLE IF NOT EXISTS public.checkins (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    date date NOT NULL,
    mood text,
    energy_level integer CHECK (energy_level >= 1 AND energy_level <= 10),
    stress_level integer CHECK (stress_level >= 1 AND stress_level <= 10),
    sleep_hours decimal(3,1),
    productivity_rating integer CHECK (productivity_rating >= 1 AND productivity_rating <= 10),
    notes text,
    goals_worked_on text[],
    challenges text[],
    wins text[],
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, date)
);

-- Enable RLS for checkins
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;

-- Add policies for checkins
CREATE POLICY "Users can view own checkins" ON public.checkins
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checkins" ON public.checkins
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checkins" ON public.checkins
    FOR UPDATE USING (auth.uid() = user_id);

-- Add daily_checkins table (also referenced in code)
CREATE TABLE IF NOT EXISTS public.daily_checkins (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    date date NOT NULL DEFAULT CURRENT_DATE,
    completed boolean DEFAULT false,
    mood text,
    energy_level integer CHECK (energy_level >= 1 AND energy_level <= 10),
    notes text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, date)
);

-- Enable RLS for daily_checkins
ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;

-- Add policies for daily_checkins
CREATE POLICY "Users can view own daily checkins" ON public.daily_checkins
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily checkins" ON public.daily_checkins
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily checkins" ON public.daily_checkins
    FOR UPDATE USING (auth.uid() = user_id);`);
  
  console.log('\n-- Step 3: Add user_stats table');
  console.log(userStatsSchema);
  
  console.log('\n='.repeat(70));
  
  console.log('\n✅ CRITICAL STEPS TO FIX YOUR APP:');
  console.log('1. 🗄️  COPY ALL THE SQL ABOVE');
  console.log('2. 🌐 Go to https://supabase.com/dashboard');
  console.log('3. 📊 Select your Momentum AI project');
  console.log('4. 🔧 Go to SQL Editor');
  console.log('5. 📝 Paste ALL the SQL above into a new query');
  console.log('6. ▶️  Click "Run" to execute');
  console.log('7. 🔄 Restart your app');
  console.log('8. 🎯 THEN fix native modules with the steps below\n');
  
  console.log('🔧 AFTER DATABASE IS FIXED, RUN THESE COMMANDS:');
  console.log('npm install expo expo-modules-core');
  console.log('npx expo install expo-constants expo-device');
  console.log('rm -rf ios android');
  console.log('npx expo prebuild');
  console.log('npx eas build --profile development --platform ios');
  console.log('npx expo start --dev-client --clear\n');
  
  console.log('🎉 This will fix BOTH your database errors AND native module warnings!');
  
} catch (error) {
  console.error('❌ Error reading schema files:', error.message);
  console.log('\n📁 Make sure you have these files:');
  console.log('- supabase_schema.sql');
  console.log('- lib/migrations/006_add_user_stats_table.sql');
} 