# Content Management - Управление контентом

*Система управления контентом: блог, новости, медиа для игрового магазина*

---

## 📋 Структура модуля Content Management

### 🎯 Подмодули

| Подмодуль | Описание | Документация |
|-----------|----------|--------------|
| **📰 Blog/News** | Блог и новостная секция с контентом | [`blog-news/blog-news.md`](./blog-news/blog-news.md) |
| **🎬 Media Support** | Поддержка видео и медиа блоков | [`media-support/media-support.md`](./media-support/media-support.md) |

## 🔗 Архитектурные связи

### Clean Architecture слои:
```
┌─────────────────────────────────────┐
│  Presentation Layer                 │
│  ├── blog-news (UI)                 │
│  └── media-support (UI)             │
├─────────────────────────────────────┤
│  Application Layer                  │
│  ├── blog-news (Business Logic)     │
│  └── media-support (Business Logic) │
├─────────────────────────────────────┤
│  Infrastructure Layer               │
│  ├── content-management             │
│  ├── media-streaming                │
│  └── cdn                            │
└─────────────────────────────────────┘
```

### Event-Driven Communication:
- **content-management** → **analytics** (метрики контента)
- **content-management** → **webshop-experience** (отображение контента)
- **content-management** → **localization** (переводы контента)

## 🎯 Ключевые особенности

- **📝 CMS** - система управления контентом
- **🎬 Медиа** - поддержка видео, изображений, аудио
- **📱 Адаптивность** - контент адаптируется под устройства
- **🌍 Локализация** - многоязычный контент
- **📊 Аналитика** - отслеживание популярности контента
- **⚡ CDN** - быстрая доставка медиа контента

## 📚 Дополнительная информация

- **Общая архитектура проекта**: [`../ecommerce-architecture.md`](../ecommerce-architecture.md)
- **Принципы разработки**: Clean Architecture + Domain-Driven Design
- **Технологический стек**: Next.js 14, TypeScript, AWS CloudFront, CDN

---

*Документация обновлена: $(Get-Date -Format "dd.MM.yyyy")*



