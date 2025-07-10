#!/bin/bash

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL environment variable is not set"
  echo "Please set it to your Supabase database URL"
  echo "Example: export DATABASE_URL=postgres://postgres:password@db.example.supabase.co:5432/postgres"
  exit 1
fi

# Apply RLS policies
echo "Applying RLS policies..."
psql "$DATABASE_URL" -f sql/rls.sql

# Check if the command was successful
if [ $? -eq 0 ]; then
  echo "✅ RLS policies applied successfully"
else
  echo "❌ Failed to apply RLS policies"
  exit 1
fi 