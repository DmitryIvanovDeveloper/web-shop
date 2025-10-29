# UI Renderer Service

Универсальный сервис для рендеринга UI из ComponentNode структуры.

## 🎯 Назначение

UI Renderer Service - это **Infrastructure Service**, который:
- ✅ Принимает UIDescriptor от модулей
- ✅ Рендерит JSX.Element из ComponentNode
- ✅ НЕ владеет данными
- ✅ НЕ загружает конфигурацию
- ✅ Просто технический исполнитель

## 📦 Архитектура

```
┌────────────────────────────────────────┐
│      UI RENDERER SERVICE               │
│   (Infrastructure Layer)               │
│                                        │
│  Принимает:  UIDescriptor              │
│  Возвращает: JSX.Element               │
│                                        │
│  Не знает:                             │
│  - Откуда данные                       │
│  - Какая бизнес-логика                 │
│  - Зачем рендерить                     │
└────────────────────────────────────────┘
```

## 🔧 Использование

### Базовый пример

```typescript
import { UIRendererService } from '@/infrastructure/services/ui-renderer';
import type { UIDescriptor } from '@/shared/ui';

// Модуль создаёт UIDescriptor
const descriptor: UIDescriptor = {
  layout: {
    id: 'products-list',
    type: 'DataGrid',
    props: { columns: 4 },
    children: products.map(p => ({
      id: p.id,
      type: 'OfferCard',
      props: {
        title: p.title,
        price: p.price
      }
    }))
  },
  theme: {
    colors: {
      primary: '#3B5AFE',
      background: '#0D1117',
      surface: '#161B22',
      text: '#FFFFFF'
    },
    spacing: [0, 4, 8, 12, 16]
  },
  context: {
    handleBuyProduct: (productId) => {
      // UseCase модуля
    }
  }
};

// Сервис рендерит
const element = uiRendererService.renderUI(descriptor);
```

### С использованием UIBuilder

```typescript
import { UIBuilder } from '@/shared/ui/builders';

const descriptor = new UIBuilder()
  .container({ vertical: true })
    .withStyles({ padding: 4, backgroundColor: 'surface' })
    .text({ text: 'Products' })
      .withStyles({ fontSize: '2xl', fontWeight: 'bold' })
    .grid({ columns: 4, gap: 16 })
  .build();
```

## 🏗️ Компоненты сервиса

### UIRendererService
Главный сервис, orchestrator

### UIComponentRegistry
Регистрация React компонентов

### UIStyleBuilder
Преобразование StyleConfig → CSS

### UIActionHandler
Обработка actions (onClick, etc.)

## 🧪 Тестирование

```bash
npm run test -- src/infrastructure/services/ui-renderer
```

## 📝 Примечание

Сервис создан, но **НЕ используется** в модулях.
Будет постепенная миграция модулей на использование сервиса.


