#!/usr/bin/env node

/**
 * Полная миграция данных между Supabase проектами
 * Использует MCP Supabase для выполнения миграции
 */

const { createClient } = require('@supabase/supabase-js');

const SOURCE_URL = 'https://qosblydpgejtnyvzctpg.supabase.co';
const SOURCE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvc2JseWRwZ2VqdG55dnpjdHBnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTE0MjI2MiwiZXhwIjoyMDc2NzE4MjYyfQ.XXFWhAZGK8-yTq3MSWtzSsYqgNi1PSIz7AjB_XbYjr4';

const TARGET_PROJECT_ID = 'syumvakzattjoufuvyzm';

const tables = [
  'app_configs',
  'page_configs',
  'templates',
  'products',
  'offer_scenarios',
  'offer_engine_rules',
  'users',
  'user_offer_context',
  'transaction_log',
  'daily_rewards',
  'daily_reward_claims',
  'languages',
  'translations',
  'projects'
];

async function migrateTable(tableName) {
  console.log(`\n📦 ${tableName}`);
  
  const sourceClient = createClient(SOURCE_URL, SOURCE_KEY);
  
  try {
    // Читаем все данные
    const { data, error } = await sourceClient.from(tableName).select('*');
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`   ⏭️  Table doesn't exist`);
        return { success: true, count: 0, skipped: true };
      }
      console.error(`   ❌ Read error: ${error.message}`);
      return { success: false, count: 0, error: error.message };
    }
    
    if (!data || data.length === 0) {
      console.log(`   ℹ️  Empty`);
      return { success: true, count: 0, skipped: true };
    }
    
    console.log(`   📥 Found ${data.length} records`);
    
    // Для выполнения через MCP нужно использовать execute_sql
    // Но для этого нужен Service Role Key целевого проекта
    // Пока сохраняем данные для ручного выполнения или используем REST API
    
    // Пробуем использовать REST API для записи, если есть ключ
    const targetKey = process.env.TARGET_SUPABASE_SERVICE_KEY;
    
    if (targetKey) {
      const targetClient = createClient(`https://${TARGET_PROJECT_ID}.supabase.co`, targetKey);
      
      const batchSize = 100;
      let totalInserted = 0;
      
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        
        let upsertOptions = { onConflict: 'id' };
        if (tableName === 'offer_scenarios') {
          upsertOptions = { onConflict: 'app_id,slug' };
        } else if (tableName === 'offer_engine_rules') {
          upsertOptions = { onConflict: 'app_id' };
        }
        
        const { error: writeError } = await targetClient
          .from(tableName)
          .upsert(batch, upsertOptions);
        
        if (writeError) {
          console.error(`   ❌ Write error: ${writeError.message}`);
          return { success: false, count: totalInserted, error: writeError.message };
        }
        
        totalInserted += batch.length;
        process.stdout.write(`   Progress: ${totalInserted}/${data.length}\r`);
      }
      
      console.log(`   ✅ Migrated ${totalInserted} records`);
      return { success: true, count: totalInserted };
    } else {
      // Если нет ключа, возвращаем данные для использования через MCP
      console.log(`   📋 Data ready for migration (${data.length} records)`);
      return { success: true, count: data.length, data };
    }
    
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return { success: false, count: 0, error: error.message };
  }
}

async function main() {
  console.log('🚀 Data Migration via MCP Supabase');
  console.log(`📤 Source: qosblydpgejtnyvzctpg`);
  console.log(`📥 Target: ${TARGET_PROJECT_ID}`);
  console.log('='.repeat(60));
  
  const results = [];
  const dataToMigrate = {};
  
  for (const table of tables) {
    const result = await migrateTable(table);
    results.push({ table, ...result });
    
    if (result.data) {
      dataToMigrate[table] = result.data;
    }
    
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary:');
  console.log('='.repeat(60));
  
  let total = 0;
  let success = 0;
  let needsManual = false;
  
  results.forEach(({ table, success: s, count, skipped, data }) => {
    if (skipped) {
      console.log(`⏭️  ${table}`);
    } else if (s && count > 0 && !data) {
      console.log(`✅ ${table}: ${count} records`);
      total += count;
      success++;
    } else if (data) {
      console.log(`📋 ${table}: ${count} records (ready for MCP)`);
      total += count;
      needsManual = true;
    } else {
      console.log(`❌ ${table}: failed`);
    }
  });
  
  console.log('='.repeat(60));
  
  if (needsManual && !process.env.TARGET_SUPABASE_SERVICE_KEY) {
    console.log(`\n💡 To complete migration via MCP:`);
    console.log(`   1. Get Service Role Key from target project settings`);
    console.log(`   2. Run: export TARGET_SUPABASE_SERVICE_KEY="your-key"`);
    console.log(`   3. Run this script again`);
    console.log(`\n   Or use MCP Supabase execute_sql with the data above`);
  } else {
    console.log(`\n✅ Migration complete: ${success}/${tables.length} tables, ${total} records`);
  }
}

main().catch(console.error);

