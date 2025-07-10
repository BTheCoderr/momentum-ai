# Momentum AI Universal

## Database Security

### Row Level Security (RLS)

The app uses Supabase's Row Level Security (RLS) to ensure that users can only access their own data. RLS policies are defined for all tables to enforce the following rules:

1. Users can only view, create, update, and delete their own data
2. Pod members can only access data within their pods
3. Pod creators have additional permissions to manage their pods

To apply the RLS policies:

1. Set your Supabase database URL as an environment variable:
   ```bash
   export SUPABASE_DB_URL=postgres://postgres:password@db.supabase.co:5432/postgres
   ```

2. Run the RLS setup script:
   ```bash
   ./scripts/apply-rls.sh
   ```

The script will enable RLS on all tables and create the necessary policies to secure your data.

### Tables with RLS Enabled

- `checkins`: User check-ins and mood tracking
- `pod_votes`: Pod member votes
- `pod_xp_log`: Pod experience points log
- `user_reminders`: User reminders and notifications
- `rituals`: User rituals and habits
- `vault_entries`: User vault entries
- `custom_challenges`: Pod challenges
- `pods`: User pods
- `pod_members`: Pod membership
- `goals`: User goals
- `user_stats`: User statistics
- `user_settings`: User settings
- `profiles`: User profiles

### Policy Overview

Each table has specific policies that determine:
- Who can view records (SELECT)
- Who can create records (INSERT)
- Who can modify records (UPDATE)
- Who can remove records (DELETE)

For example, the `checkins` table has policies that ensure:
- Users can only view their own check-ins
- Users can only create check-ins for themselves
- Users can only update their own check-ins
- Users can only delete their own check-ins

Pod-related tables have additional policies that allow:
- Pod members to view shared pod data
- Pod creators to manage pod settings
- Members to participate in pod activities

## Getting Started

[Rest of the existing README content...] 