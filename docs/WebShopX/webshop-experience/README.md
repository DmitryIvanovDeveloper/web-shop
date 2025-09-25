# Webshop Experience - Пользовательский интерфейс магазина

*Система пользовательского интерфейса игрового магазина с функциями лояльности, контента и персонализации*

---

## 📋 Структура модуля Webshop Experience

### 🎯 Подмодули

| Подмодуль | Описание | Документация |
|-----------|----------|--------------|
| **🎁 Daily Rewards** | Механика ежедневных наград для игроков | [`daily-rewards/daily-rewards.md`](./daily-rewards/daily-rewards.md) |
| **🏆 Loyalty Program** | Программа лояльности с уровнями и баллами | [`loyalty-program/loyalty-program.md`](./loyalty-program/loyalty-program.md) |
| **🎫 Promo Codes** | Промокоды для инфлюенсеров и партнеров | [`promo-codes/promo-codes.md`](./promo-codes/promo-codes.md) |
| **📰 Blog/News** | Блог и новостная секция с контентом | [`blog-news/blog-news.md`](./blog-news/blog-news.md) |
| **🎬 Media Support** | Поддержка видео и медиа блоков | [`media-support/media-support.md`](./media-support/media-support.md) |
| **🎨 Theme Customization** | Кастомизация тем (шрифты, фон, цвета) | [`theme-customization/theme-customization.md`](./theme-customization/theme-customization.md) |
| **🌍 Localization** | Поддержка локализации (i18n, RTL) | [`localization/localization.md`](./localization/localization.md) |
| **🔗 External Links** | Секция внешних ссылок | [`external-links/external-links.md`](./external-links/external-links.md) |
| **📝 Patch Notes** | Патч-ноты и changelog | [`patch-notes/patch-notes.md`](./patch-notes/patch-notes.md) |

## 🔗 Архитектурные связи

### Clean Architecture слои:
```
┌─────────────────────────────────────┐
│  Presentation Layer                 │
│  ├── daily-rewards (UI)             │
│  ├── loyalty-program (UI)           │
│  ├── promo-codes (UI)               │
│  ├── blog-news (UI)                 │
│  ├── media-support (UI)             │
│  ├── theme-customization (UI)       │
│  ├── localization (UI)              │
│  ├── external-links (UI)            │
│  └── patch-notes (UI)               │
├─────────────────────────────────────┤
│  Application Layer                  │
│  ├── daily-rewards (Business Logic) │
│  ├── loyalty-program (Business Logic)│
│  └── promo-codes (Business Logic)   │
├─────────────────────────────────────┤
│  Infrastructure Layer               │
│  ├── blog-news (Content Management) │
│  ├── media-support (File Storage)   │
│  └── localization (Translation)     │
└─────────────────────────────────────┘
```

### Event-Driven Communication:
- **daily-rewards** → **loyalty-program** (начисление баллов)
- **promo-codes** → **campaign-manager** (активация промо)
- **blog-news** → **analytics** (метрики контента)
- **theme-customization** → **ui-builder** (применение тем)

## 🎯 Ключевые особенности

- **🎮 Игровая механика** - ежедневные награды и система лояльности
- **🎨 Гибкая кастомизация** - настройка внешнего вида под бренд
- **🌍 Мультиязычность** - поддержка разных языков и регионов
- **📱 Адаптивность** - автоматическая адаптация под устройства
- **🎬 Медиа контент** - поддержка видео и интерактивных элементов

## 📚 Дополнительная информация

- **Общая архитектура проекта**: [`../ecommerce-architecture.md`](../ecommerce-architecture.md)
- **Принципы разработки**: Clean Architecture + Domain-Driven Design
- **Технологический стек**: Next.js 14, TypeScript, Tailwind CSS, i18next

---

*Документация обновлена: $(Get-Date -Format "dd.MM.yyyy")*
