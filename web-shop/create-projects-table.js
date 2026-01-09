const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qosblydpgejtnyvzctpg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvc2JseWRwZ2VqdG55dnpjdHBnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTE0MjI2MiwiZXhwIjoyMDc2NzE4MjYyfQ.XXFWhAZGK8-yTq3MSWtzSsYqgNi1PSIz7AjB_XbYjr4';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createProjectsTable() {
  try {
    console.log('Creating projects table...');

    // First, let's try to create the projects table using raw SQL via REST API
    // Since exec_sql doesn't exist, we'll use the Supabase REST API directly

    const createTableSQL = `
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
    `;

    console.log('Please run this SQL in your Supabase SQL Editor:');
    console.log('='.repeat(50));
    console.log(createTableSQL);
    console.log('='.repeat(50));

    // Try to test if table exists by attempting a select
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .limit(1);

    if (error && error.code === 'PGRST116') {
      console.log('❌ Table "projects" still does not exist.');
      console.log('Please create it manually in Supabase SQL Editor using the SQL above.');
      return false;
    } else if (error) {
      console.log('Unexpected error:', error);
      return false;
    } else {
      console.log('✅ Table "projects" already exists!');
      return true;
    }

  } catch (error) {
    console.error('Unexpected error:', error);
    return false;
  }
}

createProjectsTable();