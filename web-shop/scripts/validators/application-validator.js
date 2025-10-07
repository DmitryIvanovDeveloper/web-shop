// scripts/validators/application-validator.js

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Валидация Application Layer
async function validateApplicationLayer(scenarioData) {
  console.log(`   🔧 Валидация Application Layer для сценария: ${scenarioData.name}`);
  
  const checks = [];
  
  // 1. Проверка наличия Use Cases
  if (scenarioData.useCases && scenarioData.useCases.length > 0) {
    checks.push({
      name: "Use Cases определены",
      passed: true,
      message: `Найдено ${scenarioData.useCases.length} Use Cases`
    });
  } else {
    checks.push({
      name: "Use Cases определены",
      passed: false,
      message: "Не найдено Use Cases"
    });
  }
  
  // 2. Проверка портов
  if (scenarioData.ports && scenarioData.ports.length > 0) {
    checks.push({
      name: "Порты определены",
      passed: true,
      message: `Найдено ${scenarioData.ports.length} портов: ${scenarioData.ports.join(', ')}`
    });
  } else {
    checks.push({
      name: "Порты определены",
      passed: false,
      message: "Не найдено портов"
    });
  }
  
  // 3. Проверка соответствия портов сущностям
  const validPorts = scenarioData.ports?.filter(port => {
    const entity = port.replace(/Repository$/, '');
    return scenarioData.domainEntities?.includes(entity);
  }) || [];
  
  if (validPorts.length > 0) {
    checks.push({
      name: "Соответствие портов сущностям",
      passed: true,
      message: `Валидные порты: ${validPorts.join(', ')}`
    });
  } else {
    checks.push({
      name: "Соответствие портов сущностям",
      passed: false,
      message: "Порты не соответствуют доменным сущностям"
    });
  }
  
  // 4. Проверка оркестрации
  const hasOrchestration = scenarioData.description && 
    (scenarioData.description.includes('координация') || 
     scenarioData.description.includes('оркестрация') ||
     scenarioData.description.includes('управление') ||
     scenarioData.useCases && scenarioData.useCases.length > 1);
  
  checks.push({
    name: "Оркестрация Use Cases",
    passed: hasOrchestration,
    message: hasOrchestration ? "Обнаружена оркестрация" : "Оркестрация не обнаружена"
  });
  
  // 5. Проверка транзакционности
  const hasTransactions = scenarioData.description && 
    (scenarioData.description.includes('транзакция') || 
     scenarioData.description.includes('атомарность') ||
     scenarioData.description.includes('консистентность'));
  
  checks.push({
    name: "Транзакционность",
    passed: hasTransactions,
    message: hasTransactions ? "Обнаружены транзакции" : "Транзакционность не обнаружена"
  });
  
  // 6. Проверка обработки ошибок
  const hasErrorHandling = scenarioData.description && 
    (scenarioData.description.includes('ошибка') || 
     scenarioData.description.includes('исключение') ||
     scenarioData.description.includes('валидация'));
  
  checks.push({
    name: "Обработка ошибок",
    passed: hasErrorHandling,
    message: hasErrorHandling ? "Обнаружена обработка ошибок" : "Обработка ошибок не обнаружена"
  });
  
  // Агрегация результатов
  const errors = checks.filter(c => !c.passed);
  const warnings = checks.filter(c => c.passed && c.message.includes('не обнаружен'));
  
  console.log(`   ✅ Проверок пройдено: ${checks.filter(c => c.passed).length}/${checks.length}`);
  
  return {
    layer: 'Application',
    passed: errors.length === 0,
    errors: errors,
    warnings: warnings,
    details: checks
  };
}

module.exports = { validateApplicationLayer };
