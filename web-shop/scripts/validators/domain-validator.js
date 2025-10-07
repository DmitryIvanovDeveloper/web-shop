// scripts/validators/domain-validator.js

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Валидация Domain Layer
async function validateDomainLayer(scenarioData) {
  console.log(`   🏗️  Валидация Domain Layer для сценария: ${scenarioData.name}`);
  
  const checks = [];
  
  // 1. Проверка наличия доменных сущностей
  if (scenarioData.domainEntities && scenarioData.domainEntities.length > 0) {
    checks.push({
      name: "Доменные сущности определены",
      passed: true,
      message: `Найдено ${scenarioData.domainEntities.length} сущностей: ${scenarioData.domainEntities.join(', ')}`
    });
  } else {
    checks.push({
      name: "Доменные сущности определены",
      passed: false,
      message: "Не найдено доменных сущностей"
    });
  }
  
  // 2. Проверка качества сущностей
  const qualityEntities = scenarioData.domainEntities?.filter(entity => 
    entity.length > 2 && 
    !['The', 'System', 'User', 'Admin', 'Manager', 'API', 'URL', 'ID'].includes(entity)
  ) || [];
  
  if (qualityEntities.length > 0) {
    checks.push({
      name: "Качество доменных сущностей",
      passed: true,
      message: `Качественные сущности: ${qualityEntities.join(', ')}`
    });
  } else {
    checks.push({
      name: "Качество доменных сущностей",
      passed: false,
      message: "Не найдено качественных доменных сущностей"
    });
  }
  
  // 3. Проверка Use Cases
  if (scenarioData.useCases && scenarioData.useCases.length > 0) {
    checks.push({
      name: "Use Cases определены",
      passed: true,
      message: `Найдено ${scenarioData.useCases.length} Use Cases: ${scenarioData.useCases.join(', ')}`
    });
  } else {
    checks.push({
      name: "Use Cases определены",
      passed: false,
      message: "Не найдено Use Cases"
    });
  }
  
  // 4. Проверка соответствия Use Cases сущностям
  const validUseCases = scenarioData.useCases?.filter(useCase => {
    const entity = useCase.replace(/^(Create|Update|Delete|Manage|Get|Find)/, '');
    return scenarioData.domainEntities?.includes(entity);
  }) || [];
  
  if (validUseCases.length > 0) {
    checks.push({
      name: "Соответствие Use Cases сущностям",
      passed: true,
      message: `Валидные Use Cases: ${validUseCases.join(', ')}`
    });
  } else {
    checks.push({
      name: "Соответствие Use Cases сущностям",
      passed: false,
      message: "Use Cases не соответствуют доменным сущностям"
    });
  }
  
  // 5. Проверка бизнес-правил
  const hasBusinessRules = scenarioData.description && 
    (scenarioData.description.includes('правило') || 
     scenarioData.description.includes('условие') ||
     scenarioData.description.includes('валидация') ||
     scenarioData.description.includes('ограничение'));
  
  checks.push({
    name: "Бизнес-правила определены",
    passed: hasBusinessRules,
    message: hasBusinessRules ? "Найдены упоминания бизнес-правил" : "Бизнес-правила не обнаружены"
  });
  
  // 6. Проверка Result Pattern (по описанию)
  const hasResultPattern = scenarioData.description && 
    (scenarioData.description.includes('результат') || 
     scenarioData.description.includes('ошибка') ||
     scenarioData.description.includes('успех') ||
     scenarioData.description.includes('неудача'));
  
  checks.push({
    name: "Result Pattern используется",
    passed: hasResultPattern,
    message: hasResultPattern ? "Обнаружены признаки Result Pattern" : "Result Pattern не обнаружен"
  });
  
  // 7. Проверка инкапсуляции
  const hasEncapsulation = scenarioData.domainEntities && 
    scenarioData.domainEntities.length > 0 && 
    scenarioData.useCases && 
    scenarioData.useCases.length > 0;
  
  checks.push({
    name: "Инкапсуляция бизнес-логики",
    passed: hasEncapsulation,
    message: hasEncapsulation ? "Бизнес-логика инкапсулирована в сущностях и Use Cases" : "Недостаточная инкапсуляция"
  });
  
  // Агрегация результатов
  const errors = checks.filter(c => !c.passed);
  const warnings = checks.filter(c => c.passed && c.message.includes('не обнаружен'));
  
  console.log(`   ✅ Проверок пройдено: ${checks.filter(c => c.passed).length}/${checks.length}`);
  
  return {
    layer: 'Domain',
    passed: errors.length === 0,
    errors: errors,
    warnings: warnings,
    details: checks
  };
}

module.exports = { validateDomainLayer };
