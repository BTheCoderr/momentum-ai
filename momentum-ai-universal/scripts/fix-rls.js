const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔒 Fixing RLS policies for messages table...');
console.log('URL:', supabaseUrl);
console.log('Key exists:', !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixRLS() {
  try {
    // Test connection first
    console.log('Testing connection...');
    const { data, error } = await supabase.from('messages').select('count').limit(1);
    if (error) {
      console.error('Connection test failed:', error);
      return;
    }
    console.log('✅ Connection successful');
    
    // Drop existing policies
    console.log('Dropping existing policies...');
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql_query: `
        DROP POLICY IF EXISTS "Users can insert their own messages" ON messages;
        DROP POLICY IF EXISTS "Users can view their own messages" ON messages;
        DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
        DROP POLICY IF EXISTS "Users can delete their own messages" ON messages;
      `
    });
    
    if (dropError) {
      console.error('Error dropping policies:', dropError);
      return;
    }
    console.log('✅ Existing policies dropped');
    
    // Create new policies with proper UUID casting
    console.log('Creating new policies...');
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE POLICY "Users can insert their own messages" ON messages
          FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
        
        CREATE POLICY "Users can view their own messages" ON messages
          FOR SELECT USING (auth.uid()::text = user_id::text);
        
        CREATE POLICY "Users can update their own messages" ON messages
          FOR UPDATE USING (auth.uid()::text = user_id::text);
        
        CREATE POLICY "Users can delete their own messages" ON messages
          FOR DELETE USING (auth.uid()::text = user_id::text);
      `
    });
    
    if (createError) {
      console.error('Error creating policies:', createError);
      return;
    }
    
    console.log('✅ RLS policies fixed successfully');
  } catch (error) {
    console.error('❌ Error fixing RLS policies:', error);
  }
}

fixRLS(); 