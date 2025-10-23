// Test connection to remote Supabase project
// This script tests the connection and provides instructions for setup

const { createClient } = require('@supabase/supabase-js');
const config = require('./remote-config');

async function testConnection() {
  console.log('🔗 Тестирование подключения к Supabase...\n');

  // Initialize Supabase client
  const supabase = createClient(config.projectUrl, config.anonKey);

  try {
    // Test connection by checking our payments table
    console.log('📡 Проверка подключения...');
    const { data, error } = await supabase
      .from('payments')
      .select('count')
      .limit(1);

    if (error && error.message.includes('Project not specified')) {
      console.log('❌ Проект не найден или не настроен');
      console.log('💡 Нужно применить миграции к удаленному проекту\n');
      return false;
    }

    if (error) {
      if (error.message.includes('relation "public.payments" does not exist')) {
        console.log('✅ Подключение к Supabase установлено успешно!');
        console.log('📊 Проект доступен, но таблицы не созданы\n');
        return true;
      } else {
        console.log('⚠️  Подключение работает, но есть ошибка:', error.message);
        console.log('💡 Возможно, таблицы еще не созданы в проекте\n');
        return false;
      }
    }

    console.log('✅ Подключение к Supabase установлено успешно!');
    console.log('📊 Проект доступен и таблицы созданы\n');
    return true;

  } catch (err) {
    console.error('❌ Ошибка подключения:', err.message);
    return false;
  }
}

async function testTables() {
  console.log('🗄️  Проверка таблиц и данных...\n');

  const supabase = createClient(config.projectUrl, config.anonKey);

  // Check if our tables exist and have data
  const tables = [
    { name: 'payments', expectedRows: 0 }
  ];

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table.name)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ Таблица ${table.name}: не найдена (${error.message})`);
      } else {
        const rowCount = data || 0;
        const status = rowCount >= table.expectedRows ? '✅' : '⚠️';
        console.log(`${status} Таблица ${table.name}: ${rowCount} записей (ожидается: ${table.expectedRows})`);
      }
    } catch (err) {
      console.log(`❌ Таблица ${table.name}: ошибка (${err.message})`);
    }
  }

  console.log('');
}

async function main() {
  console.log('🚀 Тестирование подключения к удаленному Supabase проекту');
  console.log(`📍 URL: ${config.projectUrl}`);
  console.log(`🔑 API Key: ${config.anonKey.substring(0, 20)}...\n`);

  const isConnected = await testConnection();

  if (isConnected) {
    await testTables();
    console.log('🎉 Готово! Проект настроен и работает.');
    console.log('\n📝 Следующие шаги:');
    console.log('1. Примените миграции: npm run migrate:remote (нужен токен доступа)');
    console.log('2. Или создайте таблицы вручную в Supabase Studio');
    console.log('3. Запустите пример: node client-example.js');
  } else {
    console.log('\n🔧 Нужно настроить проект:');
    console.log('1. Выполните: npx supabase login');
    console.log('2. Подключитесь: npm run link');
    console.log('3. Примените миграции: npm run migrate:remote');
  }
}

if (require.main === module) {
  main().catch(console.error);
}
