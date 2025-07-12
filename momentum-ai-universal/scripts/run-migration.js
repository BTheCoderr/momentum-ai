const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Import environment setup
require('./setup-env');

async function runMigration(migrationFile) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    console.log('🔌 Connecting to database...');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    });

    console.log('🔍 Reading migration file:', migrationFile);
    const sql = fs.readFileSync(migrationFile, 'utf8');

    console.log('🚀 Running migration...\n');
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (!statement.trim()) continue;
      
      const { error } = await supabase.rpc('exec_sql', {
        sql_query: statement
      });
      
      if (error) {
        console.error('❌ Migration failed:', error);
        throw error;
      }
    }

    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Check if migration file is provided
const migrationFile = process.argv[2];
if (!migrationFile) {
  console.error('Please provide a migration file path');
  process.exit(1);
}

// Run migration
runMigration(migrationFile).catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
}); 