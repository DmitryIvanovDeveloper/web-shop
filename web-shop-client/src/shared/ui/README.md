# Shared UI Types

Types for the universal UI Renderer Service.

## 📦 Structure

```
shared/ui/
├── ui-descriptor.ts        # Contract between module and service
├── component-node.ts       # UI tree node
├── theme-config.ts         # Theme configuration
├── style-config.ts         # Type-safe styles
├── actions-config.ts       # Actions (onClick, onChange, etc.)
├── action-context.ts       # Handler context
├── component-types.ts      # Available components catalog
├── builders/               # UI creation utilities
│   ├── ui-builder.ts       # Fluent API builder
│   └── grid-template.ts    # Ready-made templates
└── index.ts                # Common export
```

## 🎯 Core Concepts

### UIDescriptor
Contract between module and UI Renderer Service:
- `layout` - what to render (ComponentNode)
- `theme` - how to style (ThemeConfig)
- `context` - how to handle events (ActionContext)

### ComponentNode
Node in the UI component tree:
- `id` - unique identifier
- `type` - component type ('Button', 'Container', etc.)
- `props` - component properties
- `styles` - styles (StyleConfig)
- `children` - nested nodes
- `actions` - event handlers

### ThemeConfig
Global theme:
- `colors` - color palette
- `spacing` - spacing values
- `typography` - typography

### StyleConfig
Type-safe styles:
- Layout (flex, grid)
- Spacing (padding, margin)
- Colors (backgroundColor, textColor)
- Typography (fontSize, fontWeight)
- Position (absolute, relative)
- Visual (border, shadow)

## 🔧 Usage Examples

### Example 1: Simple UI

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

### Example 2: With UIBuilder

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

### Example 3: With GridTemplate

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

All types are strictly typed:
- ✅ No `any`
- ✅ Readonly where needed
- ✅ Discriminated unions for actions
- ✅ Type guards where necessary
- ✅ Branded types for spacing/colors

## 🚀 Usage in Modules

Modules do NOT use UI Renderer directly.
Presenter creates UIDescriptor and passes it to the service.

```typescript
// In module Presenter
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


