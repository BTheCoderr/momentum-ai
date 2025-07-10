-- Verify tables and their structure
SELECT t.tablename as table_name,
       CASE WHEN p.relrowsecurity THEN 'enabled' ELSE 'disabled' END as rls_status,
       has_table_privilege('authenticated', t.tablename::regclass, 'SELECT') as can_select,
       has_table_privilege('authenticated', t.tablename::regclass, 'INSERT') as can_insert
FROM pg_tables t
JOIN pg_class p ON t.tablename = p.relname
WHERE t.schemaname = 'public' 
AND t.tablename IN ('pods', 'pod_members', 'custom_challenges', 'challenge_progress');

-- Verify policies
SELECT schemaname,
       tablename,
       policyname,
       permissive,
       roles,
       cmd as operation,
       qual as using_expression,
       with_check as check_expression
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('pods', 'pod_members', 'custom_challenges', 'challenge_progress')
ORDER BY tablename, cmd;

-- Verify indexes
SELECT 
    t.relname as table_name,
    i.relname as index_name,
    array_agg(a.attname) as column_names,
    ix.indisunique as is_unique
FROM pg_class t
JOIN pg_index ix ON t.oid = ix.indrelid
JOIN pg_class i ON ix.indexrelid = i.oid
JOIN pg_attribute a ON t.oid = a.attrelid AND a.attnum = ANY(ix.indkey)
WHERE t.relkind = 'r'
AND t.relname IN ('pods', 'pod_members', 'custom_challenges', 'challenge_progress')
GROUP BY t.relname, i.relname, ix.indisunique
ORDER BY t.relname, i.relname; 