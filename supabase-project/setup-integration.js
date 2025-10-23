#!/usr/bin/env node

// Integration setup script for existing projects
// Run: node setup-integration.js

const fs = require('fs');
const path = require('path');

const PROJECTS = [
  '../web-shop',
  '../web-shop-client',
  '../webshops-demo'
];

function copyConfigToProject(projectPath) {
  const sourcePath = path.join(__dirname, 'remote-config.js');
  const targetPath = path.join(projectPath, 'src/lib/supabase-config.js');

  // Create directories if they don't exist
  const targetDir = path.dirname(targetPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Copy configuration file
  fs.copyFileSync(sourcePath, targetPath);
  console.log(`✅ Скопирован remote-config.js в ${targetPath}`);
}

function createSupabaseClient(projectPath) {
  const clientPath = path.join(projectPath, 'src/lib/supabase.ts');
  const clientDir = path.dirname(clientPath);

  if (!fs.existsSync(clientDir)) {
    fs.mkdirSync(clientDir, { recursive: true });
  }

  const clientContent = `// Supabase client configuration
import { createClient } from '@supabase/supabase-js'
import config from './supabase-config.js'

export const supabase = createClient(config.projectUrl, config.anonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types (generated from Supabase)
export type Database = {
  // Types will be generated with: npm run generate:remote
}

export default supabase
`;

  fs.writeFileSync(clientPath, clientContent);
  console.log(`✅ Создан Supabase клиент в ${clientPath}`);
}

function updatePackageJson(projectPath) {
  const packagePath = path.join(projectPath, 'package.json');

  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

    // Add Supabase dependency if not exists
    if (!packageJson.dependencies) {
      packageJson.dependencies = {};
    }

    if (!packageJson.dependencies['@supabase/supabase-js']) {
      packageJson.dependencies['@supabase/supabase-js'] = '^2.53.6';
      fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
      console.log(`✅ Добавлена зависимость @supabase/supabase-js в ${packagePath}`);
    }

    // Add scripts if not exists
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }

    if (!packageJson.scripts['supabase:types']) {
      packageJson.scripts['supabase:types'] = 'npx supabase gen types typescript --project-id qosblydpgejtnyvzctpg > src/types/supabase.ts';
      fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
      console.log(`✅ Добавлен скрипт supabase:types`);
    }
  }
}

function main() {
  console.log('🔗 Настройка интеграции с существующими проектами...\n');

  PROJECTS.forEach(projectPath => {
    const fullPath = path.resolve(__dirname, projectPath);

    if (fs.existsSync(fullPath)) {
      console.log(`📁 Настройка проекта: ${path.basename(fullPath)}`);

      try {
        copyConfigToProject(fullPath);
        createSupabaseClient(fullPath);
        updatePackageJson(fullPath);
        console.log(`✅ Проект ${path.basename(fullPath)} настроен\n`);
      } catch (error) {
        console.log(`❌ Ошибка настройки проекта ${path.basename(fullPath)}: ${error.message}\n`);
      }
    } else {
      console.log(`⚠️  Проект не найден: ${fullPath}\n`);
    }
  });

  console.log('🎉 Интеграция завершена!');
  console.log('\nСледующие шаги:');
  console.log('1. Обновите API ключи в remote-config.js');
  console.log('2. Выполните: npx supabase login');
  console.log('3. Выполните: npm run link');
  console.log('4. Примените миграции: npm run migrate:remote');
  console.log('5. В каждом проекте выполните: npm install');
  console.log('6. Сгенерируйте типы: npm run supabase:types');
}

if (require.main === module) {
  main();
}
