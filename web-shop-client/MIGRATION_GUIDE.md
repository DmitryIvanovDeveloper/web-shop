# Migration Guide: UI Renderer Module → Service

Руководство по миграции модулей на использование универсального UI Renderer Service.

## 🎯 Цель миграции

Превратить UI Renderer из **модуля** в **универсальный сервис**, который:
- ✅ НЕ загружает данные сам
- ✅ Принимает UIDescriptor от модулей
- ✅ Возвращает готовый JSX.Element
- ✅ Используется всеми модулями

## 📊 Архитектурное изменение

### До миграции (модуль)
```
UI Renderer Module:
├─ Загружает JSON через HttpClient
├─ Создаёт Value Objects
├─ Рендерит через DynamicRenderer
└─ Владеет данными и логикой
```

### После миграции (сервис)
```
UI Renderer Service (Infrastructure):
├─ Принимает UIDescriptor
├─ Рендерит ComponentNode → JSX
├─ НЕ владеет данными
└─ Универсальный для всех модулей

Модули (Products, Offers, Auth):
├─ Загружают свои данные
├─ Создают UIDescriptor
├─ Передают в сервис
└─ Получают готовый UI
```

## 🔄 Этапы миграции

### Этап 0: Подготовка (✅ ВЫПОЛНЕНО)
- [x] Создан UIRendererService в `infrastructure/services/ui-renderer/`
- [x] Созданы shared типы в `shared/ui/`
- [x] Создан порт UIRendererPort в `application/ports/`
- [x] Написаны тесты для сервиса
- [x] Создан UIBuilder для упрощения создания UI

### Этап 1: Регистрация сервиса в DI (TODO)
```typescript
// src/infrastructure/bootstrap/container.ts

import { UIRendererService } from '../services/ui-renderer';
import { UIComponentRegistry } from '../services/ui-renderer';
import { UIStyleBuilder } from '../services/ui-renderer';
import { UIActionHandler } from '../services/ui-renderer';

// Register UI Renderer Service
container.bind(UIComponentRegistry).toSelf().inSingletonScope();
container.bind(UIStyleBuilder).toSelf().inSingletonScope();
container.bind(UIActionHandler).toSelf().inSingletonScope();
container.bind<UIRendererPort>(TYPES.UIRenderer)
  .to(UIRendererService)
  .inSingletonScope();
```

### Этап 2: Миграция Products Module (TODO)

#### До:
```typescript
// products/interface-adapters/presenters/products-list.presenter.ts

class ProductsListPresenter {
  async loadProducts(): Promise<ProductsViewModel> {
    const result = await this._loadProductsUseCase.execute();
    // Presenter возвращает ViewModel
    return { products: result.data };
  }
}

// products/interface-adapters/ui/products-list.tsx
// React компонент рендерит напрямую
```

#### После:
```typescript
// products/interface-adapters/presenters/products-list.presenter.ts

import type { UIDescriptor } from '../../../shared/ui';
import { GridTemplate } from '../../../shared/ui/builders';

class ProductsListPresenter {
  async loadProducts(): Promise<ProductsViewModel> {
    const result = await this._loadProductsUseCase.execute();
    
    return {
      status: 'success',
      products: result.data
    };
  }

  public createUIDescriptor(products: Product[]): UIDescriptor {
    // Создаём ComponentNode для каждого продукта
    const productCards: ComponentNode[] = products.map(p => ({
      id: p.id.value,
      type: 'OfferCard',
      props: {
        title: p.title,
        currentPrice: p.getFormattedPrice(),
        originalPrice: p.getFormattedOriginalPrice(),
        discount: p.calculateSavingsPercentage()?.toString(),
        isPurchased: p.isPurchased
      },
      actions: {
        onClick: {
          type: 'custom',
          handler: 'handleBuyProduct',
          params: { productId: p.id.value }
        }
      }
    }));

    // Используем GridTemplate
    const grid = GridTemplate.createProductGrid(productCards, 4, 16);

    return {
      layout: {
        id: 'products-container',
        type: 'Container',
        props: { vertical: true },
        styles: { padding: 4 },
        children: [grid]
      },
      theme: this._theme,
      context: {
        handleBuyProduct: (params: { productId: string }) => {
          this._selectProductUseCase.execute({ 
            productId: params.productId 
          });
        }
      }
    };
  }
}

// products/interface-adapters/ui/products-list.tsx
// Использует UIRendererService
export function ProductsList() {
  const [descriptor, setDescriptor] = useState<UIDescriptor | null>(null);
  
  const uiRenderer = container.get<UIRendererPort>(TYPES.UIRenderer);
  const presenter = container.get<ProductsListPresenter>(...);

  useEffect(() => {
    const load = async () => {
      const vm = await presenter.loadProducts();
      if (vm.status === 'success') {
        const desc = presenter.createUIDescriptor(vm.products);
        setDescriptor(desc);
      }
    };
    load();
  }, []);

  return descriptor ? uiRenderer.renderUI(descriptor) : <div>Loading...</div>;
}
```

