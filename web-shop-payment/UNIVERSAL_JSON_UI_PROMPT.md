# Универсальный промпт для создания JSON-driven UI модуля

## Контекст

Создай модуль `[MODULE_NAME]` для рендеринга UI из JSON конфигурации с соблюдением Clean Architecture, DDD, типобезопасности и следующих документаций:
- `/Users/dmitryivanov/Documents/Work/development-ai/app-docs(v.6.1)/CODING_STANDARDS.md`
- `/Users/dmitryivanov/Documents/Work/development-ai/app-docs(v.6.1)/UNIVERSAL_COMPONENTS.md`
- `/Users/dmitryivanov/Documents/Work/development-ai/app-docs(v.6.1)/architecture/LOGIC_THINKING_GUIDE.md`

## Требования

### 1. Архитектурные принципы

**Domain Layer (Value Objects, НЕ Entities):**
- `PageConfig` - конфигурация страницы (type, version, theme, layout)
- `ThemeConfig` - тема (colors, spacing, typography)
- `ComponentNode` - узел компонента в дереве UI (type, id, props, styles, children)
- Все Value Objects имеют метод `equals()` для сравнения по значениям
- Все Value Objects immutable (readonly поля, Object.freeze)
- Статический метод `create()` возвращает `Result<ValueObject, DomainError>`

**Application Layer:**
- `ConfigRepositoryPort` - порт для загрузки конфигурации
- `LoadPageConfigUseCase` - use case для загрузки и валидации конфигурации
- Никаких бизнес-логики в портах, только интерфейсы

**Infrastructure Layer:**
- `ConfigRepository` - реализация загрузки через `HttpClientMock`
  - Загрузка из `/api/[module]/configs/[pageType]`
  - Runtime валидация с Type Guards (`_isValidConfigDTO`, `_isValidThemeDTO`, `_isValidComponentNodeDTO`)
  - Рекурсивное создание `ComponentNode` с защитой от бесконечной рекурсии (`MAX_RECURSION_DEPTH = 10`)
  - Типобезопасное извлечение props (`_extractProps`) и styles (`_extractStyles`)
- `ComponentRegistry` (сервис) - регистрация React компонентов из `@components`
- `StyleBuilder` (сервис) - конвертация `StyleConfig` в Tailwind классы и inline styles
  - `buildClassName()` - для padding и других Tailwind утилит
  - `buildInlineStyles()` - для цветов из темы (backgroundColor, textColor)

**Interface Adapters:**
- `[Page]ViewModel` - discriminated union (`loading` | `success` | `error`)
- `[Page]Presenter` - трансформация `PageConfig` в `ViewModel`, содержит `labels`
- `DynamicRenderer` - рекурсивный компонент для рендеринга `ComponentNode`
- `[Page]Renderer` - UI компонент, использует presenter и рендерит `DynamicRenderer`

### 2. Типобезопасность (критично!)

**Полный запрет `any`:**
- ✅ Все типы явно объявлены
- ✅ Runtime валидация входящих JSON данных через Type Guards
- ✅ Discriminated unions для props компонентов
- ✅ Branded types для примитивов (`SpacingValue`, `ColorKey`)
- ✅ Strict null checks везде

**Domain Types (`domain/types.ts`):**
```typescript
export type SpacingValue = number;
export type ColorKey = 'primary' | 'secondary' | 'accent' | 'background' | 'surface' | 'text' | 'textSecondary' | 'success' | 'error' | 'warning' | 'border';

export interface StyleConfig {
  readonly padding?: SpacingValue;
  readonly backgroundColor?: ColorKey;
  readonly textColor?: ColorKey;
}

// Discriminated union для props каждого типа компонента
export type ComponentProps =
  | { readonly type: 'Button'; readonly props: ButtonProps }
  | { readonly type: 'Container'; readonly props: ContainerProps }
  | { readonly type: '[YourComponent]'; readonly props: [YourComponent]Props };

// DTO для JSON (с unknown для runtime валидации)
export interface ComponentNodeDTO {
  readonly type: string;
  readonly id: string;
  readonly props?: Record<string, unknown>;
  readonly styles?: Record<string, unknown>;
  readonly children?: ComponentNodeDTO[];
}

export interface ConfigDTO {
  readonly version: string;
  readonly platform: string;
  readonly theme: ThemeDTO;
  readonly layout: ComponentNodeDTO;
}
```

