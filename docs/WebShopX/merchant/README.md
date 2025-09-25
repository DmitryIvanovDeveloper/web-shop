# Merchant Admin Panel - Документация

Добро пожаловать в документацию модуля **Merchant Admin Panel** - центральной панели управления для мерчантов с возможностями аналитики, управления кампаниями и продуктами.

## 📋 Структура документации

### 🎯 Подмодули

| Подмодуль | Описание | Документация |
|-----------|----------|--------------|
| **📊 Dashboard** | Real-time аналитика и мониторинг | [`dashboard/dashboard.md`](./dashboard/dashboard.md) |
| **🎯 Campaign Manager** | Управление рекламными кампаниями | [`campaign-manager/campaign-manager.md`](./campaign-manager/campaign-manager.md) |
| **🎮 SKU Management** | Управление игровыми предметами | [`sku-management/sku-management.md`](./sku-management/sku-management.md) |
| **📈 Analytics** | Специализированный аналитический сервис | [`analytics/analytics.md`](./analytics/analytics.md) |
| **🎁 Promo/Offer Management** | Управление промо и предложениями | [`promo-offer-management/promo-offer-management.md`](./promo-offer-management/promo-offer-management.md) |
| **🎨 UI Builder** | Конструктор интерфейса магазина | [`ui-builder/ui-builder.md`](./ui-builder/ui-builder.md) |

## 🔗 Архитектурные связи

### Clean Architecture слои:
```
┌─────────────────────────────────────┐
│  Presentation Layer                 │
│  ├── dashboard (UI)                 │
│  └── ui-builder (UI)                │
├─────────────────────────────────────┤
│  Application Layer                  │
│  ├── campaign-manager               │
│  ├── sku-management                 │
│  └── promo-offer-management         │
├─────────────────────────────────────┤
│  Infrastructure Layer               │
│  └── analytics (ML/Data)            │
└─────────────────────────────────────┘
```

### Event-Driven Communication:
- **analytics** → **dashboard** (метрики)
- **campaign-manager** → **analytics** (события кампаний)
- **sku-management** → **analytics** (события товаров)
- **promo-offer-management** → **campaign-manager** (промо события)

## 🎯 Ключевые особенности

- **🎮 Игровая тематика** - все примеры адаптированы под игровую индустрию
- **📊 Real-time аналитика** - мгновенные данные о продажах и конверсии
- **🤖 AI персонализация** - умные рекомендации и автоматизация
- **🎨 Гибкий UI** - конструктор интерфейса с drag & drop
- **📈 Детальная аналитика** - специализированный ML-сервис

## 📚 Дополнительная информация

- **Общая архитектура проекта**: [`../ecommerce-architecture.md`](../ecommerce-architecture.md)
- **Принципы разработки**: Clean Architecture + Domain-Driven Design
- **Технологический стек**: Next.js 14, TypeScript, Tailwind CSS

---

*Документация обновлена: $(Get-Date -Format "dd.MM.yyyy")*
