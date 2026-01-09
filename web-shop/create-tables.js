const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qosblydpgejtnyvzctpg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvc2JseWRwZ2VqdG55dnpjdHBnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTE0MjI2MiwiZXhwIjoyMDc2NzE4MjYyfQ.XXFWhAZGK8-yTq3MSWtzSsYqgNi1PSIz7AjB_XbYjr4';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTables() {
  try {
    console.log('Creating daily_rewards table...');
    
    // Create daily_rewards table
    const { error: rewardsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.daily_rewards (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          app_id TEXT NOT NULL,
          type TEXT NOT NULL CHECK (type IN ('points', 'currency', 'item')),
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          points INTEGER NOT NULL CHECK (points > 0),
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (rewardsError) {
      console.error('Error creating daily_rewards table:', rewardsError);
    } else {
      console.log('daily_rewards table created successfully');
    }

    console.log('Creating daily_reward_claims table...');

    // Create daily_reward_claims table
    const { error: claimsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.daily_reward_claims (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id TEXT NOT NULL,
          reward_id UUID NOT NULL REFERENCES public.daily_rewards(id) ON DELETE CASCADE,
          claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          points_awarded INTEGER NOT NULL CHECK (points_awarded > 0),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (claimsError) {
      console.error('Error creating daily_reward_claims table:', claimsError);
    } else {
      console.log('daily_reward_claims table created successfully');
    }

    console.log('Creating projects table...');

    // Create projects table
    const { error: projectsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.projects (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          app_id VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'draft')),
          merchant_id UUID NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (projectsError) {
      console.error('Error creating projects table:', projectsError);
    } else {
      console.log('projects table created successfully');

      // Create indexes for projects table
      const { error: indexError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE INDEX IF NOT EXISTS idx_projects_merchant_id ON public.projects(merchant_id);
          CREATE INDEX IF NOT EXISTS idx_projects_app_id ON public.projects(app_id);
          CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
          CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON public.projects(updated_at DESC);
        `
      });

      if (indexError) {
        console.error('Error creating indexes for projects table:', indexError);
      } else {
        console.log('Indexes for projects table created successfully');
      }
    }

    console.log('Setting up RLS policies...');
    
    // Enable RLS and create policies for daily_rewards
    const { error: rlsError1 } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.daily_rewards ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Allow authenticated users full access to daily_rewards" ON public.daily_rewards 
        FOR ALL USING (auth.role() = 'authenticated');
      `
    });
    
    if (rlsError1) {
      console.error('Error setting up RLS for daily_rewards:', rlsError1);
    }

    // Enable RLS and create policies for daily_reward_claims
    const { error: rlsError2 } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.daily_reward_claims ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Allow users to read their own claims" ON public.daily_reward_claims
        FOR SELECT USING (user_id = auth.uid());

        CREATE POLICY "Allow users to create their own claims" ON public.daily_reward_claims
        FOR INSERT WITH CHECK (user_id = auth.uid());
      `
    });

    if (rlsError2) {
      console.error('Error setting up RLS for daily_reward_claims:', rlsError2);
    }

    // Enable RLS and create policies for projects
    const { error: rlsError3 } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Allow authenticated users full access to projects" ON public.projects
        FOR ALL USING (auth.role() = 'authenticated');
      `
    });

    if (rlsError3) {
      console.error('Error setting up RLS for projects:', rlsError3);
    }

    console.log('Tables created successfully!');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createTables();