### Этап 3: Миграция Offers Module (TODO)
Аналогично Products Module

### Этап 4: Миграция Auth Module (TODO)
Аналогично Products Module

### Этап 5: Удаление старого UI Renderer Module (TODO)
После миграции всех модулей удалить:
- `modules/ui-renderer/` (весь модуль)

## 🎨 Паттерны миграции

### Паттерн 1: Создание UIDescriptor в Presenter

```typescript
class ModulePresenter {
  // Бизнес-логика
  async loadData(): Promise<ViewModel> {
    const result = await this._useCase.execute();
    return { data: result.data };
  }

  // UI создание
  public createUIDescriptor(data: Data[]): UIDescriptor {
    const children = data.map(item => this._createItemNode(item));

    return {
      layout: {
        id: 'module-container',
        type: 'Container',
        props: {},
        children
      },
      theme: this._moduleTheme,
      context: this._createActionContext()
    };
  }

  private _createItemNode(item: Data): ComponentNode {
    return {
      id: item.id,
      type: 'OfferCard',
      props: {
        title: item.title,
        price: item.price
      }
    };
  }

  private _createActionContext(): ActionContext {
    return {
      handleItemClick: (itemId: string) => {
        this._itemClickUseCase.execute({ itemId });
      }
    };
  }
}
```

### Паттерн 2: Использование UIBuilder

```typescript
import { UIBuilder } from '@/shared/ui/builders';

class ModulePresenter {
  public createUIDescriptor(): UIDescriptor {
    const builder = new UIBuilder();

    const layout = builder
      .container({ vertical: true })
        .withStyles({ padding: 4, backgroundColor: 'surface' })
        .text({ text: this.labels.title })
          .withStyles({ fontSize: '2xl', fontWeight: 'bold' })
        .grid({ columns: 4, gap: 16 })
      .build();

    return {
      layout,
      theme: this._theme,
      context: this._createActionContext()
    };
  }
}
```

### Паттерн 3: Динамический UI

```typescript
class OffersPresenter {
  public createUIDescriptor(offers: Offer[]): UIDescriptor {
    // Динамически выбираем layout в зависимости от количества
    const layout = offers.length > 3
      ? this._createGridLayout(offers)
      : this._createListLayout(offers);

    return {
      layout,
      theme: this._theme,
      context: this._createActionContext()
    };
  }

  private _createGridLayout(offers: Offer[]): ComponentNode {
    return {
      id: 'offers-grid',
      type: 'Grid',
      props: { columns: 4 },
      children: offers.map(this._createOfferCard)
    };
  }

  private _createListLayout(offers: Offer[]): ComponentNode {
    return {
      id: 'offers-list',
      type: 'Container',
      props: { vertical: true },
      children: offers.map(this._createOfferCard)
    };
  }
}
```

## ✅ Чеклист миграции модуля

### Подготовка
- [ ] Модуль загружает данные через UseCase
- [ ] Presenter трансформирует данные в ViewModel
- [ ] Понятны actions модуля

### Реализация
- [ ] Создан метод `createUIDescriptor()` в Presenter
- [ ] UIDescriptor создаётся из данных модуля
- [ ] ActionContext содержит все обработчики
- [ ] Theme определена для модуля

### View слой
- [ ] React компонент использует UIRendererService
- [ ] Компонент получает UIDescriptor от Presenter
- [ ] Вызывает `uiRenderer.renderUI(descriptor)`

### Тестирование
- [ ] Unit тесты для Presenter.createUIDescriptor()
- [ ] Проверка что UIDescriptor корректно формируется
- [ ] Проверка что actions правильно связаны

### Cleanup
- [ ] Удалены старые View компоненты
- [ ] Удалены прямые рендеринг логика
- [ ] Обновлена документация модуля

## 🚨 Важные замечания

### НЕ делать сразу:
❌ Не мигрировать все модули одновременно
❌ Не удалять старый UI Renderer Module до миграции всех
❌ Не менять публичный API модулей

### Делать поэтапно:
✅ Мигрировать по одному модулю
✅ Тестировать после каждого модуля
✅ Валидировать архитектуру
✅ Обновлять документацию

## 📝 Порядок миграции модулей

1. **Products Module** (самый простой)
2. **Offers Module** (средней сложности)
3. **Auth Module** (сложный, с popup)
4. **Future Modules** (уже используют сервис)

## 🎯 Результат

После полной миграции:
- ✅ UI Renderer = универсальный сервис
- ✅ Каждый модуль сам владеет своими данными
- ✅ Модули создают UIDescriptor
- ✅ Сервис просто рендерит
- ✅ Полная независимость модулей


