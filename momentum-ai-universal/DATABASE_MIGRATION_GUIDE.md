# 🗄️ Database Migration Guide

## Quick Setup for Advanced Features

### Step 1: Access Supabase Dashboard
1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Select the Momentum AI project
4. Navigate to **SQL Editor**

### Step 2: Execute Migration
1. Open the SQL Editor
2. Copy the entire contents of `lib/migrations/008_advanced_features.sql`
3. Paste into the SQL Editor
4. Click **Run** to execute

### Step 3: Verify Tables Created
After execution, verify these tables exist:
- `challenge_progress`
- `pod_votes`
- `pod_xp_log`
- `user_reminders`
- `rituals`
- `vault_entries`

### Step 4: Test RLS Policies
The migration includes Row Level Security policies for all new tables.

## Migration Contents

The migration will create:
- **6 new tables** for advanced features
- **RLS policies** for security
- **Database functions** for invite codes and XP totals
- **Performance indexes** for optimal query speed
- **Updated profiles table** with onboarding fields

## Troubleshooting

If you encounter issues:
1. Check that you have admin access to the database
2. Ensure the service role key has proper permissions
3. Run the migration in smaller chunks if needed

## Post-Migration

After successful migration:
1. The app will automatically detect new features
2. Users can access advanced functionality
3. AI service will work with new data structures
4. All 12 advanced features will be fully functional

---

**✅ Once this migration is complete, all advanced features will be live and ready for users!** 