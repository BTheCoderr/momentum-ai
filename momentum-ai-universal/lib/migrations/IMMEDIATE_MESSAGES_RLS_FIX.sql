-- IMMEDIATE FIX: Messages table RLS policies
-- This fixes the "new row violates row-level security policy" error

-- First, drop all existing policies on messages table
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

-- Create new, working policies with proper text casting
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

-- Ensure the table has RLS enabled
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Grant proper permissions
GRANT ALL ON messages TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Success notification
DO $$
BEGIN
    RAISE NOTICE '✅ Messages RLS policies fixed! Users can now insert messages properly.';
END $$; 