**Type Guards в Repository:**
```typescript
private _isValidConfigDTO(data: unknown): data is ConfigDTO {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.version === 'string' &&
    this._isValidThemeDTO(obj.theme) &&
    this._isValidComponentNodeDTO(obj.layout)
  );
}

private _extractProps(type: string, rawProps: Record<string, unknown> | undefined): ButtonProps | ContainerProps {
  if (type === 'Button') {
    return {
      text: typeof rawProps?.text === 'string' ? rawProps.text : undefined,
      icon: typeof rawProps?.icon === 'string' ? rawProps.icon : undefined,
    };
  }
  return {}; // Container или другой тип
}
```

### 3. JSON Конфигурация

**Структура:**
```json
{
  "version": "1.0",
  "platform": "web",
  "theme": {
    "colors": {
      "primary": "#3B5AFE",
      "background": "#0D1117",
      "surface": "#161B22",
      "text": "#FFFFFF"
    },
    "spacing": [0, 0.5, 1, 1.5, 2, 3, 4]
  },
  "layout": {
    "type": "Container",
    "id": "root",
    "props": {},
    "styles": {
      "padding": 2,
      "backgroundColor": "surface"
    },
    "children": [
      {
        "type": "Button",
        "id": "btn-1",
        "props": {
          "text": "Click Me",
          "icon": "🚀"
        },
        "styles": {
          "padding": 2,
          "backgroundColor": "primary",
          "textColor": "text"
        }
      }
    ]
  }
}
```

**Расположение:**
- Конфиг: `src/modules/[module]/infrastructure/configs/[pageType].config.json`
- API Route: `app/api/[module]/configs/[pageType]/route.ts` (читает из `src/modules/[module]/infrastructure/configs/`)
- Mock (опционально): `public/mocks/api/[module]/configs/[pageType].json`

### 4. Universal Components

**Использовать из `@components`:**
- `UniversalButton` - кнопка с text, icon, onClick, className, style, children
- `UniversalContainer` - контейнер с className, style, children
- Все props опциональные, типобезопасные

**Регистрация в `ComponentRegistry`:**
```typescript
import { UniversalButton, UniversalContainer } from '@components';

constructor() {
  this._components.set('Button', UniversalButton);
  this._components.set('Container', UniversalContainer);
}
```

### 5. DynamicRenderer

**Рекурсивный рендеринг:**
```typescript
export function DynamicRenderer({ node, theme }: DynamicRendererProps): JSX.Element | null {
  const registry = container.get<ComponentRegistry>(TYPES.ComponentRegistry);
  const styleBuilder = container.get<StyleBuilder>(TYPES.StyleBuilder);

  const Component = registry.getComponent(node.type);
  if (!Component) return null;

  const className = styleBuilder.buildClassName(node.styles);
  const style = styleBuilder.buildInlineStyles(node.styles, theme);

  const children = node.children?.map((child, idx) => (
    <DynamicRenderer key={child.id || idx} node={child} theme={theme} />
  ));

  return createElement(Component, { ...node.props, className, style, children });
}
```

### 6. Data Flow Tests

**Обязательные тесты (`__tests__/data-flow/`):**
- `should complete full data flow: HttpClientMock -> Repository -> UseCase -> Presenter -> ViewModel`
- `should validate data flow from JSON file to Value Objects`
- `should handle complete flow with StyleBuilder transformation`
- `should handle error flow when JSON file not found`
- `should verify Value Objects immutability in data flow`
- `should trace complete data path: JSON -> HTTP -> Repository -> UseCase -> Presenter -> ViewModel`

**Проверки:**
- ViewModel.status === 'success'
- PageConfig, ThemeConfig, ComponentNode корректно созданы
- Value Objects имеют `equals()` метод
- Styles корректно преобразованы в Tailwind классы и inline styles
- Ошибки обрабатываются на всех уровнях

### 7. DI Container

**Bootstrap (`infrastructure/bootstrap/bind.[module].ts`):**
```typescript
export function bind[Module](container: Container): void {
  container.bind(TYPES.ConfigRepository).to(ConfigRepository).inSingletonScope();
  container.bind(TYPES.LoadPageConfigUseCase).to(LoadPageConfigUseCase).inSingletonScope();
  container.bind(TYPES.[Page]Presenter).to([Page]Presenter).inSingletonScope();
  container.bind(TYPES.ComponentRegistry).to(ComponentRegistry).inSingletonScope();
  container.bind(TYPES.StyleBuilder).to(StyleBuilder).inSingletonScope();
}
```

