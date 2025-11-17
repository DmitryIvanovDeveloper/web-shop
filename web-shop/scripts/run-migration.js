#!/usr/bin/env node

/**
 * Migration script to create offer_scenarios and offer_engine_rules tables
 * Run with: node scripts/run-migration.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env.local manually
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        process.env[key] = value;
      }
    });
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const migrationSQL = `
-- Create offer_scenarios table
CREATE TABLE IF NOT EXISTS public.offer_scenarios (
  app_id TEXT NOT NULL,
  slug TEXT NOT NULL,
  priority INTEGER,
  tags TEXT[],
  configuration JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (app_id, slug)
);

-- Create offer_engine_rules table
CREATE TABLE IF NOT EXISTS public.offer_engine_rules (
  app_id TEXT NOT NULL,
  version TEXT NOT NULL,
  rule_tree JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (app_id, version)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_offer_scenarios_app_id ON public.offer_scenarios(app_id);
CREATE INDEX IF NOT EXISTS idx_offer_engine_rules_app_id ON public.offer_engine_rules(app_id);

-- Enable RLS
ALTER TABLE public.offer_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_engine_rules ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Service role can manage offer_scenarios" ON public.offer_scenarios;
DROP POLICY IF EXISTS "Service role can manage offer_engine_rules" ON public.offer_engine_rules;
DROP POLICY IF EXISTS "Authenticated users can read offer_scenarios" ON public.offer_scenarios;
DROP POLICY IF EXISTS "Authenticated users can read offer_engine_rules" ON public.offer_engine_rules;

-- Create policies for service_role
CREATE POLICY "Service role can manage offer_scenarios"
  ON public.offer_scenarios
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage offer_engine_rules"
  ON public.offer_engine_rules
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create policies for authenticated users
CREATE POLICY "Authenticated users can read offer_scenarios"
  ON public.offer_scenarios
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read offer_engine_rules"
  ON public.offer_engine_rules
  FOR SELECT
  TO authenticated
  USING (true);
`;

async function runMigration() {
  console.log('🚀 Starting migration...');
  console.log(`📡 Connecting to: ${supabaseUrl}`);

  try {
    // Execute migration using rpc or direct SQL
    // Note: Supabase JS client doesn't support raw SQL directly
    // We need to use the REST API or PostgREST
    
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: migrationSQL }),
    });

    if (response.ok) {
      console.log('✅ Migration completed successfully!');
      const result = await response.json();
      console.log('Result:', result);
    } else {
      const error = await response.text();
      console.error('❌ Migration failed:', error);
      console.log('\n💡 Trying alternative method...');
      
      // Alternative: Try to execute via Supabase client by creating tables through API
      await createTablesViaAPI();
    }
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    console.log('\n📝 Please run the migration manually:');
    console.log('   1. Open: https://supabase.com/dashboard/project/qosblydpgejtnyvzctpg/sql/new');
    console.log('   2. Copy SQL from: supabase-migration.sql');
    console.log('   3. Paste and run');
    process.exit(1);
  }
}

async function createTablesViaAPI() {
  console.log('🔄 Trying to create tables via API...');
  
  // This won't work for DDL, but we can at least verify connection
  const { data, error } = await supabase.from('offer_scenarios').select('count').limit(0);
  
  if (error) {
    if (error.message.includes('relation') && error.message.includes('does not exist')) {
      console.log('ℹ️  Table does not exist - need to create via SQL');
    } else {
      console.error('❌ Error:', error.message);
    }
  } else {
    console.log('✅ Connection successful');
  }
}

runMigration();

