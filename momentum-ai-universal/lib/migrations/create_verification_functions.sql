-- Function to get table information
CREATE OR REPLACE FUNCTION get_tables()
RETURNS TABLE (
    schema_name text,
    table_name text,
    owner name,
    has_rls boolean,
    estimated_rows bigint
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.nspname::text as schema_name,
        c.relname::text as table_name,
        pg_get_userbyid(c.relowner)::name as owner,
        c.relrowsecurity as has_rls,
        c.reltuples::bigint as estimated_rows
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
    AND c.relkind = 'r'
    ORDER BY c.relname;
END;
$$;

-- Function to get RLS policies
CREATE OR REPLACE FUNCTION get_policies()
RETURNS TABLE (
    schema_name text,
    table_name text,
    policy_name text,
    roles text[],
    cmd text,
    qual text,
    with_check text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.nspname::text as schema_name,
        c.relname::text as table_name,
        p.polname::text as policy_name,
        p.polroles::text[] as roles,
        CASE p.polcmd
            WHEN 'r' THEN 'SELECT'
            WHEN 'a' THEN 'INSERT'
            WHEN 'w' THEN 'UPDATE'
            WHEN 'd' THEN 'DELETE'
            ELSE 'ALL'
        END as cmd,
        pg_get_expr(p.polqual, p.polrelid) as qual,
        pg_get_expr(p.polwithcheck, p.polrelid) as with_check
    FROM pg_policy p
    JOIN pg_class c ON c.oid = p.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
    ORDER BY c.relname, p.polname;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_tables() TO authenticated;
GRANT EXECUTE ON FUNCTION get_policies() TO authenticated; 