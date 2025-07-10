-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "profiles_policy" ON profiles;

-- Create new policies with proper UUID casting and INSERT permission
CREATE POLICY "Enable insert for authentication" ON profiles
    FOR INSERT WITH CHECK (auth.uid()::text = id::text);

CREATE POLICY "Enable select for users based on user_id" ON profiles
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Enable update for users based on user_id" ON profiles
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Verify the policies
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'profiles'; 