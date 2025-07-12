# Database Migration and Fix Instructions

## Current Issues

1. Invalid API Key
   - The service role key is not working for direct migrations
   - Solution: Run migrations through Supabase Dashboard

2. Missing Tables
   - `user_settings` table doesn't exist
   - Solution: Create all tables through migration

3. RLS Policy Issues
   - Several tables have RLS enabled but no policies
   - Some tables have multiple permissive policies
   - Solution: Drop and recreate proper RLS policies

4. Performance Issues
   - Unindexed foreign keys
   - Unused indexes
   - Solution: Add proper indexes and remove unused ones

## Step-by-Step Fix

1. Open Supabase Dashboard
   - Go to https://nsgqhhbqpyvonirlfluv.supabase.co
   - Navigate to SQL Editor

2. Create New Migration
   - Click "New Query"
   - Copy the entire contents of `lib/migrations/FINAL_SETUP.sql`
   - Paste into the SQL Editor
   - Click "Run" to execute the migration

3. Verify Setup
   Run the following commands in your terminal:
   ```bash
   # Check environment variables
   node scripts/verify-env.js
   
   # Verify database setup
   node scripts/test-mobile-db.js
   ```

4. Expected Results
   - All tables should exist
   - RLS policies should be properly configured
   - INSERT operations should work
   - SELECT operations should work
   - Indexes should be optimized

## What This Migration Does

1. Tables Created/Updated:
   - `profiles`
   - `user_settings`
   - `coach_settings`
   - `user_stats`

2. Security Features:
   - Enables RLS on all tables
   - Creates proper RLS policies for each operation
   - Ensures only authenticated users can access their own data

3. Performance Optimizations:
   - Adds indexes for foreign keys
   - Adds indexes for frequently queried columns
   - Removes unused indexes

4. Data Integrity:
   - Adds proper constraints
   - Sets up automatic timestamp updates
   - Configures cascade deletes

## Troubleshooting

If you encounter "Invalid API key" errors:
1. Make sure you're running migrations in the Supabase Dashboard SQL Editor
2. For other operations, verify your environment variables:
```bash
   node scripts/verify-env.js
```

If you see RLS policy errors:
1. The migration will automatically fix these
2. If errors persist, check the Supabase Dashboard > Authentication > Policies

If you see performance warnings:
1. The migration adds all necessary indexes
2. Monitor query performance in Supabase Dashboard > Database > Performance

## Need Help?

If you encounter any issues:
1. Check the Supabase Dashboard for error messages
2. Verify all environment variables are set correctly
3. Run the verification scripts again
4. If problems persist, check the logs in Supabase Dashboard > Database > Logs 