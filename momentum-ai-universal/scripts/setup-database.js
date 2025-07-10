const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Database setup script
async function setupDatabase() {
  const supabaseUrl = 'https://nsgqhhbqpyvonirlfluv.supabase.co';
  
  // Try service key first, then fall back to the anon key (for testing)
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zZ3FoaGJxcHl2b25pcmxmbHV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NTY1NTgsImV4cCI6MjA2NTMzMjU1OH0.twGF9Y6clrRtJg_4S1OWHA1vhhYpKzn3ZpFJPGJbmEo';
  
  const keyToUse = supabaseServiceKey || supabaseAnonKey;
  
  if (!keyToUse) {
    console.error('❌ No Supabase key found');
    process.exit(1);
  }

  console.log('🔑 Using key type:', supabaseServiceKey ? 'Service Key' : 'Anon Key (limited permissions)');
  const supabase = createClient(supabaseUrl, keyToUse);

  try {
    console.log('🚀 Setting up database tables and RLS policies...');
    
    if (!supabaseServiceKey) {
      console.log('🚨 The anon key cannot create tables. You need to run this SQL manually in Supabase Dashboard:');
      console.log('\n📋 Copy this SQL to Supabase Dashboard > SQL Editor:\n');
      
      const migrationPath = path.join(__dirname, '../lib/migrations/COMPLETE_SETUP.sql');
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      console.log('─'.repeat(50));
      console.log(migrationSQL);
      console.log('─'.repeat(50));
      console.log('\n✅ Then paste and click RUN in Supabase Dashboard');
      return;
    }
    
    // For service key, try to run directly
    const migrationPath = path.join(__dirname, '../lib/migrations/COMPLETE_SETUP.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split SQL into individual statements and execute them
    const statements = migrationSQL.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
        if (error) throw error;
      }
    }
    
    console.log('✅ Database tables and RLS policies created successfully!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n🚨 Please run the SQL manually in Supabase Dashboard instead');
  }
}

// Run the setup
setupDatabase(); 