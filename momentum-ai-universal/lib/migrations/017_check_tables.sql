-- Simple check for existing tables
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename; 