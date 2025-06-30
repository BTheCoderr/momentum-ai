#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🗄️  SUPABASE DATABASE MIGRATION SCRIPT');
console.log('=====================================\n');

const migrationPath = path.join(__dirname, '..', 'lib', 'migrations', '006_add_user_stats_table.sql');

try {
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
  
  console.log('📋 COPY THIS SQL AND PASTE INTO SUPABASE SQL EDITOR:');
  console.log('='.repeat(60));
  console.log(migrationSQL);
  console.log('='.repeat(60));
  
  console.log('\n✅ STEPS TO RUN:');
  console.log('1. Go to https://supabase.com/dashboard');
  console.log('2. Select your project');
  console.log('3. Go to SQL Editor');
  console.log('4. Copy the SQL above');
  console.log('5. Paste it into a new query');
  console.log('6. Click "Run"');
  console.log('7. Restart your app after successful migration\n');
  
} catch (error) {
  console.error('❌ Error reading migration file:', error.message);
} 