# UI Renderer Service

Universal service for rendering UI from ComponentNode structure.

## 🎯 Purpose

UI Renderer Service is an **Infrastructure Service** that:
- ✅ Accepts UIDescriptor from modules
- ✅ Renders JSX.Element from ComponentNode
- ✅ Does NOT own data
- ✅ Does NOT load configuration
- ✅ Simply a technical executor

## 📦 Architecture

```
┌────────────────────────────────────────┐
│      UI RENDERER SERVICE               │
│   (Infrastructure Layer)               │
│                                        │
│  Accepts:  UIDescriptor               │
│  Returns:  JSX.Element                │
│                                        │
│  Does not know:                       │
│  - Where data comes from              │
│  - What business logic                │
│  - Why rendering                      │
└────────────────────────────────────────┘
```

## 🔧 Usage

### Basic Example

```typescript
import { UIRendererService } from '@/infrastructure/services/ui-renderer';
import type { UIDescriptor } from '@/shared/ui';

// Module creates UIDescriptor
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
      // Module UseCase
    }
  }
};

// Service renders
const element = uiRendererService.renderUI(descriptor);
```

### With UIBuilder

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

## 🏗️ Service Components

### UIRendererService
Main service, orchestrator

### UIComponentRegistry
React component registration

### UIStyleBuilder
StyleConfig → CSS transformation

### UIActionHandler
Action handling (onClick, etc.)

## 🧪 Testing

```bash
npm run test -- src/infrastructure/services/ui-renderer
```

## 📝 Note

Service is created, but **NOT used** in modules yet.
There will be gradual migration of modules to use the service.


