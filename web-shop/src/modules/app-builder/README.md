# App Builder Module

Модуль для создания и управления визуальными шаблонами приложений с помощью GrapesJS.

## Структура модуля

```
app-builder/
├── domain/
│   └── entities/
│       └── template.entity.ts         # Доменные сущности шаблонов
├── application/
│   ├── ports/
│   │   └── template-repository.port.ts  # Интерфейс репозитория
│   └── use-cases/
│       ├── get-template-details.use-case.ts
│       └── list-templates.use-case.ts
├── infrastructure/
│   ├── bootstrap/
│   │   ├── bind.app-builder.ts        # Конфигурация DI контейнера
│   │   └── types.ts                   # Типы для DI
│   └── storage/
│       └── supabase-template.repository.ts  # Реализация репозитория
└── interface-adapters/
    ├── presenters/
    │   └── templates.presenter.ts     # Presenter для UI
    └── ui/
        └── components/
            ├── GrapesJsEditor.tsx     # Визуальный редактор
            └── TemplatesList.tsx      # Список шаблонов
```

## API Endpoints

### GET /api/app-builder/templates
Получить список шаблонов.

**Query params:**
- `query` - поисковый запрос (опционально)
- `page` - номер страницы (по умолчанию 1)
- `pageSize` - размер страницы (по умолчанию 20)

**Response:**
```json
{
  "templates": [
    {
      "id": "uuid",
      "name": "Template Name",
      "description": "Template description",
      "updated_at": "2026-01-21T..."
    }
  ]
}
```

### GET /api/app-builder/templates/[id]
Получить детали шаблона по ID.

**Response:**
```json
{
  "template": {
    "id": "uuid",
    "name": "Template Name",
    "description": "Template description",
    "template_data": { /* GrapeJS JSON */ },
    "created_at": "2026-01-21T...",
    "updated_at": "2026-01-21T..."
  }
}
```

### POST /api/app-builder/templates
Создать новый шаблон.

**Body:**
```json
{
  "name": "New Template",
  "description": "Optional description",
  "templateData": { /* GrapeJS project data */ }
}
```

### PUT /api/app-builder/templates
Обновить существующий шаблон.

**Body:**
```json
{
  "id": "uuid",
  "name": "Updated Name",
  "description": "Updated description",
  "templateData": { /* Updated GrapeJS project data */ }
}
```

### DELETE /api/app-builder/templates?id={id}
Удалить шаблон.

## Использование

### В коде

```typescript
import { container } from '@/infrastructure/bootstrap/container';
import { APP_BUILDER_TYPES } from '@/modules/app-builder/infrastructure/bootstrap/types';
import type { TemplatesPresenter } from '@/modules/app-builder/interface-adapters/presenters/templates.presenter';

// Получить presenter
const presenter = container.get<TemplatesPresenter>(
  APP_BUILDER_TYPES.TemplatesPresenter
);

// Загрузить список шаблонов
await presenter.loadTemplates();

// Выбрать шаблон
await presenter.selectTemplate(templateId);
```

### В компонентах

```tsx
import { GrapesJsEditor } from '@/modules/app-builder/interface-adapters/ui/components/GrapesJsEditor';

<GrapesJsEditor 
  onChange={(projectData) => {
    console.log('Project changed:', projectData);
  }}
  onReady={(editor) => {
    console.log('Editor ready:', editor);
  }}
/>
```

## База данных

Модуль использует таблицу `templates_grape` в Supabase:

```sql
CREATE TABLE templates_grape (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Интеграция с UI Builder

Модуль интегрирован в UI Builder и доступен через вкладки:
- **GrapeJS** - визуальный редактор
- **GrapeJS Templates** - список и управление шаблонами

## Зависимости

- **grapesjs** - визуальный редактор
- **@grapesjs/react** - React wrapper для GrapesJS
- **grapesjs-preset-webpage** - стандартный пресет с компонентами
- **inversify** - dependency injection

## Clean Architecture

Модуль следует принципам Clean Architecture:

1. **Domain Layer** - содержит бизнес-логику и доменные сущности
2. **Application Layer** - содержит use cases и порты
3. **Infrastructure Layer** - содержит реализации портов (репозитории, API)
4. **Interface Adapters Layer** - содержит presenters и UI компоненты

Зависимости направлены внутрь: Infrastructure → Application → Domain
