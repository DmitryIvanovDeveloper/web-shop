// scripts/validators/flow-validator.js

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Валидация потока данных
async function validateFlowData(scenarioData) {
  console.log(`   🔄 Валидация потока данных для сценария: ${scenarioData.name}`);
  
  const checks = [];
  
  // 1. Проверка определения потока данных
  const hasFlowDefinition = scenarioData.flow && scenarioData.flow.length > 0;
  
  checks.push({
    name: "Поток данных определен",
    passed: hasFlowDefinition,
    message: hasFlowDefinition ? `Поток: ${scenarioData.flow}` : "Поток данных не определен"
  });
  
  // 2. Проверка соответствия потока Clean Architecture
  const isValidCleanArchFlow = scenarioData.flow && 
    scenarioData.flow.includes('→') && 
    (scenarioData.flow.includes('UseCase') || scenarioData.flow.includes('Presenter')) &&
    scenarioData.flow.includes('Infrastructure');
  
  checks.push({
    name: "Соответствие Clean Architecture",
    passed: isValidCleanArchFlow,
    message: isValidCleanArchFlow ? "Поток соответствует Clean Architecture" : "Поток не соответствует Clean Architecture"
  });
  
  // 3. Проверка направления зависимостей
  const hasCorrectDependencyDirection = scenarioData.flow && 
    scenarioData.flow.includes('←') && 
    scenarioData.flow.indexOf('Infrastructure') > scenarioData.flow.indexOf('UseCase');
  
  checks.push({
    name: "Направление зависимостей",
    passed: hasCorrectDependencyDirection,
    message: hasCorrectDependencyDirection ? "Зависимости направлены к центру" : "Неправильное направление зависимостей"
  });
  
  // 4. Проверка наличия всех слоев в потоке
  const hasAllLayers = scenarioData.flow && 
    scenarioData.flow.includes('View') &&
    scenarioData.flow.includes('Presenter') &&
    scenarioData.flow.includes('UseCase');
  
  checks.push({
    name: "Все слои представлены",
    passed: hasAllLayers,
    message: hasAllLayers ? "Все основные слои присутствуют в потоке" : "Не все слои представлены в потоке"
  });
  
  // 5. Проверка пользовательских историй
  if (scenarioData.userStories && scenarioData.userStories.length > 0) {
    checks.push({
      name: "Пользовательские истории",
      passed: true,
      message: `Найдено ${scenarioData.userStories.length} пользовательских историй`
    });
  } else {
    checks.push({
      name: "Пользовательские истории",
      passed: false,
      message: "Пользовательские истории не найдены"
    });
  }
  
  // 6. Проверка критериев приемки
  if (scenarioData.acceptanceCriteria && scenarioData.acceptanceCriteria.length > 0) {
    checks.push({
      name: "Критерии приемки",
      passed: true,
      message: `Найдено ${scenarioData.acceptanceCriteria.length} критериев приемки`
    });
  } else {
    checks.push({
      name: "Критерии приемки",
      passed: false,
      message: "Критерии приемки не найдены"
    });
  }
  
  // 7. Проверка последовательности шагов
  const hasStepSequence = scenarioData.description && 
    (scenarioData.description.includes('1.') || 
     scenarioData.description.includes('2.') ||
     scenarioData.description.includes('шаг') ||
     scenarioData.description.includes('этап'));
  
  checks.push({
    name: "Последовательность шагов",
    passed: hasStepSequence,
    message: hasStepSequence ? "Обнаружена последовательность шагов" : "Последовательность шагов не обнаружена"
  });
  
  // Агрегация результатов
  const errors = checks.filter(c => !c.passed);
  const warnings = checks.filter(c => c.passed && c.message.includes('не обнаружен'));
  
  console.log(`   ✅ Проверок пройдено: ${checks.filter(c => c.passed).length}/${checks.length}`);
  
  return {
    layer: 'Flow Data',
    passed: errors.length === 0,
    errors: errors,
    warnings: warnings,
    details: checks
  };
}

module.exports = { validateFlowData };
