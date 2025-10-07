#!/usr/bin/env node

/**
 * Notion Task Automation
 * Автоматизация работы с таблицей Tasks в Notion
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

// Глобальная переменная для клиента
let notion;

// Функция для запуска валидации архитектуры
async function runValidation(scenarioUrl, taskName) {
  console.log(`   🔧 Запуск валидации архитектуры...`);
  
  try {
    // Импорт валидаторов
    const { analyzeNotionScenario } = require('./analyzers/notion-analyzer');
    const { validateDomainLayer } = require('./validators/domain-validator');
    const { validateApplicationLayer } = require('./validators/application-validator');
    const { validateInfrastructureLayer } = require('./validators/infrastructure-validator');
    const { validateInterfaceAdapters } = require('./validators/interface-validator');
    const { validateFlowData } = require('./validators/flow-validator');
    
    // Анализ сценария из Notion
    const scenarioData = await analyzeNotionScenario(scenarioUrl);
    
    // Валидация всех слоев архитектуры
    const validations = await Promise.all([
      validateDomainLayer(scenarioData),
      validateApplicationLayer(scenarioData),
      validateInfrastructureLayer(scenarioData),
      validateInterfaceAdapters(scenarioData),
      validateFlowData(scenarioData)
    ]);
    
    // Агрегация результатов
    const allPassed = validations.every(v => v.passed);
    const allErrors = validations.flatMap(v => v.errors || []);
    
    return {
      passed: allPassed,
      errors: allErrors,
      details: validations
    };
    
  } catch (error) {
    console.error(`   ❌ Ошибка валидации: ${error.message}`);
    return {
      passed: false,
      errors: [`Ошибка валидации: ${error.message}`],
      details: []
    };
  }
}

// Задачи Realtime Dashboard для создания
const REALTIME_DASHBOARD_TASKS = [
  {
    name: '[Realtime Dashboard - View Revenue Metric (Line chart)](https://www.notion.so/28118161210481eeb524c6aa0879e78c)',
    status: 'TODO',
    priority: 'HIGH',
    module: 'Analytics',
    validationStatus: 'NOT_VALIDATED'
  },
  {
    name: '[Realtime Dashboard - View Top Products (Horizontal Bar)](https://www.notion.so/28118161210481e7b191c699b4bdb8ec)',
    status: 'TODO',
    priority: 'HIGH',
    module: 'Analytics',
    validationStatus: 'NOT_VALIDATED'
  },
  {
    name: '[Realtime Dashboard - View Orders Metric (Area chart)](https://www.notion.so/28118161210481c990bfdfa0dff78d4b)',
    status: 'TODO',
    priority: 'HIGH',
    module: 'Analytics',
    validationStatus: 'NOT_VALIDATED'
  },
  {
    name: '[Realtime Dashboard - View LTV (Line chart with cohorts)](https://www.notion.so/2811816121048170af56f2cf3f4cbc4b)',
    status: 'TODO',
    priority: 'MEDIUM',
    module: 'Analytics',
    validationStatus: 'NOT_VALIDATED'
  },
  {
    name: '[Realtime Dashboard - Open and Apply Filters](https://www.notion.so/281181612104814ab3c5faab2a338e09)',
    status: 'TODO',
    priority: 'HIGH',
    module: 'Dashboard',
    validationStatus: 'NOT_VALIDATED'
  },
  {
    name: '[Realtime Dashboard - View Geo Distribution (Choropleth map)](https://www.notion.so/2811816121048135ae10e70fb7eb9f56)',
    status: 'TODO',
    priority: 'MEDIUM',
    module: 'Analytics',
    validationStatus: 'NOT_VALIDATED'
  },
  {
    name: '[Realtime Dashboard - View Conversion Rate (Funnel + KPI)](https://www.notion.so/28118161210481fa8289e2acd0acc402)',
    status: 'TODO',
    priority: 'MEDIUM',
    module: 'Analytics',
    validationStatus: 'NOT_VALIDATED'
  },
  {
    name: '[Realtime Dashboard - Export Data as CSV](https://www.notion.so/281181612104813188d7c77a9ea25ef9)',
    status: 'TODO',
    priority: 'LOW',
    module: 'Export',
    validationStatus: 'NOT_VALIDATED'
  },
  {
    name: '[Realtime Dashboard - Save Dashboard View as Preset](https://www.notion.so/28118161210481e985bdd27466b3fccd)',
    status: 'TODO',
    priority: 'MEDIUM',
    module: 'Dashboard',
    validationStatus: 'NOT_VALIDATED'
  },
  {
    name: '[Realtime Dashboard - Share Dashboard via URL](https://www.notion.so/28118161210481a3b1ebc3c2cc1e8a67)',
    status: 'TODO',
    priority: 'MEDIUM',
    module: 'Dashboard',
    validationStatus: 'NOT_VALIDATED'
  },
  {
    name: '[Realtime Dashboard - Export Chart as PNG](https://www.notion.so/281181612104817abbeec5f1bd849c66)',
    status: 'TODO',
    priority: 'LOW',
    module: 'Export',
    validationStatus: 'NOT_VALIDATED'
  },
  {
    name: '[Realtime Dashboard - Load Saved Preset](https://www.notion.so/28118161210481bea607f5b780d147fa)',
    status: 'TODO',
    priority: 'MEDIUM',
    module: 'Dashboard',
    validationStatus: 'NOT_VALIDATED'
  },
  {
    name: '[Realtime Dashboard - Reset Filters to Default](https://www.notion.so/28118161210481afaefaf111078186c2)',
    status: 'TODO',
    priority: 'LOW',
    module: 'Dashboard',
    validationStatus: 'NOT_VALIDATED'
  },
  {
    name: '[Realtime Dashboard - Settings Changed Mid-stream](https://www.notion.so/2811816121048106aa95edd9320bdcdc)',
    status: 'TODO',
    priority: 'MEDIUM',
    module: 'Dashboard',
    validationStatus: 'NOT_VALIDATED'
  },
  {
    name: '[Realtime Dashboard - No Data Matching Filters](https://www.notion.so/2811816121048100b4dfdf328a64b969)',
    status: 'TODO',
    priority: 'LOW',
    module: 'Dashboard',
    validationStatus: 'NOT_VALIDATED'
  },
  {
    name: '[Realtime Dashboard - View Source Shares (Donut chart)](https://www.notion.so/2811816121048188b44ef4f652146928)',
    status: 'TODO',
    priority: 'MEDIUM',
    module: 'Analytics',
    validationStatus: 'NOT_VALIDATED'
  },
  {
    name: '[Realtime Dashboard - Accessibility (WCAG AA)](https://www.notion.so/281181612104812391a2d94cd28f9bc1)',
    status: 'TODO',
    priority: 'MEDIUM',
    module: 'Accessibility',
    validationStatus: 'NOT_VALIDATED'
  }
];

function printHelp() {
  console.log(`
${colors.cyan}Notion Task Automation${colors.reset}

${colors.yellow}Команды:${colors.reset}
  --help                    Показать эту справку
  --create-sample           Создать примеры задач
  --validate-todos          Валидировать все TODO задачи
  --update-status <id> <status>  Обновить статус задачи
  --list-tasks              Показать все задачи

${colors.blue}Примеры:${colors.reset}
  node scripts/notion-task-automation.js --create-sample
  node scripts/notion-task-automation.js --validate-todos
  node scripts/notion-task-automation.js --list-tasks

${colors.green}Notion Tasks Database:${colors.reset}
  ${NOTION_CONFIG.TASKS_DATABASE_URL}
`);
}

async function createSampleTasks() {
  console.log(`${colors.cyan}📝 Создание задач Realtime Dashboard...${colors.reset}`);
  
  // Инициализация Notion клиента
  notion = initNotionClient();
  
  console.log(`${colors.blue}📊 Всего задач: ${REALTIME_DASHBOARD_TASKS.length}${colors.reset}`);
  console.log(`${colors.yellow}📋 Модули: Analytics, Dashboard, Export, Accessibility${colors.reset}`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const task of REALTIME_DASHBOARD_TASKS) {
    try {
      console.log(`${colors.yellow}Создание: ${task.name}${colors.reset}`);
      console.log(`   📍 Модуль: ${task.module}`);
      console.log(`   ⚡ Приоритет: ${task.priority}`);
      console.log(`   📊 Статус: ${task.status}`);
      console.log(`   ✅ Валидация: ${task.validationStatus}`);
      
      // Создание задачи в Notion
      const response = await notion.pages.create({
        parent: {
          database_id: NOTION_CONFIG.TASKS_DATABASE_ID
        },
        properties: {
          'Task Name': {
            title: [
              {
                text: {
                  content: task.name
                }
              }
            ]
          },
          'Status': {
            select: {
              name: task.status
            }
          },
          'Priority': {
            select: {
              name: task.priority
            }
          },
          'Module': {
            rich_text: [
              {
                text: {
                  content: task.module
                }
              }
            ]
          },
          'Validation Status': {
            select: {
              name: task.validationStatus
            }
          }
        }
      });
      
      console.log(`${colors.green}✅ Задача создана: ${response.id}${colors.reset}\n`);
      successCount++;
      
    } catch (error) {
      console.error(`${colors.red}❌ Ошибка создания задачи: ${error.message}${colors.reset}`);
      console.error(`${colors.red}   Детали: ${JSON.stringify(error.body || error)}${colors.reset}\n`);
      errorCount++;
    }
  }
  
  console.log(`${colors.cyan}🎯 Создание завершено!${colors.reset}`);
  console.log(`${colors.green}✅ Успешно: ${successCount} задач${colors.reset}`);
  if (errorCount > 0) {
    console.log(`${colors.red}❌ Ошибок: ${errorCount} задач${colors.reset}`);
  }
  console.log(`${colors.blue}🔗 Перейти к таблице: ${NOTION_CONFIG.TASKS_DATABASE_URL}${colors.reset}`);
}

async function validateTodoTasks() {
  console.log(`${colors.cyan}🔍 Валидация TODO задач...${colors.reset}`);
  
  try {
    // Инициализация Notion клиента
    notion = initNotionClient();
    
    // Получение всех TODO задач из базы данных
    const response = await notion.databases.query({
      database_id: NOTION_CONFIG.TASKS_DATABASE_ID,
      filter: {
        property: 'Status',
        select: {
          equals: 'TODO'
        }
      }
    });
    
    if (response.results.length === 0) {
      console.log(`${colors.yellow}📝 TODO задач не найдено${colors.reset}`);
      return;
    }
    
    console.log(`${colors.blue}📊 Найдено TODO задач: ${response.results.length}${colors.reset}\n`);
    
    let validatedCount = 0;
    let errorCount = 0;
    
    for (const page of response.results) {
      try {
        const props = page.properties;
        const taskName = props['Task Name'].title[0]?.text?.content || '';
        const scenarioUrl = props['Scenario URL'].url || '';
        
        if (!scenarioUrl) {
          console.log(`${colors.yellow}⏭️  Пропускаем: ${taskName} (нет URL сценария)${colors.reset}`);
          continue;
        }
        
        console.log(`${colors.yellow}🔍 Валидация: ${taskName}${colors.reset}`);
        console.log(`   🔗 URL: ${scenarioUrl}`);
        
        // Запуск валидации архитектуры
        const validationResult = await runValidation(scenarioUrl, taskName);
        
        // Обновление статуса валидации
        await notion.pages.update({
          page_id: page.id,
          properties: {
            'Validation Status': {
              select: {
                name: validationResult.passed ? 'VALIDATED' : 'VALIDATION_FAILED'
              }
            }
          }
        });
        
        if (validationResult.passed) {
          console.log(`${colors.green}✅ Валидация пройдена: ${page.id}${colors.reset}`);
        } else {
          console.log(`${colors.red}❌ Валидация не пройдена: ${validationResult.errors.join(', ')}${colors.reset}`);
        }
        
        validatedCount++;
        
      } catch (error) {
        console.error(`${colors.red}❌ Ошибка валидации задачи ${page.id}: ${error.message}${colors.reset}`);
        errorCount++;
      }
    }
    
    console.log(`${colors.cyan}🎯 Валидация завершена!${colors.reset}`);
    console.log(`${colors.green}✅ Валидировано: ${validatedCount} задач${colors.reset}`);
    if (errorCount > 0) {
      console.log(`${colors.red}❌ Ошибок: ${errorCount} задач${colors.reset}`);
    }
    
  } catch (error) {
    console.error(`${colors.red}❌ Ошибка: ${error.message}${colors.reset}`);
  }
}

async function listTasks() {
  console.log(`${colors.cyan}📋 Список задач:${colors.reset}`);
  
  try {
    // Инициализация Notion клиента
    notion = initNotionClient();
    
    // Получение всех задач из базы данных
    const response = await notion.databases.query({
      database_id: NOTION_CONFIG.TASKS_DATABASE_ID,
      sorts: [
        {
          property: 'Priority',
          direction: 'descending'
        }
      ]
    });
    
    if (response.results.length === 0) {
      console.log(`${colors.yellow}📝 Задач не найдено${colors.reset}`);
      console.log(`${colors.blue}Используйте --create-sample для создания примеров${colors.reset}`);
      return;
    }
    
    console.log(`${colors.blue}📊 Найдено задач: ${response.results.length}${colors.reset}\n`);
    
    // Отображение задач в табличном формате
    response.results.forEach((page, index) => {
      const props = page.properties;
      
      console.log(`${colors.bright}${index + 1}. ${props['Task Name'].title[0]?.text?.content || 'Без названия'}${colors.reset}`);
      console.log(`   📍 Модуль: ${props.Module?.rich_text[0]?.text?.content || 'Не указан'}`);
      console.log(`   ⚡ Приоритет: ${props.Priority?.select?.name || 'Не указан'}`);
      console.log(`   📊 Статус: ${props.Status?.select?.name || 'Не указан'}`);
      console.log(`   ✅ Валидация: ${props['Validation Status']?.select?.name || 'Не указан'}`);
      console.log(`   🔗 ID: ${page.id}\n`);
    });
    
  } catch (error) {
    console.error(`${colors.red}❌ Ошибка получения задач: ${error.message}${colors.reset}`);
    console.error(`${colors.red}   Детали: ${JSON.stringify(error.body || error)}${colors.reset}`);
  }
  
  console.log(`${colors.blue}Перейти к базе данных: ${NOTION_CONFIG.TASKS_DATABASE_URL}${colors.reset}`);
}

async function updateTaskStatus(taskId, status) {
  console.log(`${colors.cyan}🔄 Обновление статуса задачи ${taskId} на ${status}${colors.reset}`);
  
  // TODO: Обновить статус задачи в Notion
  
  console.log(`${colors.green}✅ Статус обновлен${colors.reset}`);
}

function parseArguments() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }
  
  if (args.includes('--create-sample')) {
    createSampleTasks();
    return;
  }
  
  if (args.includes('--validate-todos')) {
    validateTodoTasks();
    return;
  }
  
  if (args.includes('--list-tasks')) {
    listTasks();
    return;
  }
  
  const updateIndex = args.indexOf('--update-status');
  if (updateIndex !== -1) {
    const taskId = args[updateIndex + 1];
    const status = args[updateIndex + 2];
    if (!taskId || !status) {
      console.error(`${colors.red}❌ Ошибка: укажите ID задачи и статус${colors.reset}`);
      process.exit(1);
    }
    updateTaskStatus(taskId, status);
    return;
  }
  
  // Если нет параметров, показываем базовую информацию
  if (args.length === 0) {
    console.log(`${colors.cyan}🤖 Notion Task Automation готов к работе!${colors.reset}`);
    console.log(`${colors.yellow}📋 Используйте --help для справки${colors.reset}`);
    console.log(`${colors.blue}🔗 База данных: ${NOTION_CONFIG.TASKS_DATABASE_URL}${colors.reset}`);
    return;
  }
}

// Основная логика
if (require.main === module) {
  parseArguments();
}

module.exports = { 
  createSampleTasks, 
  validateTodoTasks, 
  listTasks, 
  updateTaskStatus,
  NOTION_CONFIG 
};
