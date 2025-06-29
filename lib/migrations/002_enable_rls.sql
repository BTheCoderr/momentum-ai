-- Enable RLS on all tables
ALTER TABLE public._prisma_migrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.VerificationToken ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.Account ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.Session ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.Goal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.User ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.Habit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.DailyCheckIn ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.Message ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.AIInsight ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for each table
-- _prisma_migrations: Only allow access to authenticated users with admin role
CREATE POLICY "Allow admin access to migrations" ON public._prisma_migrations
    FOR ALL USING (auth.role() = 'authenticated' AND auth.uid() IN (
        SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    ));

-- VerificationToken: Only allow access to the token owner
CREATE POLICY "Users can access own verification tokens" ON public.VerificationToken
    FOR ALL USING (identifier = auth.email());

-- Account: Users can only access their own accounts
CREATE POLICY "Users can access own accounts" ON public.Account
    FOR ALL USING (user_id::text = auth.uid()::text);

-- Session: Users can only access their own sessions
CREATE POLICY "Users can access own sessions" ON public.Session
    FOR ALL USING (user_id::text = auth.uid()::text);

-- Goal: Users can only access their own goals
CREATE POLICY "Users can access own goals" ON public.Goal
    FOR ALL USING (user_id::text = auth.uid()::text);

-- User: Users can only access their own profile
CREATE POLICY "Users can access own profile" ON public.User
    FOR ALL USING (id::text = auth.uid()::text);

-- Habit: Users can only access their own habits
CREATE POLICY "Users can access own habits" ON public.Habit
    FOR ALL USING (user_id::text = auth.uid()::text);

-- DailyCheckIn: Users can only access their own check-ins
CREATE POLICY "Users can access own check-ins" ON public.DailyCheckIn
    FOR ALL USING (user_id::text = auth.uid()::text);

-- Message: Users can only access their own messages
CREATE POLICY "Users can access own messages" ON public.Message
    FOR ALL USING (user_id::text = auth.uid()::text);

-- AIInsight: Users can only access their own insights
CREATE POLICY "Users can access own AI insights" ON public.AIInsight
    FOR ALL USING (user_id::text = auth.uid()::text);

-- goals: Users can only access their own goals (lowercase table)
CREATE POLICY "Users can access own goals lowercase" ON public.goals
    FOR ALL USING (user_id::text = auth.uid()::text);

-- messages: Users can only access their own messages (lowercase table)
CREATE POLICY "Users can access own messages lowercase" ON public.messages
    FOR ALL USING (user_id::text = auth.uid()::text); 