-- Drop existing policies to avoid conflicts
DO $$ 
BEGIN
    -- Drop existing policies (ignoring errors if they don't exist)
    DROP POLICY IF EXISTS "Users can access own accounts" ON public.Account;
    DROP POLICY IF EXISTS "Users can access own sessions" ON public.Session;
    DROP POLICY IF EXISTS "Users can access own goals" ON public.Goal;
    DROP POLICY IF EXISTS "Users can access own habits" ON public.Habit;
    DROP POLICY IF EXISTS "Users can access own check-ins" ON public.DailyCheckIn;
    DROP POLICY IF EXISTS "Users can access own messages" ON public.Message;
    DROP POLICY IF EXISTS "Users can access own AI insights" ON public.AIInsight;
END $$;

-- Account policies
CREATE POLICY "Account SELECT policy" ON public.Account
    FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Account INSERT policy" ON public.Account
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Account UPDATE policy" ON public.Account
    FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Account DELETE policy" ON public.Account
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Session policies
CREATE POLICY "Session SELECT policy" ON public.Session
    FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Session INSERT policy" ON public.Session
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Session UPDATE policy" ON public.Session
    FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Session DELETE policy" ON public.Session
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Goal policies
CREATE POLICY "Goal SELECT policy" ON public.Goal
    FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Goal INSERT policy" ON public.Goal
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Goal UPDATE policy" ON public.Goal
    FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Goal DELETE policy" ON public.Goal
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Habit policies
CREATE POLICY "Habit SELECT policy" ON public.Habit
    FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Habit INSERT policy" ON public.Habit
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Habit UPDATE policy" ON public.Habit
    FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Habit DELETE policy" ON public.Habit
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- DailyCheckIn policies
CREATE POLICY "DailyCheckIn SELECT policy" ON public.DailyCheckIn
    FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "DailyCheckIn INSERT policy" ON public.DailyCheckIn
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "DailyCheckIn UPDATE policy" ON public.DailyCheckIn
    FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "DailyCheckIn DELETE policy" ON public.DailyCheckIn
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Message policies
CREATE POLICY "Message SELECT policy" ON public.Message
    FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Message INSERT policy" ON public.Message
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Message UPDATE policy" ON public.Message
    FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Message DELETE policy" ON public.Message
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- AIInsight policies
CREATE POLICY "AIInsight SELECT policy" ON public.AIInsight
    FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "AIInsight INSERT policy" ON public.AIInsight
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "AIInsight UPDATE policy" ON public.AIInsight
    FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "AIInsight DELETE policy" ON public.AIInsight
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Enable leaked password protection
ALTER SYSTEM SET auth.enable_leaked_password_protection = 'true';

-- Add MFA options
ALTER SYSTEM SET auth.mfa.enabled = 'true';
ALTER SYSTEM SET auth.mfa.factors = 'totp,sms';

-- Create test function to verify RLS
CREATE OR REPLACE FUNCTION test_rls_policies()
RETURNS TABLE (
    table_name text,
    operation text,
    result boolean
) AS $$
DECLARE
    test_user_id text := '00000000-0000-0000-0000-000000000000';
    current_user_id text := auth.uid()::text;
BEGIN
    -- Test SELECT policies
    RETURN QUERY
    SELECT 
        'Account'::text as table_name,
        'SELECT'::text as operation,
        EXISTS (
            SELECT 1 FROM public.Account 
            WHERE user_id::text = current_user_id
        ) as result;

    -- Add more test cases for other operations and tables
    -- This function can be extended based on testing needs
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 