**Types (`infrastructure/bootstrap/types.ts`):**
```typescript
export const [MODULE]_TYPES = {
  ConfigRepository: Symbol.for('[Module].ConfigRepository'),
  LoadPageConfigUseCase: Symbol.for('[Module].LoadPageConfigUseCase'),
  [Page]Presenter: Symbol.for('[Module].[Page]Presenter'),
  ComponentRegistry: Symbol.for('[Module].ComponentRegistry'),
  StyleBuilder: Symbol.for('[Module].StyleBuilder'),
};
```

### 8. Чеклист перед имплементацией

**Уточни у пользователя:**
1. Название модуля и pageType?
2. Какие компоненты будут в JSON (Button, Container, Card, Grid и т.д.)?
3. Какие props нужны каждому компоненту?
4. Откуда данные: только структура в JSON или данные тоже в JSON?
5. Нужна интерактивность (onClick, navigation)?
6. На какой странице рендерить (`/[page]` или `/demo`)?

**Проверь перед созданием:**
- [ ] Все документации изучены (`CODING_STANDARDS.md`, `UNIVERSAL_COMPONENTS.md`, `LOGIC_THINKING_GUIDE.md`)
- [ ] Value Objects определены правильно (НЕ Entities!)
- [ ] Типы без `any`, с discriminated unions
- [ ] Type Guards для runtime валидации
- [ ] `HttpClientMock` настроен на правильный путь
- [ ] API Route создан для сервинга JSON
- [ ] Universal Components используются из `@components`
- [ ] Data Flow тесты покрывают весь путь данных
- [ ] DI контейнер настроен и экспортирован

### 9. Файловая структура модуля

```
src/modules/[module]/
├── domain/
│   ├── types.ts (ComponentProps, StyleConfig, DTO types)
│   ├── errors/[module].error.ts
│   └── value-objects/
│       ├── page-config.value-object.ts
│       ├── theme-config.value-object.ts
│       └── component-node.value-object.ts
├── application/
│   ├── ports/config-repository.port.ts
│   └── use-cases/load-page-config.use-case.ts
├── infrastructure/
│   ├── configs/[pageType].config.json
│   ├── repositories/config.repository.ts
│   ├── services/
│   │   ├── component-registry.service.ts
│   │   └── style-builder.service.ts
│   └── bootstrap/
│       ├── types.ts
│       └── bind.[module].ts
└── interface-adapters/
    ├── view-models/[page].view-model.ts
    ├── presenters/[page].presenter.ts
    └── ui/
        ├── components/
        │   ├── dynamic-renderer.tsx
        │   ├── [page]-renderer.tsx
        │   └── __tests__/
        │       └── data-flow/[page]-rendering-flow.test.ts
        └── [page].tsx (Next.js page)
```

### 10. Важные детали

**Result Monad:**
- Всегда проверяй `result.isSuccess()` и `result.isFailure()`
- `result.data` доступен только после `isSuccess()` проверки
- `result.error` доступен только после `isFailure()` проверки

**StyleBuilder:**
- `buildClassName()` - только для Tailwind утилит (padding, margin)
- `buildInlineStyles()` - для цветов из темы (backgroundColor, textColor)
- Цвета НЕ через Tailwind классы, а через inline styles с theme.colors

**Imports:**
- `import type` для типов в декораторах (@inject)
- `import` для классов и функций
- `@components` алиас для Universal Components

**HttpClientMock:**
- В браузере: fetch от `/api/[module]/configs/[pageType]`
- В тестах (Node.js): прямое чтение из `public/mocks/` через `fs`

## Результат

После выполнения получим:
- ✅ Полностью типобезопасный модуль без `any`
- ✅ JSON-driven UI с валидацией на всех уровнях
- ✅ Clean Architecture с четким разделением слоев
- ✅ DDD с Value Objects (НЕ Entities!)
- ✅ Comprehensive Data Flow тесты
- ✅ Переиспользуемые Universal Components
- ✅ Production-ready код с error handling

## Пример использования промпта

```
Используя UNIVERSAL_JSON_UI_PROMPT.md, создай модуль `game-shop` для рендеринга магазина игровых товаров.

Уточнения:
1. Модуль: game-shop, pageType: store
2. Компоненты: Container, Grid, ProductCard, Button, Badge
3. Props: ProductCard (title, price, discount, image, badges), Button (text, onClick)
4. Данные: структура UI в config.json, данные продуктов из отдельного API
5. Интерактивность: onClick для карточек -> навигация на страницу товара
6. Страница: /game-shop
```

