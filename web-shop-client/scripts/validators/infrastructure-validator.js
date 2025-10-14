// scripts/validators/infrastructure-validator.js

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Валидация Infrastructure Layer
async function validateInfrastructureLayer(scenarioData) {
  console.log(`   🏗️  Валидация Infrastructure Layer для сценария: ${scenarioData.name}`);
  
  const checks = [];
  
  // 1. Проверка внешних зависимостей
  const hasExternalDeps = scenarioData.description && 
    (scenarioData.description.includes('API') || 
     scenarioData.description.includes('база данных') ||
     scenarioData.description.includes('файл') ||
     scenarioData.description.includes('сеть') ||
     scenarioData.description.includes('внешний'));
  
  checks.push({
    name: "Внешние зависимости определены",
    passed: hasExternalDeps,
    message: hasExternalDeps ? "Обнаружены внешние зависимости" : "Внешние зависимости не обнаружены"
  });
  
  // 2. Проверка портов для инфраструктуры
  if (scenarioData.ports && scenarioData.ports.length > 0) {
    const infrastructurePorts = scenarioData.ports.filter(port => 
      port.includes('Repository') || 
      port.includes('Service') || 
      port.includes('Gateway')
    );
    
    checks.push({
      name: "Инфраструктурные порты",
      passed: infrastructurePorts.length > 0,
      message: `Найдено ${infrastructurePorts.length} инфраструктурных портов: ${infrastructurePorts.join(', ')}`
    });
  } else {
    checks.push({
      name: "Инфраструктурные порты",
      passed: false,
      message: "Не найдено инфраструктурных портов"
    });
  }
  
  // 3. Проверка персистентности
  const hasPersistence = scenarioData.description && 
    (scenarioData.description.includes('сохранение') || 
     scenarioData.description.includes('загрузка') ||
     scenarioData.description.includes('обновление') ||
     scenarioData.description.includes('удаление') ||
     scenarioData.ports?.some(port => port.includes('Repository')));
  
  checks.push({
    name: "Персистентность данных",
    passed: hasPersistence,
    message: hasPersistence ? "Обнаружена персистентность данных" : "Персистентность не обнаружена"
  });
  
  // 4. Проверка интеграций
  const hasIntegrations = scenarioData.description && 
    (scenarioData.description.includes('интеграция') || 
     scenarioData.description.includes('внешний сервис') ||
     scenarioData.description.includes('третий') ||
     scenarioData.description.includes('плагин'));
  
  checks.push({
    name: "Внешние интеграции",
    passed: hasIntegrations,
    message: hasIntegrations ? "Обнаружены внешние интеграции" : "Внешние интеграции не обнаружены"
  });
  
  // 5. Проверка конфигурации
  const hasConfiguration = scenarioData.description && 
    (scenarioData.description.includes('конфигурация') || 
     scenarioData.description.includes('настройка') ||
     scenarioData.description.includes('параметр') ||
     scenarioData.description.includes('переменная'));
  
  checks.push({
    name: "Конфигурация системы",
    passed: hasConfiguration,
    message: hasConfiguration ? "Обнаружена конфигурация" : "Конфигурация не обнаружена"
  });
  
  // 6. Проверка логирования
  const hasLogging = scenarioData.description && 
    (scenarioData.description.includes('логирование') || 
     scenarioData.description.includes('логи') ||
     scenarioData.description.includes('мониторинг') ||
     scenarioData.description.includes('отладка'));
  
  checks.push({
    name: "Логирование и мониторинг",
    passed: hasLogging,
    message: hasLogging ? "Обнаружено логирование" : "Логирование не обнаружено"
  });
  
  // Агрегация результатов
  const errors = checks.filter(c => !c.passed);
  const warnings = checks.filter(c => c.passed && c.message.includes('не обнаружен'));
  
  console.log(`   ✅ Проверок пройдено: ${checks.filter(c => c.passed).length}/${checks.length}`);
  
  return {
    layer: 'Infrastructure',
    passed: errors.length === 0,
    errors: errors,
    warnings: warnings,
    details: checks
  };
}

module.exports = { validateInfrastructureLayer };
