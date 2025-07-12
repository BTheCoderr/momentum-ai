-- Fix RLS policies for goals and messages tables
-- This resolves the "new row violates row-level security policy" errors

-- Step 1: Drop all existing policies
DROP POLICY IF EXISTS "Users can view own goals" ON goals;
DROP POLICY IF EXISTS "Users can insert own goals" ON goals;
DROP POLICY IF EXISTS "Users can update own goals" ON goals;
DROP POLICY IF EXISTS "Users can delete own goals" ON goals;
DROP POLICY IF EXISTS "goals_user_policy" ON goals;
DROP POLICY IF EXISTS "Goal access policy" ON goals;
DROP POLICY IF EXISTS "goals access policy" ON goals;

DROP POLICY IF EXISTS "Users can view own messages" ON messages;
DROP POLICY IF EXISTS "Users can insert own messages" ON messages;
DROP POLICY IF EXISTS "Users can update own messages" ON messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON messages;
DROP POLICY IF EXISTS "messages_user_policy" ON messages;
DROP POLICY IF EXISTS "Message access policy" ON messages;
DROP POLICY IF EXISTS "messages access policy" ON messages;

-- Step 2: Ensure RLS is enabled
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Step 3: Create new unified policies with proper UUID casting
-- Goals policies
CREATE POLICY "goals_policy" ON goals
    FOR ALL TO authenticated
    USING (auth.uid()::uuid = user_id)
    WITH CHECK (auth.uid()::uuid = user_id);

-- Messages policies  
CREATE POLICY "messages_policy" ON messages
    FOR ALL TO authenticated
    USING (auth.uid()::uuid = user_id)
    WITH CHECK (auth.uid()::uuid = user_id);

-- Step 4: Grant necessary permissions
GRANT ALL ON goals TO authenticated;
GRANT ALL ON messages TO authenticated;

-- Step 5: Verify table structure
DO $$ 
BEGIN
    -- Verify goals table structure
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'goals' 
        AND column_name = 'user_id'
        AND data_type = 'uuid'
    ) THEN
        RAISE EXCEPTION 'Goals table missing user_id column or wrong type';
    END IF;

    -- Verify messages table structure
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'messages' 
        AND column_name = 'user_id'
        AND data_type = 'uuid'
    ) THEN
        RAISE EXCEPTION 'Messages table missing user_id column or wrong type';
    END IF;
END $$; 