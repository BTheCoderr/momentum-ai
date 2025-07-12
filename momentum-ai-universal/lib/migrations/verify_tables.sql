-- Verify table existence and permissions
SELECT 
    schemaname,
    tablename,
    tableowner,
    has_table_privilege(current_user, tablename::regclass, 'SELECT') as can_select,
    has_table_privilege(current_user, tablename::regclass, 'INSERT') as can_insert,
    has_table_privilege(current_user, tablename::regclass, 'UPDATE') as can_update,
    has_table_privilege(current_user, tablename::regclass, 'DELETE') as can_delete
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename; 