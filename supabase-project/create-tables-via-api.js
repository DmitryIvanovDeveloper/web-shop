// Create tables via Supabase API
// Alternative to CLI migrations when access token is not available

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const config = require('./remote-config');

async function createTablesViaAPI() {
  console.log('🗄️  Создание таблиц через API...\n');

  // For this we need the service role key, not the anon key
  // Since we only have anon key, we'll provide instructions for manual setup

  console.log('❌ Для создания таблиц через API нужен service_role ключ');
  console.log('💡 Рекомендуется использовать Supabase Studio для создания таблиц\n');

  console.log('📋 Вариант 1: Через Supabase Studio');
  console.log('1. Перейдите в: https://supabase.com/dashboard/project/qosblydpgejtnyvzctpg/sql');
  console.log('2. Выполните SQL из файла setup-tables.sql');
  console.log('3. Или создайте таблицы вручную\n');

  console.log('📋 Вариант 2: Через CLI (нужен токен доступа)');
  console.log('1. Выполните: npx supabase login');
  console.log('2. Подключитесь: npm run link');
  console.log('3. Примените миграции: npm run migrate:remote\n');

  // Show current project info
  console.log('📊 Информация о проекте:');
  console.log(`- URL: ${config.projectUrl}`);
  console.log(`- Project ID: ${config.projectId}`);
  console.log(`- Anon Key: ${config.anonKey.substring(0, 20)}...`);

  // Try to get project info
  const supabase = createClient(config.projectUrl, config.anonKey);

  try {
    console.log('\n🔍 Проверка текущего состояния проекта...');

    // Try to get project settings (this might work with anon key)
    const { data: settings, error: settingsError } = await supabase
      .from('products')
      .select('*')
      .limit(1);

    if (settingsError) {
      console.log('✅ Проект готов для настройки таблиц');
      console.log('❌ Таблицы еще не созданы (это нормально)');
    } else {
      console.log('✅ Таблицы уже существуют в проекте');
    }

  } catch (error) {
    console.log('⚠️  Не удалось проверить состояние:', error.message);
  }

  console.log('\n🎯 Рекомендация: используйте Supabase Studio для быстрой настройки');
}

async function main() {
  await createTablesViaAPI();
}

if (require.main === module) {
  main().catch(console.error);
}
