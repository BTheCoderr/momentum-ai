require('../test-env');
const { createClient } = require('@supabase/supabase-js');

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testMobileConnection() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase configuration. Please check test-env.js');
  }

  try {
    console.log('🔍 Testing mobile app database connectivity...\n');

    // Create Supabase client with anon key (simulating mobile app)
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    });

    // Test auth
    console.log('👤 Testing authentication...');
    const testEmail = `test${Date.now()}@gmail.com`;
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'test123!',
      options: {
        data: {
          full_name: 'Test User'
        }
      }
    });

    if (authError) {
      console.error('❌ Auth test failed:', authError.message);
    } else {
      console.log('✅ Auth test passed');
      const userId = authData.user.id;

      // Wait for user to be created in auth.users table
      console.log('⏳ Waiting for user to be created...');
      await delay(2000);

      // Test each table with the authenticated user
      const tables = [
        { 
          name: 'profiles', 
          userIdField: 'id',
          testData: {
            id: userId,
            full_name: 'Test User',
            email: testEmail,
            primary_goal: 'Testing'
          }
        },
        { 
          name: 'user_stats', 
          userIdField: 'user_id',
          testData: {
            user_id: userId,
            total_xp: 0,
            current_level: 1
          }
        },
        { 
          name: 'user_settings', 
          userIdField: 'user_id',
          testData: {
            user_id: userId,
            coach_personality: {},
            memory_settings: {}
          }
        },
        { 
          name: 'coach_settings', 
          userIdField: 'user_id',
          testData: {
            user_id: userId,
            personality_type: 'default',
            communication_style: {}
          }
        },
        { 
          name: 'checkins', 
          userIdField: 'user_id',
          testData: {
            user_id: userId,
            date: new Date().toISOString().split('T')[0],
            mood: 3,
            energy: 3,
            stress: 3,
            wins: 'Test win',
            priorities: 'Test priority'
          }
        }
      ];

      console.log('\n📱 Testing table access with authenticated user...');
      
      for (const table of tables) {
        try {
          // Test SELECT
          const { error: selectError } = await supabase
            .from(table.name)
            .select('*')
            .eq(table.userIdField, userId)
            .limit(1);

          if (selectError) {
            console.error(`❌ ${table.name} SELECT failed:`, selectError.message);
          } else {
            console.log(`✅ ${table.name} SELECT passed`);
          }

          // Test INSERT with proper test data
          const { error: insertError } = await supabase
            .from(table.name)
            .insert([table.testData]);

          if (insertError) {
            console.error(`❌ ${table.name} INSERT failed:`, insertError.message);
          } else {
            console.log(`✅ ${table.name} INSERT passed`);
          }
        } catch (err) {
          console.error(`❌ ${table.name} test failed:`, err.message);
        }
      }

      // Cleanup test user
      await supabase.auth.signOut();
    }

    console.log('\n✨ Mobile app database tests complete!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    throw error;
  }
}

// Run tests
testMobileConnection().catch(console.error); 