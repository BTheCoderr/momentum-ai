const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Fixing messages table structure and RLS policies...');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixMessagesTable() {
  try {
    console.log('🔍 Checking current messages table structure...');
    
    // Test connection first
    const { data: testData, error: testError } = await supabase
      .from('messages')
      .select('count')
      .limit(1);
    
    if (testError && testError.code !== '42P01') {
      console.error('Connection test failed:', testError);
      return;
    }
    
    console.log('✅ Connection successful');
    
    // Drop and recreate the table with proper structure
    console.log('🗑️  Dropping existing messages table...');
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql_query: `
        DROP TABLE IF EXISTS public.messages CASCADE;
      `
    });
    
    if (dropError) {
      console.error('Error dropping table:', dropError);
      return;
    }
    
    console.log('🏗️  Creating new messages table with proper structure...');
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE public.messages (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          sender TEXT NOT NULL CHECK (sender IN ('user', 'ai', 'system', 'coach')),
          type TEXT DEFAULT 'text',
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          metadata JSONB DEFAULT '{}'::jsonb
        );
        
        -- Add indexes for performance
        CREATE INDEX IF NOT EXISTS idx_messages_user_id ON public.messages(user_id);
        CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON public.messages(timestamp DESC);
        CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender);
        
        -- Enable RLS
        ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
        
        -- Create RLS policies
        CREATE POLICY "messages_select_policy" ON public.messages
          FOR SELECT TO authenticated
          USING (auth.uid() = user_id);
          
        CREATE POLICY "messages_insert_policy" ON public.messages
          FOR INSERT TO authenticated
          WITH CHECK (auth.uid() = user_id);
          
        CREATE POLICY "messages_update_policy" ON public.messages
          FOR UPDATE TO authenticated
          USING (auth.uid() = user_id)
          WITH CHECK (auth.uid() = user_id);
          
        CREATE POLICY "messages_delete_policy" ON public.messages
          FOR DELETE TO authenticated
          USING (auth.uid() = user_id);
        
        -- Grant permissions
        GRANT ALL ON public.messages TO authenticated;
        GRANT USAGE ON SCHEMA public TO authenticated;
        
        -- Grant sequence permissions for UUID generation
        GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
      `
    });
    
    if (createError) {
      console.error('Error creating table:', createError);
      return;
    }
    
    console.log('✅ Messages table created successfully!');
    
    // Test the table by trying to query it
    console.log('🧪 Testing new table...');
    const { data: testMessages, error: testMessagesError } = await supabase
      .from('messages')
      .select('*')
      .limit(1);
    
    if (testMessagesError) {
      console.error('Error testing table:', testMessagesError);
      return;
    }
    
    console.log('✅ Table test successful!');
    
    // Test the RLS policies
    console.log('🧪 Testing RLS policies...');
    const { data: policies, error: policiesError } = await supabase.rpc('exec_sql', {
      sql_query: `
        SELECT policyname, cmd, qual, with_check
        FROM pg_policies 
        WHERE tablename = 'messages';
      `
    });
    
    if (policiesError) {
      console.error('Error checking policies:', policiesError);
      return;
    }
    
    console.log('✅ RLS policies in place:', policies);
    
    console.log('🎉 Messages table fix completed successfully!');
    console.log('');
    console.log('📝 Summary:');
    console.log('  - Messages table recreated with proper UUID primary key');
    console.log('  - RLS policies configured for authenticated users');
    console.log('  - Indexes added for performance');
    console.log('  - Ready for message insertion!');
    
  } catch (error) {
    console.error('❌ Error fixing messages table:', error);
  }
}

fixMessagesTable(); 