# Inversify v7 - Руководство по использованию

## Обзор

Проект использует **Inversify v7** для Dependency Injection. Inversify v7 имеет некоторые отличия от v6, которые учтены в этой реализации.

## Установленные пакеты

```json
{
  "inversify": "^7.10.2",
  "reflect-metadata": "^0.2.2"
}
```

## Конфигурация TypeScript

В `tsconfig.json` обязательно должны быть включены:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "target": "ES2017" // или выше
  }
}
```

## Глобальные сервисы

### Определение символов (TYPES)

```typescript
// src/infrastructure/bootstrap/types.ts
export const TYPES = {
  Logger: Symbol.for('Logger'),
  HttpClient: Symbol.for('HttpClient'),
  EventBus: Symbol.for('EventBus'),
  RealtimeClient: Symbol.for('RealtimeClient'),
} as const;
```

### Регистрация в контейнере

```typescript
// src/infrastructure/bootstrap/container.ts
import 'reflect-metadata';
import { Container } from 'inversify';

const container = new Container();

// Регистрация с singleton scope
container.bind<Logger>(TYPES.Logger).to(ConsoleLogger).inSingletonScope();
container.bind<HttpClient>(TYPES.HttpClient).to(AxiosHttpClient).inSingletonScope();
container.bind<EventBus>(TYPES.EventBus).to(InMemoryEventBus).inSingletonScope();

// Регистрация с фабрикой (для сложных зависимостей)
container.bind<RealtimeClientPort>(TYPES.RealtimeClient).toDynamicValue(() => {
  const logger = container.get<Logger>(TYPES.Logger);
  return new MockRealtimeClient(logger);
}).inSingletonScope();

export { container, TYPES };
```

## Использование декораторов

### Простой класс с @injectable()

```typescript
import { injectable } from 'inversify';
import { Logger } from '../../application/ports/logger.port';

@injectable()
export class ConsoleLogger implements Logger {
  info(message: string, meta?: any): void {
    console.log(`[INFO] ${message}`, meta || '');
  }
  // ...
}
```

### Класс БЕЗ зависимостей через DI

Если класс имеет простые зависимости, можно НЕ использовать декораторы и регистрировать через `toDynamicValue`:

```typescript
// Класс БЕЗ @injectable()
export class MockRealtimeClient implements RealtimeClientPort {
  constructor(private readonly logger: Logger) {}
  // ...
}

// Регистрация через фабрику
container.bind<RealtimeClientPort>(TYPES.RealtimeClient).toDynamicValue(() => {
  const logger = container.get<Logger>(TYPES.Logger);
  return new MockRealtimeClient(logger);
}).inSingletonScope();
```

### Класс С зависимостями через DI (Use Cases, Repositories)

⚠️ **ВАЖНО для Inversify v7**: Декораторы параметров `@inject()` имеют ограничения в TypeScript.

**Рекомендуемый подход для v7:**

```typescript
import { injectable } from 'inversify';
import { TYPES } from '@/infrastructure/bootstrap/types';
import { Logger } from '@/application/ports/logger.port';
import { HttpClient } from '@/application/ports/http-client.port';

@injectable()
export class GetDashboardDataUseCase {
  private readonly logger: Logger;
  private readonly httpClient: HttpClient;

  constructor(logger: Logger, httpClient: HttpClient) {
    this.logger = logger;
    this.httpClient = httpClient;
  }

  async execute(): Promise<Result<DashboardData>> {
    this.logger.info('Fetching dashboard data');
    const response = await this.httpClient.get('/api/dashboard');
    // ...
  }
}

// Регистрация через фабрику
container.bind<GetDashboardDataUseCase>(DashboardTYPES.GetDashboardDataUseCase)
  .toDynamicValue(() => {
    const logger = container.get<Logger>(TYPES.Logger);
    const httpClient = container.get<HttpClient>(TYPES.HttpClient);
    return new GetDashboardDataUseCase(logger, httpClient);
  })
  .inSingletonScope();
```

**Альтернативный подход (если decorators работают):**

Если у вас работают декораторы параметров, можно использовать:

```typescript
import { injectable, inject } from 'inversify';

@injectable()
export class GetDashboardDataUseCase {
  constructor(
    @inject(TYPES.Logger) private logger: Logger,
    @inject(TYPES.HttpClient) private httpClient: HttpClient
  ) {}
}
```

## Модульный DI

Каждый модуль должен иметь свои TYPES и контейнер:

### 1. Определяем типы модуля

```typescript
// src/modules/dashboard/infrastructure/bootstrap/dashboard.types.ts
export const DashboardTYPES = {
  DashboardRepository: Symbol.for('DashboardRepository'),
  GetDashboardDataUseCase: Symbol.for('GetDashboardDataUseCase'),
  UpdateMetricsUseCase: Symbol.for('UpdateMetricsUseCase'),
  DashboardPresenter: Symbol.for('DashboardPresenter'),
} as const;
```

### 2. Регистрируем в контейнере

```typescript
// src/modules/dashboard/infrastructure/bootstrap/dashboard.container.ts
import { container } from '@/infrastructure/bootstrap/container';
import { TYPES } from '@/infrastructure/bootstrap/types';
import { DashboardTYPES } from './dashboard.types';

// Repository
container.bind<DashboardRepositoryPort>(DashboardTYPES.DashboardRepository)
  .toDynamicValue(() => {
    const httpClient = container.get<HttpClient>(TYPES.HttpClient);
    return new DashboardRepository(httpClient);
  })
  .inSingletonScope();

