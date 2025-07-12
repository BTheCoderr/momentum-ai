require('../test-env');
const { createClient } = require('@supabase/supabase-js');

async function testDatabase() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase configuration. Please check test-env.js');
  }

  try {
    console.log('🔍 Starting comprehensive database tests...\n');

    // Create Supabase client with anon key
    console.log('Initializing Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      },
      db: {
        schema: 'public'
      }
    });

    // Test database connection
    console.log('Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (testError) {
      throw new Error(`Database connection test failed: ${testError.message}`);
    }
    console.log('✅ Database connection successful');

    // Test table access
    console.log('\n📋 Testing table access...');
    
    // Test 1: Profiles
    const { error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      throw new Error(`Failed to access profiles table: ${profilesError.message}`);
    }
    console.log('✅ Profiles table accessible');

    // Test 2: User Stats
    const { error: statsError } = await supabase
      .from('user_stats')
      .select('*')
      .limit(1);
    
    if (statsError) {
      throw new Error(`Failed to access user_stats table: ${statsError.message}`);
    }
    console.log('✅ User Stats table accessible');

    // Test 3: Checkins
    const { error: checkinsError } = await supabase
      .from('checkins')
      .select('*')
      .limit(1);
    
    if (checkinsError) {
      throw new Error(`Failed to access checkins table: ${checkinsError.message}`);
    }
    console.log('✅ Checkins table accessible');

    // Test 4: Coach Settings
    const { error: coachSettingsError } = await supabase
      .from('coach_settings')
      .select('*')
      .limit(1);
    
    if (coachSettingsError) {
      throw new Error(`Failed to access coach_settings table: ${coachSettingsError.message}`);
    }
    console.log('✅ Coach Settings table accessible');

    // Test 5: User Settings
    const { error: userSettingsError } = await supabase
      .from('user_settings')
      .select('*')
      .limit(1);
    
    if (userSettingsError) {
      throw new Error(`Failed to access user_settings table: ${userSettingsError.message}`);
    }
    console.log('✅ User Settings table accessible');

    console.log('\n✅ All basic tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    throw error;
  }
}

// Run the tests
testDatabase().catch(console.error); 