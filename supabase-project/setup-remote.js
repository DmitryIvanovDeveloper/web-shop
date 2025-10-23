#!/usr/bin/env node

// Setup script for connecting to remote Supabase project
// Run: node setup-remote.js

const fs = require('fs');
const path = require('path');

const REMOTE_CONFIG = {
  projectId: 'qosblydpgejtnyvzctpg',
  projectUrl: 'https://qosblydpgejtnyvzctpg.supabase.co',
  instructions: `
=== НАСТРОЙКА ПОДКЛЮЧЕНИЯ К УДАЛЕННОМУ SUPABASE ПРОЕКТУ ===

Для подключения к проекту ${'qosblydpgejtnyvzctpg'} выполните следующие шаги:

1. АВТОРИЗАЦИЯ В SUPABASE CLI:
   Выполните команду: npx supabase login
   Это откроет браузер для авторизации

2. ПОЛУЧЕНИЕ API КЛЮЧЕЙ:
   - Перейдите в https://supabase.com/dashboard/project/qosblydpgejtnyvzctpg/settings/api
   - Скопируйте "anon public" ключ
   - Скопируйте "service_role" ключ

3. ОБНОВЛЕНИЕ КОНФИГУРАЦИИ:
   - Отредактируйте файл remote-config.js
   - Вставьте реальные ключи в поля anonKey и serviceRoleKey

4. ПРИМЕНЕНИЕ МИГРАЦИЙ К УДАЛЕННОМУ ПРОЕКТУ:
   npx supabase link --project-ref qosblydpgejtnyvzctpg
   npm run migrate:remote

5. ГЕНЕРАЦИЯ TYPESCRIPT ТИПОВ:
   npm run generate:remote

6. ПРОВЕРКА ПОДКЛЮЧЕНИЯ:
   node client-example.js

=== ИНФОРМАЦИЯ О ПРОЕКТЕ ===
- Project URL: https://qosblydpgejtnyvzctpg.supabase.co
- Project ID: qosblydpgejtnyvzctpg
- Dashboard: https://supabase.com/dashboard/project/qosblydpgejtnyvzctpg
- API Docs: https://supabase.com/docs

=== ПОЛЕЗНЫЕ КОМАНДЫ ===
- Подключение к проекту: npm run link
- Применение миграций: npm run migrate:remote
- Генерация типов: npm run generate:remote
- Открыть Studio: npm run studio
`
};

function createSetupInstructions() {
  console.log(REMOTE_CONFIG.instructions);

  // Create .env.example if it doesn't exist
  const envExamplePath = path.join(__dirname, '.env.example');
  if (!fs.existsSync(envExamplePath)) {
    const envExample = `# Supabase Remote Project Configuration
# Скопируйте этот файл в .env и заполните реальные значения

# Project URL
SUPABASE_URL=https://qosblydpgejtnyvzctpg.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Database connection (если нужно прямое подключение)
DATABASE_URL=postgresql://postgres:[password]@db.qosblydpgejtnyvzctpg.supabase.co:5432/postgres

# Access token для CLI (получите через \`npx supabase login\`)
SUPABASE_ACCESS_TOKEN=your-access-token-here`;

    fs.writeFileSync(envExamplePath, envExample);
    console.log('✅ Создан файл .env.example');
  }
}

function updateRemoteConfig() {
  const configPath = path.join(__dirname, 'remote-config.js');
  let configContent = fs.readFileSync(configPath, 'utf8');

  // Update project details if needed
  configContent = configContent.replace(
    /projectId: '[^']*'/,
    `projectId: '${REMOTE_CONFIG.projectId}'`
  );

  configContent = configContent.replace(
    /projectUrl: '[^']*'/,
    `projectUrl: '${REMOTE_CONFIG.projectUrl}'`
  );

  fs.writeFileSync(configPath, configContent);
  console.log('✅ Обновлен файл remote-config.js');
}

function createTypesDirectory() {
  const typesDir = path.join(__dirname, 'types');
  if (!fs.existsSync(typesDir)) {
    fs.mkdirSync(typesDir);
    console.log('✅ Создана директория types/');
  }
}

// Main execution
console.log('🚀 Настройка подключения к удаленному Supabase проекту...\n');

try {
  createSetupInstructions();
  updateRemoteConfig();
  createTypesDirectory();

  console.log('\n✅ Настройка завершена!');
  console.log('\nСледующие шаги:');
  console.log('1. Выполните: npx supabase login');
  console.log('2. Получите API ключи из Dashboard');
  console.log('3. Обновите remote-config.js с реальными ключами');
  console.log('4. Выполните: npm run link');
  console.log('5. Примените миграции: npm run migrate:remote');

} catch (error) {
  console.error('❌ Ошибка при настройке:', error.message);
  process.exit(1);
}