// Use Case
container.bind<GetDashboardDataUseCase>(DashboardTYPES.GetDashboardDataUseCase)
  .toDynamicValue(() => {
    const logger = container.get<Logger>(TYPES.Logger);
    const repository = container.get<DashboardRepositoryPort>(
      DashboardTYPES.DashboardRepository
    );
    return new GetDashboardDataUseCase(logger, repository);
  })
  .inSingletonScope();

// Presenter
container.bind<DashboardPresenter>(DashboardTYPES.DashboardPresenter)
  .toDynamicValue(() => {
    const getDashboardUseCase = container.get<GetDashboardDataUseCase>(
      DashboardTYPES.GetDashboardDataUseCase
    );
    const updateMetricsUseCase = container.get<UpdateMetricsUseCase>(
      DashboardTYPES.UpdateMetricsUseCase
    );
    return new DashboardPresenter(getDashboardUseCase, updateMetricsUseCase);
  })
  .inSingletonScope();

export { DashboardTYPES };
```

### 3. Импортируем в layout.tsx

```typescript
// app/layout.tsx
"use client";
import 'reflect-metadata';
import '@/infrastructure/bootstrap/container';
import '@/modules/dashboard/infrastructure/bootstrap/dashboard.container';
```

## Использование в React Views

```typescript
import { useMemo } from 'react';
import { container } from '@/infrastructure/bootstrap/container';
import { DashboardTYPES } from '../infrastructure/bootstrap/dashboard.types';
import { DashboardPresenter } from '../interface-adapters/presenters/dashboard.presenter';

export default function DashboardView() {
  const presenter = useMemo(() => {
    return container.get<DashboardPresenter>(DashboardTYPES.DashboardPresenter);
  }, []);

  // Использование presenter
  useEffect(() => {
    presenter.loadData();
  }, [presenter]);

  return <div>{/* UI */}</div>;
}
```

## Scopes (области видимости)

Inversify v7 поддерживает:

- `.inSingletonScope()` - один экземпляр на весь контейнер (рекомендуется для большинства сервисов)
- `.inRequestScope()` - новый экземпляр на каждый запрос
- `.inTransientScope()` - новый экземпляр каждый раз при вызове get() (по умолчанию)

Для инфраструктурных сервисов рекомендуется использовать `.inSingletonScope()`.

## HTTP Client режимы

Переключение между Mock и реальным HTTP:

```bash
# .env.local
NEXT_PUBLIC_HTTP_CLIENT=mock  # Использовать моки
# или
NEXT_PUBLIC_HTTP_CLIENT=axios # Использовать реальный HTTP (по умолчанию)
```

## Тестирование

В тестах создавайте отдельный контейнер:

```typescript
import { Container } from 'inversify';
import { TYPES } from '@/infrastructure/bootstrap/types';

describe('GetDashboardDataUseCase', () => {
  let testContainer: Container;
  let useCase: GetDashboardDataUseCase;

  beforeEach(() => {
    testContainer = new Container();
    
    // Регистрируем моки
    testContainer.bind<Logger>(TYPES.Logger).to(ConsoleLogger);
    testContainer.bind<HttpClient>(TYPES.HttpClient).to(HttpClientMock);
    
    // Регистрируем тестируемый use case
    testContainer.bind<GetDashboardDataUseCase>(DashboardTYPES.GetDashboardDataUseCase)
      .toDynamicValue(() => {
        const logger = testContainer.get<Logger>(TYPES.Logger);
        const httpClient = testContainer.get<HttpClient>(TYPES.HttpClient);
        return new GetDashboardDataUseCase(logger, httpClient);
      });

    useCase = testContainer.get<GetDashboardDataUseCase>(
      DashboardTYPES.GetDashboardDataUseCase
    );
  });

  it('should fetch dashboard data', async () => {
    const result = await useCase.execute();
    expect(result.isSuccess).toBe(true);
  });
});
```

## Важные правила

✅ **ДЕЛАТЬ:**
- Использовать `Symbol.for('ServiceName')` для создания уникальных идентификаторов
- Регистрировать сервисы с `.inSingletonScope()` для синглтонов
- Использовать `.toDynamicValue()` для классов с зависимостями
- Импортировать `'reflect-metadata'` в точке входа
- Использовать `@injectable()` для простых классов без DI

❌ **НЕ ДЕЛАТЬ:**
- НЕ используйте интерфейсы как символы (TYPES.LoggerPort ❌)
- НЕ используйте строки вместо символов ('logger' ❌)
- НЕ создавайте экземпляры вручную (new Service() ❌) - используйте контейнер
- НЕ забывайте импортировать контейнеры модулей в layout.tsx

## Отличия от Inversify v6

1. **Декораторы параметров**: В v7 `@inject()` может не работать с `private readonly` в некоторых конфигурациях TypeScript
   - **Решение**: Используйте `.toDynamicValue()` для регистрации

2. **ResolutionContext**: В v7 контекст резолюции имеет другую структуру
   - **v6**: `context.container.get()`
   - **v7**: Используйте прямой доступ к контейнеру в фабрике

3. **Рекомендуемый паттерн для v7**: Фабричный подход через `toDynamicValue()` более стабилен

## Ссылки

- [Inversify v7 Documentation](https://inversify.io/)
- [TypeScript Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html)
- [Reflect Metadata](https://github.com/rbuckton/reflect-metadata)




