// scripts/validators/interface-validator.js

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Валидация Interface Adapters Layer
async function validateInterfaceAdapters(scenarioData) {
  console.log(`   🎨 Валидация Interface Adapters для сценария: ${scenarioData.name}`);
  
  const checks = [];
  
  // 1. Проверка пользовательского интерфейса
  const hasUI = scenarioData.description && 
    (scenarioData.description.includes('интерфейс') || 
     scenarioData.description.includes('UI') ||
     scenarioData.description.includes('форма') ||
     scenarioData.description.includes('кнопка') ||
     scenarioData.description.includes('поле') ||
     scenarioData.description.includes('страница'));
  
  checks.push({
    name: "Пользовательский интерфейс",
    passed: hasUI,
    message: hasUI ? "Обнаружен пользовательский интерфейс" : "Пользовательский интерфейс не обнаружен"
  });
  
  // 2. Проверка API интерфейса
  const hasAPI = scenarioData.description && 
    (scenarioData.description.includes('API') || 
     scenarioData.description.includes('endpoint') ||
     scenarioData.description.includes('запрос') ||
     scenarioData.description.includes('ответ') ||
     scenarioData.description.includes('REST') ||
     scenarioData.description.includes('GraphQL'));
  
  checks.push({
    name: "API интерфейс",
    passed: hasAPI,
    message: hasAPI ? "Обнаружен API интерфейс" : "API интерфейс не обнаружен"
  });
  
  // 3. Проверка валидации входных данных
  const hasInputValidation = scenarioData.description && 
    (scenarioData.description.includes('валидация') || 
     scenarioData.description.includes('проверка') ||
     scenarioData.description.includes('формат') ||
     scenarioData.description.includes('корректность'));
  
  checks.push({
    name: "Валидация входных данных",
    passed: hasInputValidation,
    message: hasInputValidation ? "Обнаружена валидация входных данных" : "Валидация входных данных не обнаружена"
  });
  
  // 4. Проверка преобразования данных
  const hasDataTransformation = scenarioData.description && 
    (scenarioData.description.includes('преобразование') || 
     scenarioData.description.includes('маппинг') ||
     scenarioData.description.includes('конвертация') ||
     scenarioData.description.includes('адаптация'));
  
  checks.push({
    name: "Преобразование данных",
    passed: hasDataTransformation,
    message: hasDataTransformation ? "Обнаружено преобразование данных" : "Преобразование данных не обнаружено"
  });
  
  // 5. Проверка обработки ошибок UI
  const hasUIErrorHandling = scenarioData.description && 
    (scenarioData.description.includes('ошибка') || 
     scenarioData.description.includes('сообщение') ||
     scenarioData.description.includes('уведомление') ||
     scenarioData.description.includes('alert'));
  
  checks.push({
    name: "Обработка ошибок UI",
    passed: hasUIErrorHandling,
    message: hasUIErrorHandling ? "Обнаружена обработка ошибок UI" : "Обработка ошибок UI не обнаружена"
  });
  
  // 6. Проверка навигации
  const hasNavigation = scenarioData.description && 
    (scenarioData.description.includes('навигация') || 
     scenarioData.description.includes('переход') ||
     scenarioData.description.includes('маршрут') ||
     scenarioData.description.includes('страница'));
  
  checks.push({
    name: "Навигация и маршрутизация",
    passed: hasNavigation,
    message: hasNavigation ? "Обнаружена навигация" : "Навигация не обнаружена"
  });
  
  // Агрегация результатов
  const errors = checks.filter(c => !c.passed);
  const warnings = checks.filter(c => c.passed && c.message.includes('не обнаружен'));
  
  console.log(`   ✅ Проверок пройдено: ${checks.filter(c => c.passed).length}/${checks.length}`);
  
  return {
    layer: 'Interface Adapters',
    passed: errors.length === 0,
    errors: errors,
    warnings: warnings,
    details: checks
  };
}

module.exports = { validateInterfaceAdapters };
