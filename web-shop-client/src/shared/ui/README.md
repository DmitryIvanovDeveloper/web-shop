# Shared UI Types

Типы для универсального UI Renderer Service.

## 📦 Структура

```
shared/ui/
├── ui-descriptor.ts        # Контракт между модулем и сервисом
├── component-node.ts       # Узел UI дерева
├── theme-config.ts         # Конфигурация темы
├── style-config.ts         # Типобезопасные стили
├── actions-config.ts       # Actions (onClick, onChange, etc.)
├── action-context.ts       # Контекст обработчиков
├── component-types.ts      # Каталог доступных компонентов
├── builders/               # Утилиты для создания UI
│   ├── ui-builder.ts       # Fluent API builder
│   └── grid-template.ts    # Готовые шаблоны
└── index.ts                # Общий экспорт
```

## 🎯 Основные концепции

### UIDescriptor
Контракт между модулем и UI Renderer Service:
- `layout` - что рендерить (ComponentNode)
- `theme` - как стилизовать (ThemeConfig)
- `context` - как обрабатывать события (ActionContext)

### ComponentNode
Узел в дереве UI компонентов:
- `id` - уникальный идентификатор
- `type` - тип компонента ('Button', 'Container', etc.)
- `props` - свойства компонента
- `styles` - стили (StyleConfig)
- `children` - вложенные узлы
- `actions` - обработчики событий

### ThemeConfig
Глобальная тема:
- `colors` - палитра цветов
- `spacing` - значения отступов
- `typography` - типографика

### StyleConfig
Типобезопасные стили:
- Layout (flex, grid)
- Spacing (padding, margin)
- Colors (backgroundColor, textColor)
- Typography (fontSize, fontWeight)
- Position (absolute, relative)
- Visual (border, shadow)

## 🔧 Примеры использования

### Пример 1: Простой UI

```typescript
import type { UIDescriptor } from '@/shared/ui';

const descriptor: UIDescriptor = {
  layout: {
    id: 'login-form',
    type: 'Container',
    props: { vertical: true },
    styles: { padding: 4 },
    children: [
      {
        id: 'title',
        type: 'Text',
        props: { text: 'Login' },
        styles: { fontSize: '2xl', fontWeight: 'bold' }
      },
      {
        id: 'email-input',
        type: 'Input',
        props: { placeholder: 'Email' }
      },
      {
        id: 'submit-button',
        type: 'Button',
        props: { text: 'Submit' },
        actions: {
          onClick: {
            type: 'custom',
            handler: 'handleSubmit'
          }
        }
      }
    ]
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
    handleSubmit: () => {
      // Module UseCase
    }
  }
};
```

### Пример 2: С UIBuilder

```typescript
import { UIBuilder } from '@/shared/ui/builders';

const builder = new UIBuilder();

const layout = builder
  .container({ vertical: true })
    .withStyles({ padding: 4, backgroundColor: 'surface' })
    .text({ text: 'Products' })
      .withStyles({ fontSize: '2xl' })
    .grid({ columns: 4 })
  .build();

const descriptor: UIDescriptor = {
  layout,
  theme: myTheme
};
```

### Пример 3: С GridTemplate

```typescript
import { GridTemplate } from '@/shared/ui/builders';

const items: ComponentNode[] = products.map(p => ({
  id: p.id,
  type: 'OfferCard',
  props: {
    title: p.title,
    price: p.price
  }
}));

const grid = GridTemplate.createProductGrid(items, 4, 16);
```

## 📝 Type Safety

Все типы строго типизированы:
- ✅ No `any`
- ✅ Readonly где нужно
- ✅ Discriminated unions для actions
- ✅ Type guards где необходимо
- ✅ Branded types для spacing/colors

## 🚀 Использование в модулях

Модуль НЕ использует UI Renderer напрямую.
Presenter создаёт UIDescriptor и передаёт в сервис.

```typescript
// В Presenter модуля
class ProductsPresenter {
  public createUIDescriptor(products: Product[]): UIDescriptor {
    const layout: ComponentNode = {
      id: 'products-container',
      type: 'Container',
      props: { vertical: true },
      children: products.map(p => ({
        id: p.id,
        type: 'OfferCard',
        props: {
          title: p.title,
          price: p.getFormattedPrice()
        }
      }))
    };

    return {
      layout,
      theme: this._theme,
      context: {
        handleBuyProduct: (productId: string) => {
          this._selectProductUseCase.execute({ productId });
        }
      }
    };
  }
}
```


