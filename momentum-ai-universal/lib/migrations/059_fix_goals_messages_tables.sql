-- Fix goals and messages tables structure and RLS policies

-- Drop existing tables and start fresh
DROP TABLE IF EXISTS goals CASCADE;
DROP TABLE IF EXISTS messages CASCADE;

-- Create goals table with proper structure
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'personal',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    target_date DATE,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table with proper structure
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'ai', 'system')),
    type TEXT DEFAULT 'text',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);

-- Enable RLS
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "goals_policy" ON goals;
DROP POLICY IF EXISTS "messages_policy" ON messages;
DROP POLICY IF EXISTS "Users can view their own goals" ON goals;
DROP POLICY IF EXISTS "Users can insert their own goals" ON goals;
DROP POLICY IF EXISTS "Users can update their own goals" ON goals;
DROP POLICY IF EXISTS "Users can delete their own goals" ON goals;
DROP POLICY IF EXISTS "Users can view their own messages" ON messages;
DROP POLICY IF EXISTS "Users can insert their own messages" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON messages;

-- Create unified RLS policies with proper UUID casting
CREATE POLICY "goals_policy" ON goals
    FOR ALL TO authenticated
    USING (auth.uid()::uuid = user_id)
    WITH CHECK (auth.uid()::uuid = user_id);

CREATE POLICY "messages_policy" ON messages
    FOR ALL TO authenticated
    USING (auth.uid()::uuid = user_id)
    WITH CHECK (auth.uid()::uuid = user_id);

-- Grant necessary permissions
GRANT ALL ON goals TO authenticated;
GRANT ALL ON messages TO authenticated;

-- Verify table structure
DO $$
DECLARE
    goals_ok boolean;
    messages_ok boolean;
    rls_ok boolean;
BEGIN
    -- Verify goals table structure
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'goals' 
        AND column_name = 'user_id'
        AND data_type = 'uuid'
        AND is_nullable = 'NO'
    ) INTO goals_ok;

    IF NOT goals_ok THEN
        RAISE EXCEPTION 'Goals table missing user_id column or wrong type';
    END IF;

    -- Verify messages table structure
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'messages' 
        AND column_name = 'user_id'
        AND data_type = 'uuid'
        AND is_nullable = 'NO'
    ) INTO messages_ok;

    IF NOT messages_ok THEN
        RAISE EXCEPTION 'Messages table missing user_id column or wrong type';
    END IF;

    -- Verify RLS is enabled
    SELECT EXISTS (
        SELECT 1
        FROM pg_tables
        WHERE tablename IN ('goals', 'messages')
        AND rowsecurity = true
    ) INTO rls_ok;

    IF NOT rls_ok THEN
        RAISE EXCEPTION 'RLS not enabled on goals or messages table';
    END IF;
END $$; 