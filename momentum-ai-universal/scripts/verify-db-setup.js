require('../test-env');
const { createClient } = require('@supabase/supabase-js');

const TABLES_TO_TEST = [
  'profiles',
  'user_stats',
  'user_settings',
  'coach_settings',
  'checkins'
];

async function verifyDatabaseSetup() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase configuration. Please check test-env.js');
  }

  try {
    console.log('🔍 Starting comprehensive database verification...\n');

    // Create Supabase client with anon key (simulating mobile app access)
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    });

    // Test each table
    console.log('📱 Testing mobile app table access...');
    for (const table of TABLES_TO_TEST) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error) {
          console.error(`❌ ${table}: ${error.message}`);
        } else {
          console.log(`✅ ${table}: Accessible`);
        }
      } catch (err) {
        console.error(`❌ ${table}: ${err.message}`);
      }
    }

    // Test RLS policies
    console.log('\n🔒 Testing RLS policies...');
    const testUser = {
      email: 'test@example.com',
      password: 'test123!'
    };

    try {
      // Sign up test user
      const { data: authData, error: authError } = await supabase.auth.signUp(testUser);
      if (authError) throw authError;

      // Test insert operations
      for (const table of TABLES_TO_TEST) {
        const { error: insertError } = await supabase
          .from(table)
          .insert([{ user_id: authData.user.id }]);

        console.log(`${table} insert: ${insertError ? '❌' : '✅'}`);
      }

      // Cleanup test user
      await supabase.auth.signOut();
    } catch (err) {
      console.error('RLS test failed:', err.message);
    }

    console.log('\n✨ Verification complete!');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    throw error;
  }
}

// Run verification
verifyDatabaseSetup().catch(console.error); 