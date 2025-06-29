-- Add INSERT and UPDATE policies for each table

-- Account
CREATE POLICY "Users can insert own accounts" ON public.Account
    FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);
CREATE POLICY "Users can update own accounts" ON public.Account
    FOR UPDATE USING (user_id::text = auth.uid()::text);

-- Session
CREATE POLICY "Users can insert own sessions" ON public.Session
    FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);
CREATE POLICY "Users can update own sessions" ON public.Session
    FOR UPDATE USING (user_id::text = auth.uid()::text);

-- Goal
CREATE POLICY "Users can insert own goals" ON public.Goal
    FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);
CREATE POLICY "Users can update own goals" ON public.Goal
    FOR UPDATE USING (user_id::text = auth.uid()::text);

-- Habit
CREATE POLICY "Users can insert own habits" ON public.Habit
    FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);
CREATE POLICY "Users can update own habits" ON public.Habit
    FOR UPDATE USING (user_id::text = auth.uid()::text);

-- DailyCheckIn
CREATE POLICY "Users can insert own check-ins" ON public.DailyCheckIn
    FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);
CREATE POLICY "Users can update own check-ins" ON public.DailyCheckIn
    FOR UPDATE USING (user_id::text = auth.uid()::text);

-- Message
CREATE POLICY "Users can insert own messages" ON public.Message
    FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);
CREATE POLICY "Users can update own messages" ON public.Message
    FOR UPDATE USING (user_id::text = auth.uid()::text);

-- AIInsight
CREATE POLICY "Users can insert own AI insights" ON public.AIInsight
    FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);
CREATE POLICY "Users can update own AI insights" ON public.AIInsight
    FOR UPDATE USING (user_id::text = auth.uid()::text);

-- goals (lowercase)
CREATE POLICY "Users can insert own goals lowercase" ON public.goals
    FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);
CREATE POLICY "Users can update own goals lowercase" ON public.goals
    FOR UPDATE USING (user_id::text = auth.uid()::text);

-- messages (lowercase)
CREATE POLICY "Users can insert own messages lowercase" ON public.messages
    FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);
CREATE POLICY "Users can update own messages lowercase" ON public.messages
    FOR UPDATE USING (user_id::text = auth.uid()::text); 