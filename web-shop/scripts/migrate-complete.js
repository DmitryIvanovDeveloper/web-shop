#!/usr/bin/env node

/**
 * Полная миграция данных с использованием MCP Supabase
 * Требует TARGET_SUPABASE_SERVICE_KEY для автоматического выполнения
 */

const { createClient } = require('@supabase/supabase-js');

const SOURCE_URL = 'https://qosblydpgejtnyvzctpg.supabase.co';
const SOURCE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvc2JseWRwZ2VqdG55dnpjdHBnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTE0MjI2MiwiZXhwIjoyMDc2NzE4MjYyfQ.XXFWhAZGK8-yTq3MSWtzSsYqgNi1PSIz7AjB_XbYjr4';

const TARGET_URL = 'https://syumvakzattjoufuvyzm.supabase.co';
const TARGET_KEY = process.env.TARGET_SUPABASE_SERVICE_KEY;

const tables = [
  'app_configs', 'page_configs', 'templates', 'products',
  'offer_scenarios', 'offer_engine_rules', 'users', 'user_offer_context',
  'transaction_log', 'daily_rewards', 'daily_reward_claims',
  'languages', 'translations', 'projects'
];

const compositeKeys = {
  'offer_scenarios': ['app_id', 'slug'],
  'offer_engine_rules': ['app_id'],
  'languages': ['code']
};

async function migrateTable(table, sourceClient, targetClient) {
  console.log(`\n📦 ${table}`);
  
  const { data, error } = await sourceClient.from(table).select('*');
  
  if (error) {
    if (error.code === 'PGRST116') {
      console.log(`   ⏭️  Skipped (not found)`);
      return { success: true, count: 0, skipped: true };
    }
    console.error(`   ❌ ${error.message}`);
    return { success: false, count: 0, error: error.message };
  }
  
  if (!data || data.length === 0) {
    console.log(`   ℹ️  Empty`);
    return { success: true, count: 0, skipped: true };
  }
  
  console.log(`   📥 ${data.length} records`);
  
  const batchSize = 100;
  let total = 0;
  
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    
    const options = compositeKeys[table] 
      ? { onConflict: compositeKeys[table].join(',') }
      : { onConflict: 'id' };
    
    const { error: e } = await targetClient.from(table).upsert(batch, options);
    
    if (e) {
      console.error(`   ❌ ${e.message}`);
      return { success: false, count: total, error: e.message };
    }
    
    total += batch.length;
    process.stdout.write(`   ${total}/${data.length}\r`);
  }
  
  console.log(`   ✅ ${total} records`);
  return { success: true, count: total };
}

async function main() {
  console.log('🚀 Complete Data Migration');
  console.log('='.repeat(60));
  
  if (!TARGET_KEY) {
    console.error('❌ TARGET_SUPABASE_SERVICE_KEY required!');
    console.error('\nGet it from:');
    console.error('https://supabase.com/dashboard/project/syumvakzattjoufuvyzm/settings/api');
    console.error('\nThen run:');
    console.error('export TARGET_SUPABASE_SERVICE_KEY="your-key"');
    console.error('node scripts/migrate-complete.js');
    process.exit(1);
  }
  
  const sourceClient = createClient(SOURCE_URL, SOURCE_KEY);
  const targetClient = createClient(TARGET_URL, TARGET_KEY);
  
  const results = [];
  
  for (const table of tables) {
    const result = await migrateTable(table, sourceClient, targetClient);
    results.push({ table, ...result });
    await new Promise(r => setTimeout(r, 300));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 Results:');
  console.log('='.repeat(60));
  
  let total = 0;
  let success = 0;
  
  results.forEach(({ table, success: s, count, skipped }) => {
    if (skipped) {
      console.log(`⏭️  ${table}`);
    } else if (s) {
      console.log(`✅ ${table}: ${count}`);
      total += count;
      success++;
    } else {
      console.log(`❌ ${table}`);
    }
  });
  
  console.log('='.repeat(60));
  console.log(`✅ ${success}/${tables.length} tables, ${total} records`);
}

main().catch(console.error);

