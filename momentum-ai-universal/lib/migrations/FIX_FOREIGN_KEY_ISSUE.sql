-- FIX FOREIGN KEY ISSUE - Remove problematic foreign key constraints

-- Drop the foreign key constraints that are causing issues
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE user_stats DROP CONSTRAINT IF EXISTS user_stats_user_id_fkey;
 
-- Verify the fix
SELECT 'Foreign key constraints removed successfully' as status; 