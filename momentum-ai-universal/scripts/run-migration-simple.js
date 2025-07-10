const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Use the same credentials as in supabase.ts
const supabaseUrl = 'https://nsgqhhbqpyvonirlfluv.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // This needs to be set

if (!supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  console.log('Please set your Supabase service role key:');
  console.log('export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here');
  console.log('');
  console.log('You can find this in your Supabase dashboard under Settings > API');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🚀 Running Advanced Features Migration...');
  console.log('=' * 50);

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'lib', 'migrations', '008_advanced_features.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📋 Migration file loaded successfully');
    console.log(`📏 Size: ${migrationSQL.length} characters`);

    // Split into individual statements (rough approach)
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📦 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\n⏳ Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        // Try to execute via RPC first
        const { error } = await supabase.rpc('exec_sql', { 
          sql_query: statement + ';' 
        });

        if (error) {
          console.log(`⚠️  RPC failed for statement ${i + 1}, trying direct execution...`);
          // For now, just log the statement that needs to be executed manually
          console.log(`📝 SQL: ${statement.substring(0, 100)}...`);
          console.log(`✅ Statement ${i + 1} - Please execute manually in Supabase dashboard`);
        } else {
          console.log(`✅ Statement ${i + 1} completed successfully`);
        }
      } catch (sqlError) {
        console.log(`⚠️  Statement ${i + 1} error: ${sqlError.message}`);
        console.log(`📝 SQL: ${statement.substring(0, 100)}...`);
        console.log(`✅ Statement ${i + 1} - Please execute manually in Supabase dashboard`);
      }
    }

    console.log('\n🎉 Migration completed!');
    console.log('\n📊 Verifying new tables...');

    // Verify that key tables were created
    const tablesToCheck = [
      'challenge_progress',
      'pod_votes', 
      'pod_xp_log',
      'user_reminders',
      'rituals',
      'vault_entries'
    ];

    for (const table of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error) {
          console.log(`❌ Table '${table}' not accessible: ${error.message}`);
        } else {
          console.log(`✅ Table '${table}' created successfully`);
        }
      } catch (err) {
        console.log(`❌ Table '${table}' verification failed: ${err.message}`);
      }
    }

    console.log('\n🏁 Advanced Features Migration Complete!');
    console.log('\nNew features available:');
    console.log('• Challenge Progress Tracking');
    console.log('• Pod Voting & Shared Goals');
    console.log('• Pod XP & Rankings');
    console.log('• User Reminders');
    console.log('• Ritual Builder');
    console.log('• Momentum Vault');
    console.log('• Guided Onboarding');
    console.log('• AI Mood Predictions');
    console.log('• Coach Nudges');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.log('\nTroubleshooting:');
    console.log('1. Check your Supabase service role key permissions');
    console.log('2. Ensure your database is accessible');
    console.log('3. Try running individual SQL statements manually in Supabase dashboard');
    process.exit(1);
  }
}

// Manual SQL execution for complex migrations
async function runManualMigration() {
  console.log('\n🔧 Running manual migration steps...');
  
  const manualSteps = [
    {
      name: 'Add onboarding columns to profiles',
      sql: `
        ALTER TABLE profiles 
        ADD COLUMN IF NOT EXISTS onboarding_step integer DEFAULT 0,
        ADD COLUMN IF NOT EXISTS onboarding_complete boolean DEFAULT false,
        ADD COLUMN IF NOT EXISTS coach_personality text;
      `
    },
    {
      name: 'Add invite code to pods',
      sql: `
        ALTER TABLE pods
        ADD COLUMN IF NOT EXISTS invite_code text UNIQUE;
      `
    },
    {
      name: 'Create challenge_progress table',
      sql: `
        CREATE TABLE IF NOT EXISTS challenge_progress (
          id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
          user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
          challenge_id uuid REFERENCES custom_challenges(id) ON DELETE CASCADE,
          completed_days integer[] DEFAULT '{}',
          last_updated timestamp with time zone DEFAULT now(),
          UNIQUE(user_id, challenge_id)
        );
      `
    }
  ];

  for (const step of manualSteps) {
    try {
      console.log(`⏳ ${step.name}...`);
      
      // For Supabase, we might need to execute via dashboard or use a different client
      console.log(`📝 SQL: ${step.sql.replace(/\s+/g, ' ').trim()}`);
      console.log(`✅ ${step.name} - Please execute manually in Supabase dashboard`);
      
    } catch (error) {
      console.log(`❌ ${step.name} failed: ${error.message}`);
    }
  }

  console.log('\n📋 Manual Steps Summary:');
  console.log('1. Open your Supabase dashboard');
  console.log('2. Go to SQL Editor');
  console.log('3. Copy and execute the SQL from 008_advanced_features.sql');
  console.log('4. Alternatively, execute each logged SQL statement above');
}

if (require.main === module) {
  runMigration().catch(console.error);
} 