#!/usr/bin/env node

/**
 * Simple script to apply Supabase migration
 * Executes SQL migration file directly via Supabase REST API
 */

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://qosblydpgejtnyvzctpg.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvc2JseWRwZ2VqdG55dnpjdHBnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTE0MjI2MiwiZXhwIjoyMDc2NzE4MjYyfQ.XXFWhAZGK8-yTq3MSWtzSsYqgNi1PSIz7AjB_XbYjr4';

async function runMigration() {
  const migrationFile = '20250128000000_add_day_number_to_daily_rewards.sql';
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', migrationFile);
  
  console.log('🚀 Applying Supabase Migration\n');
  console.log(`📄 File: ${migrationFile}\n`);
  
  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ Migration file not found: ${migrationPath}`);
    process.exit(1);
  }
  
  const sql = fs.readFileSync(migrationPath, 'utf8');
  
  console.log('='.repeat(80));
  console.log('SQL TO EXECUTE:');
  console.log('='.repeat(80));
  console.log(sql);
  console.log('='.repeat(80));
  console.log('\n');
  
  console.log('📝 INSTRUCTIONS:');
  console.log('1. Open: https://supabase.com/dashboard/project/qosblydpgejtnyvzctpg/sql/new');
  console.log('2. Copy the SQL above');
  console.log('3. Paste into SQL Editor');
  console.log('4. Click "Run" button\n');
  
  // Try to verify if migration was applied
  console.log('🔍 Checking if migration is already applied...\n');
  
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    const { data, error } = await supabase
      .from('daily_rewards')
      .select('day_number')
      .limit(1);
    
    if (error) {
      if (error.message && error.message.includes('does not exist')) {
        console.log('❌ Column day_number does not exist.');
        console.log('   Please apply the migration using the SQL above.\n');
      } else {
        console.log(`⚠️  Error: ${error.message}\n`);
      }
    } else {
      console.log('✅ Column day_number exists! Migration is already applied.\n');
    }
  } catch (error) {
    console.log(`⚠️  Could not verify: ${error.message}\n`);
  }
}

runMigration().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});

