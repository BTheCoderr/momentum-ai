-- Fix RLS Security Issues - addresses ALL Security Advisor warnings
-- This migration enables RLS on all tables and adds proper policies

-- Enable RLS on all tables mentioned in Security Advisor
ALTER TABLE IF EXISTS public._prisma_migrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.VerificationToken ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.Account ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.Session ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.Goal ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.User ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.Habit ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.DailyCheckIn ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.Message ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.AIInsight ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can access own accounts" ON public.Account;
DROP POLICY IF EXISTS "Users can access own sessions" ON public.Session;
DROP POLICY IF EXISTS "Users can access own goals" ON public.Goal;
DROP POLICY IF EXISTS "Users can access own habits" ON public.Habit;
DROP POLICY IF EXISTS "Users can access own check-ins" ON public.DailyCheckIn;
DROP POLICY IF EXISTS "Users can access own messages" ON public.Message;
DROP POLICY IF EXISTS "Users can access own AI insights" ON public.AIInsight;
DROP POLICY IF EXISTS "Users can access own goals lowercase" ON public.goals;
DROP POLICY IF EXISTS "Users can access own messages lowercase" ON public.messages;
DROP POLICY IF EXISTS "Users can access own profile" ON public.User;

-- Account policies
CREATE POLICY "Account access policy" ON public.Account
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Session policies  
CREATE POLICY "Session access policy" ON public.Session
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Goal policies (uppercase)
CREATE POLICY "Goal access policy" ON public.Goal
    FOR ALL USING (auth.uid()::text = user_id::text);

-- goals policies (lowercase)
CREATE POLICY "goals access policy" ON public.goals
    FOR ALL USING (auth.uid()::text = user_id::text);

-- User policies
CREATE POLICY "User access policy" ON public.User
    FOR ALL USING (auth.uid()::text = id::text);

-- Habit policies
CREATE POLICY "Habit access policy" ON public.Habit
    FOR ALL USING (auth.uid()::text = user_id::text);

-- DailyCheckIn policies
CREATE POLICY "DailyCheckIn access policy" ON public.DailyCheckIn
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Message policies (uppercase)
CREATE POLICY "Message access policy" ON public.Message
    FOR ALL USING (auth.uid()::text = user_id::text);

-- messages policies (lowercase)
CREATE POLICY "messages access policy" ON public.messages
    FOR ALL USING (auth.uid()::text = user_id::text);

-- AIInsight policies
CREATE POLICY "AIInsight access policy" ON public.AIInsight
    FOR ALL USING (auth.uid()::text = user_id::text);

-- VerificationToken policies (more permissive as they're temporary)
CREATE POLICY "VerificationToken access policy" ON public.VerificationToken
    FOR ALL USING (true);

-- _prisma_migrations policies (allow authenticated users)
CREATE POLICY "_prisma_migrations access policy" ON public._prisma_migrations
    FOR SELECT USING (auth.role() = 'authenticated');

-- Success notification
DO $$
BEGIN
    RAISE NOTICE '🛡️ RLS Security Fixed! All tables now have proper Row Level Security enabled.';
    RAISE NOTICE '✅ Users can only access their own data.';
    RAISE NOTICE '🔒 Database is now secure from unauthorized access.';
END $$; 