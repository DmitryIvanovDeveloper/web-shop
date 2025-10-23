#!/usr/bin/env node

/**
 * Update Task URLs
 * Обновление задач - перемещение ссылок из Task Name в Scenario URL
 */

const { Client } = require('@notionhq/client');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Конфигурация
const NOTION_CONFIG = {
  TASKS_DATABASE_ID: '6e7c708e-4f11-44a1-9887-37995fda77f9',
  TASKS_DATABASE_URL: 'https://www.notion.so/51269e7e5fb64206b525213f65fd8ba8'
};

// Загрузка конфигурации из .env файла
function loadConfig() {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        envVars[key.trim()] = value.trim();
      }
    });
    
    return envVars;
  }
  return {};
}

// Инициализация Notion клиента
function initNotionClient() {
  const config = loadConfig();
  const notionToken = config.NOTION_ACCESS_TOKEN;
  
  if (!notionToken) {
    console.error(`${colors.red}❌ Ошибка: NOTION_ACCESS_TOKEN не найден в .env файле${colors.reset}`);
    console.log(`${colors.yellow}Добавьте в .env файл: NOTION_ACCESS_TOKEN=your_token_here${colors.reset}`);
    process.exit(1);
  }
  
  return new Client({
    auth: notionToken,
  });
}

// Извлечение URL из Task Name
function extractUrlFromTaskName(taskName) {
  const urlMatch = taskName.match(/https:\/\/www\.notion\.so\/[a-f0-9]+/);
  return urlMatch ? urlMatch[0] : null;
}

// Извлечение чистого названия задачи
function extractCleanTaskName(taskName) {
  // Убираем ссылку и скобки
  return taskName.replace(/\[([^\]]+)\]\(https:\/\/www\.notion\.so\/[a-f0-9]+\)/g, '$1').trim();
}

async function updateTaskUrls() {
  console.log(`${colors.cyan}🔄 Обновление URL задач...${colors.reset}`);
  
  try {
    // Инициализация Notion клиента
    const notion = initNotionClient();
    
    // Получение всех задач из базы данных
    const response = await notion.databases.query({
      database_id: NOTION_CONFIG.TASKS_DATABASE_ID
    });
    
    if (response.results.length === 0) {
      console.log(`${colors.yellow}📝 Задач не найдено${colors.reset}`);
      return;
    }
    
    console.log(`${colors.blue}📊 Найдено задач: ${response.results.length}${colors.reset}\n`);
    
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const page of response.results) {
      try {
        const props = page.properties;
        const currentTaskName = props['Task Name'].title[0]?.text?.content || '';
        
        // Проверяем, есть ли ссылка в Task Name
        const url = extractUrlFromTaskName(currentTaskName);
        if (!url) {
          console.log(`${colors.yellow}⏭️  Пропускаем: ${currentTaskName} (нет ссылки)${colors.reset}`);
          continue;
        }
        
        // Извлекаем чистое название
        const cleanTaskName = extractCleanTaskName(currentTaskName);
        
        console.log(`${colors.yellow}🔄 Обновление: ${cleanTaskName}${colors.reset}`);
        console.log(`   📍 URL: ${url}`);
        
        // Обновляем задачу
        await notion.pages.update({
          page_id: page.id,
          properties: {
            'Task Name': {
              title: [
                {
                  text: {
                    content: cleanTaskName
                  }
                }
              ]
            },
            'Scenario URL': {
              url: url
            }
          }
        });
        
        console.log(`${colors.green}✅ Обновлено: ${page.id}${colors.reset}\n`);
        updatedCount++;
        
      } catch (error) {
        console.error(`${colors.red}❌ Ошибка обновления задачи ${page.id}: ${error.message}${colors.reset}`);
        errorCount++;
      }
    }
    
    console.log(`${colors.cyan}🎯 Обновление завершено!${colors.reset}`);
    console.log(`${colors.green}✅ Обновлено: ${updatedCount} задач${colors.reset}`);
    if (errorCount > 0) {
      console.log(`${colors.red}❌ Ошибок: ${errorCount} задач${colors.reset}`);
    }
    console.log(`${colors.blue}🔗 Перейти к таблице: ${NOTION_CONFIG.TASKS_DATABASE_URL}${colors.reset}`);
    
  } catch (error) {
    console.error(`${colors.red}❌ Ошибка: ${error.message}${colors.reset}`);
  }
}

// Основная логика
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
${colors.cyan}Update Task URLs${colors.reset}

Команды:
  --help, -h          Показать эту справку
  --update            Обновить все задачи (переместить ссылки в Scenario URL)

Примеры:
  node scripts/update-task-urls.js --update
  npm run update-urls

Notion Tasks Database:
  ${NOTION_CONFIG.TASKS_DATABASE_URL}
`);
  } else if (args.includes('--update')) {
    await updateTaskUrls();
  } else {
    console.log(`${colors.cyan}🔄 Update Task URLs готов к работе!${colors.reset}`);
    console.log(`${colors.yellow}📋 Используйте --help для справки${colors.reset}`);
    console.log(`${colors.blue}🔗 База данных: ${NOTION_CONFIG.TASKS_DATABASE_URL}${colors.reset}`);
  }
}

if (require.main === module) {
  main();
}
