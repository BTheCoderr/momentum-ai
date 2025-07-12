-- Fix messages table ID generation issue

-- Drop existing messages table
DROP TABLE IF EXISTS messages CASCADE;

-- Recreate messages table with proper ID generation
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'ai', 'system')),
    type TEXT DEFAULT 'text',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own messages" ON messages;
DROP POLICY IF EXISTS "Users can insert their own messages" ON messages;
DROP POLICY IF EXISTS "Users can create their own messages" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON messages;
DROP POLICY IF EXISTS "messages_user_policy" ON messages;
DROP POLICY IF EXISTS "messages_select_policy" ON messages;
DROP POLICY IF EXISTS "messages_insert_policy" ON messages;
DROP POLICY IF EXISTS "messages_update_policy" ON messages;
DROP POLICY IF EXISTS "messages_delete_policy" ON messages;

-- Create new policies with proper UUID handling
CREATE POLICY "messages_select_policy" ON messages
    FOR SELECT TO authenticated
    USING (auth.uid()::text = user_id::text);

CREATE POLICY "messages_insert_policy" ON messages
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "messages_update_policy" ON messages
    FOR UPDATE TO authenticated
    USING (auth.uid()::text = user_id::text)
    WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "messages_delete_policy" ON messages
    FOR DELETE TO authenticated
    USING (auth.uid()::text = user_id::text);

-- Grant permissions
GRANT ALL ON messages TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated; 