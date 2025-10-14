// scripts/analyzers/notion-analyzer.js
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

// Загрузка конфигурации из .env файла
function loadConfig() {
  const envPath = path.join(__dirname, '..', '..', '.env');
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
    throw new Error('NOTION_ACCESS_TOKEN не найден в .env файле');
  }
  
  return new Client({
    auth: notionToken,
  });
}

// Извлечение ID страницы из URL Notion
function extractPageIdFromUrl(url) {
  const match = url.match(/https:\/\/www\.notion\.so\/([a-f0-9]+)/);
  if (match) {
    let pageId = match[1];
    // Добавляем дефисы в UUID формат
    if (pageId.length === 32) {
      pageId = pageId.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
    }
    return pageId;
  }
  return null;
}

// Анализ текста сценария
function analyzeScenarioText(content) {
  const scenarioData = {
    name: '',
    description: '',
    domainEntities: [],
    useCases: [],
    ports: [],
    flow: '',
    userStories: [],
    acceptanceCriteria: []
  };

  // Поиск названия сценария
  const titleMatch = content.match(/^#+\s*(.+)$/m);
  if (titleMatch) {
    scenarioData.name = titleMatch[1].trim();
  }

  // Поиск описания
  const descriptionMatch = content.match(/##\s*Description\s*\n(.+?)(?=##|\n##|$)/s);
  if (descriptionMatch) {
    scenarioData.description = descriptionMatch[1].trim();
  }

  // Поиск пользовательских историй
  const userStoryMatches = content.match(/###\s*User Story\s*\n(.+?)(?=###|\n###|$)/gs);
  if (userStoryMatches) {
    userStoryMatches.forEach(story => {
      const storyText = story.replace(/###\s*User Story\s*\n/, '').trim();
      if (storyText) {
        scenarioData.userStories.push(storyText);
      }
    });
  }

  // Поиск критериев приемки
  const criteriaMatches = content.match(/###\s*Acceptance Criteria\s*\n(.+?)(?=###|\n###|$)/s);
  if (criteriaMatches) {
    const criteriaText = criteriaMatches[1].trim();
    const criteriaList = criteriaText.split('\n').filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'));
    scenarioData.acceptanceCriteria = criteriaList.map(criteria => criteria.replace(/^[-*]\s*/, '').trim());
  }

  // Анализ основных шагов сценария
  const stepsMatch = content.match(/###\s*Main Scenario\s*\n(.+?)(?=###|\n###|$)/s);
  if (stepsMatch) {
    const stepsText = stepsMatch[1].trim();
    const steps = stepsText.split('\n').filter(line => line.trim().match(/^\d+\./));
    
    // Извлечение сущностей из шагов
    steps.forEach(step => {
      // Поиск упоминаний сущностей (заглавные буквы)
      const entityMatches = step.match(/\b[A-Z][a-zA-Z]+\b/g);
      if (entityMatches) {
        entityMatches.forEach(entity => {
          if (!scenarioData.domainEntities.includes(entity) && 
              !['The', 'System', 'User', 'Admin', 'Manager'].includes(entity)) {
            scenarioData.domainEntities.push(entity);
          }
        });
      }
    });
  }

  // Анализ альтернативных сценариев
  const altScenariosMatch = content.match(/###\s*Alternative Scenarios\s*\n(.+?)(?=###|\n###|$)/s);
  if (altScenariosMatch) {
    const altText = altScenariosMatch[1].trim();
    const altSteps = altText.split('\n').filter(line => line.trim().match(/^\d+\./));
    
    altSteps.forEach(step => {
      const entityMatches = step.match(/\b[A-Z][a-zA-Z]+\b/g);
      if (entityMatches) {
        entityMatches.forEach(entity => {
          if (!scenarioData.domainEntities.includes(entity) && 
              !['The', 'System', 'User', 'Admin', 'Manager'].includes(entity)) {
            scenarioData.domainEntities.push(entity);
          }
        });
      }
    });
  }

  // Генерация Use Cases на основе сущностей
  scenarioData.domainEntities.forEach(entity => {
    const useCaseName = `Manage${entity}`;
    if (!scenarioData.useCases.includes(useCaseName)) {
      scenarioData.useCases.push(useCaseName);
    }
  });

  // Генерация Ports на основе сущностей
  scenarioData.domainEntities.forEach(entity => {
    const portName = `${entity}Repository`;
    if (!scenarioData.ports.includes(portName)) {
      scenarioData.ports.push(portName);
    }
  });

  // Определение потока данных
  scenarioData.flow = "View → Presenter → UseCase → Ports ← Infrastructure";

  return scenarioData;
}

// Основная функция анализа сценария из Notion
async function analyzeNotionScenario(notionUrl) {
  console.log(`   📋 Анализ сценария из Notion: ${notionUrl}`);
  
  try {
    const notion = initNotionClient();
    const pageId = extractPageIdFromUrl(notionUrl);
    
    if (!pageId) {
      throw new Error('Не удалось извлечь ID страницы из URL');
    }

    // Получение содержимого страницы
    const page = await notion.pages.retrieve({ page_id: pageId });
    
    // Получение блоков страницы
    const blocks = await notion.blocks.children.list({
      block_id: pageId
    });

    // Сборка текстового содержимого
    let content = '';
    if (page.properties.title?.title?.[0]?.text?.content) {
      content += `# ${page.properties.title.title[0].text.content}\n\n`;
    }

    // Обработка блоков
    for (const block of blocks.results) {
      if (block.type === 'paragraph' && block.paragraph?.rich_text) {
        const text = block.paragraph.rich_text.map(rt => rt.text.content).join('');
        if (text.trim()) {
          content += text + '\n\n';
        }
      } else if (block.type === 'heading_1' && block.heading_1?.rich_text) {
        const text = block.heading_1.rich_text.map(rt => rt.text.content).join('');
        content += `# ${text}\n\n`;
      } else if (block.type === 'heading_2' && block.heading_2?.rich_text) {
        const text = block.heading_2.rich_text.map(rt => rt.text.content).join('');
        content += `## ${text}\n\n`;
      } else if (block.type === 'heading_3' && block.heading_3?.rich_text) {
        const text = block.heading_3.rich_text.map(rt => rt.text.content).join('');
        content += `### ${text}\n\n`;
      } else if (block.type === 'bulleted_list_item' && block.bulleted_list_item?.rich_text) {
        const text = block.bulleted_list_item.rich_text.map(rt => rt.text.content).join('');
        content += `- ${text}\n`;
      } else if (block.type === 'numbered_list_item' && block.numbered_list_item?.rich_text) {
        const text = block.numbered_list_item.rich_text.map(rt => rt.text.content).join('');
        content += `1. ${text}\n`;
      }
    }

    console.log(`   📄 Извлечено ${content.length} символов содержимого`);
    
    // Анализ содержимого
    const scenarioData = analyzeScenarioText(content);
    
    console.log(`   🎯 Найдено сущностей: ${scenarioData.domainEntities.length}`);
    console.log(`   🔧 Найдено Use Cases: ${scenarioData.useCases.length}`);
    console.log(`   🔌 Найдено Ports: ${scenarioData.ports.length}`);
    
    return {
      ...scenarioData,
      url: notionUrl,
      content: content
    };

  } catch (error) {
    console.error(`   ❌ Ошибка анализа Notion сценария: ${error.message}`);
    
    // Возвращаем базовую структуру в случае ошибки
    return {
      name: "Unknown Scenario",
      description: `Error analyzing Notion URL: ${notionUrl}`,
      domainEntities: ["User", "System"],
      useCases: ["ManageUser", "ManageSystem"],
      ports: ["UserRepository", "SystemRepository"],
      flow: "View → Presenter → UseCase → Ports ← Infrastructure",
      userStories: [],
      acceptanceCriteria: [],
      url: notionUrl,
      content: "",
      error: error.message
    };
  }
}

module.exports = { 
  analyzeNotionScenario,
  extractPageIdFromUrl,
  analyzeScenarioText
};
