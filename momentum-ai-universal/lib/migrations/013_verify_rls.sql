-- Simple verification queries for tables and RLS

-- 1. Check which tables exist
SELECT t.table_name,
       CASE 
           WHEN EXISTS (
               SELECT 1 FROM pg_tables 
               WHERE schemaname = 'public' 
               AND tablename = t.table_name
           ) THEN 'exists'
           ELSE 'missing'
       END as table_status,
       CASE 
           WHEN EXISTS (
               SELECT 1 FROM pg_tables 
               WHERE schemaname = 'public' 
               AND tablename = t.table_name
               AND rls_enabled = true
           ) THEN 'enabled'
           ELSE 'disabled'
       END as rls_status
FROM (VALUES 
    ('profiles'),
    ('user_stats'),
    ('checkins'),
    ('goals'),
    ('challenge_progress'),
    ('pod_votes'),
    ('pod_xp_log'),
    ('user_reminders'),
    ('rituals'),
    ('vault_entries'),
    ('DailyCheckIn')
) as t(table_name)
ORDER BY table_name;

-- 2. Check user ID column types
SELECT table_name,
       column_name,
       data_type,
       udt_name
FROM information_schema.columns 
WHERE table_schema = 'public'
AND table_name IN (
    'challenge_progress',
    'pod_votes',
    'pod_xp_log',
    'user_reminders',
    'rituals',
    'vault_entries',
    'DailyCheckIn'
)
AND column_name IN ('user_id', 'userId');

-- 3. Check existing RLS policies
SELECT schemaname,
       tablename,
       policyname,
       cmd,
       roles,
       qual as using_expression,
       with_check as with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
    'challenge_progress',
    'pod_votes',
    'pod_xp_log',
    'user_reminders',
    'rituals',
    'vault_entries',
    'DailyCheckIn'
)
ORDER BY tablename, cmd;

-- Simple check for tables and RLS status
SELECT tablename as table_name,
       rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
    'profiles',
    'user_stats',
    'checkins',
    'goals',
    'challenge_progress',
    'pod_votes',
    'pod_xp_log',
    'user_reminders',
    'rituals',
    'vault_entries',
    'DailyCheckIn'
)
ORDER BY tablename; 