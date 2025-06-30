#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Database Fix Script');
console.log('====================');
console.log('');

// Read the migration file
const migrationPath = path.join(__dirname, '../lib/migrations/006_add_user_stats_table.sql');

if (!fs.existsSync(migrationPath)) {
    console.error('❌ Migration file not found!');
    console.error('Expected:', migrationPath);
    process.exit(1);
}

const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

console.log('📋 SQL Migration to Run:');
console.log('========================');
console.log('');
console.log(migrationSQL);
console.log('');
console.log('🔗 How to run this migration:');
console.log('=============================');
console.log('');
console.log('1. Go to your Supabase Dashboard: https://supabase.com/dashboard');
console.log('2. Select your project: momentum-ai');
console.log('3. Go to "SQL Editor" in the left sidebar');
console.log('4. Click "New Query"');
console.log('5. Copy and paste the SQL above');
console.log('6. Click "Run" to execute the migration');
console.log('');
console.log('✅ This migration will:');
console.log('- Create the missing user_stats table');
console.log('- Add proper Row Level Security (RLS) policies');
console.log('- Create triggers to automatically create stats for new users');
console.log('');
console.log('💡 After running this migration, restart your app to clear the "No user found" errors.'); 