import { LLMProvider } from './types';

export const AI_CONFIG = {
  // Поддерживаемые провайдеры
  PROVIDERS: {
    OPENAI: {
      name: 'OpenAI',
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-4',
      apiKey: process.env.OPENAI_API_KEY || ''
    } as LLMProvider,
    
    CLAUDE: {
      name: 'Claude',
      baseUrl: 'https://api.anthropic.com/v1',
      model: 'claude-3-sonnet-20240229',
      apiKey: process.env.CLAUDE_API_KEY || ''
    } as LLMProvider
  },

  // Настройки по умолчанию
  DEFAULTS: {
    maxTokens: 4000,
    temperature: 0.7,
    timeout: 30000, // 30 секунд
    retries: 3
  },

  // Промпты для разных задач
  PROMPTS: {
    COMPONENT_GENERATION: {
      system: `Ты опытный React/TypeScript разработчик. Создавай чистый, типизированный код следуя принципам Clean Architecture.
      
Требования:
- Используй TypeScript с явными типами
- Применяй Tailwind CSS для стилизации
- Следуй принципам Clean Code
- Добавляй JSDoc комментарии
- Обрабатывай ошибки корректно`,

      user: `Создай React компонент на основе документации:
{documentation}

Компонент должен называться: {name}
Учти существующий код: {existingCode}

Верни только код компонента без объяснений.`
    },

    ARCHITECTURE_ANALYSIS: {
      system: `Ты архитектор ПО, специализирующийся на Clean Architecture и современных веб-технологиях.
      
Анализируй требования и предлагай:
- Модульную структуру проекта
- Применение паттернов проектирования
- Разделение ответственности между слоями
- Технологический стек`,

      user: `Проанализируй требования и предложи архитектуру:
{requirements}

Существующая структура: {existingStructure}
Предпочтения: {preferences}

Верни JSON с полной архитектурой.`
    },

    CODE_REVIEW: {
      system: `Ты senior разработчик, проводящий code review. Оценивай код по критериям:
- Читаемость и поддерживаемость
- Производительность
- Безопасность
- Соответствие best practices
- Типизация (для TypeScript)`,

      user: `Проведи code review для кода:
{code}

Язык: {language}
Контекст: {context}

Верни JSON с оценкой, проблемами и рекомендациями.`
    }
  }
} as const;

// Валидация конфигурации
export function validateAIConfig(): void {
  const { OPENAI_API_KEY, CLAUDE_API_KEY } = process.env;
  
  if (!OPENAI_API_KEY && !CLAUDE_API_KEY) {
    console.warn('⚠️  No AI API keys found. Set OPENAI_API_KEY or CLAUDE_API_KEY environment variables.');
  }
  
  if (OPENAI_API_KEY && !OPENAI_API_KEY.startsWith('sk-')) {
    throw new Error('Invalid OpenAI API key format');
  }
}

// Получение активного провайдера
export function getActiveProvider(): LLMProvider {
  if (process.env.OPENAI_API_KEY) {
    return AI_CONFIG.PROVIDERS.OPENAI;
  }
  
  if (process.env.CLAUDE_API_KEY) {
    return AI_CONFIG.PROVIDERS.CLAUDE;
  }
  
  throw new Error('No AI provider configured. Please set API keys.');
}
