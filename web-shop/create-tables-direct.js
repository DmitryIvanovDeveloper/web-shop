const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qosblydpgejtnyvzctpg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvc2JseWRwZ2VqdG55dnpjdHBnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTE0MjI2MiwiZXhwIjoyMDc2NzE4MjYyfQ.XXFWhAZGK8-yTq3MSWtzSsYqgNi1PSIz7AjB_XbYjr4';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTables() {
  try {
    console.log('Testing connection...');
    
    // Test connection
    const { data: testData, error: testError } = await supabase
      .from('patch_notes')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('Connection test failed:', testError);
      return;
    }
    
    console.log('Connection successful. Creating tables...');
    
    // Try to create a test reward to see if table exists
    const testReward = {
      id: 'test-reward-' + Date.now(),
      app_id: 'test-app',
      type: 'points',
      title: 'Test Reward',
      description: 'Test description',
      points: 100,
      is_active: true
    };
    
    const { error: insertError } = await supabase
      .from('daily_rewards')
      .insert(testReward);
    
    if (insertError && insertError.code === '42P01') {
      console.log('Table daily_rewards does not exist. Creating via SQL...');
      
      // Since we can't use exec_sql, let's try a different approach
      // We'll use the SQL editor in Supabase dashboard or create the tables manually
      console.log('Please create the tables manually in Supabase dashboard:');
      console.log(`
CREATE TABLE IF NOT EXISTS public.daily_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  points INT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.daily_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access for all users" ON public.daily_rewards FOR SELECT USING (TRUE);
CREATE POLICY "Allow insert access for authenticated users" ON public.daily_rewards FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow update access for authenticated users" ON public.daily_rewards FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow delete access for authenticated users" ON public.daily_rewards FOR DELETE USING (auth.role() = 'authenticated');

CREATE TABLE IF NOT EXISTS public.daily_reward_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  reward_id UUID NOT NULL REFERENCES public.daily_rewards(id) ON DELETE CASCADE,
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  points_awarded INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.daily_reward_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access for own claims" ON public.daily_reward_claims FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Allow insert access for own claims" ON public.daily_reward_claims FOR INSERT WITH CHECK (user_id = auth.uid());
      `);
      
    } else if (insertError) {
      console.error('Error inserting test reward:', insertError);
    } else {
      console.log('Tables already exist! Test reward created successfully.');
      
      // Clean up test reward
      await supabase
        .from('daily_rewards')
        .delete()
        .eq('id', testReward.id);
      
      console.log('Test reward cleaned up.');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createTables();
