# Localization - Локализация

*Система локализации интерфейса и контента для игрового магазина*

---

## 📋 Структура модуля Localization

### 🎯 Подмодули

| Подмодуль | Описание | Документация |
|-----------|----------|--------------|
| **🌍 Localization Support** | Поддержка локализации (i18n, RTL) | [`localization/localization.md`](./localization/localization.md) |

## 🔗 Архитектурные связи

### Clean Architecture слои:
```
┌─────────────────────────────────────┐
│  Presentation Layer                 │
│  ├── localization (UI)              │
├─────────────────────────────────────┤
│  Application Layer                  │
│  ├── translation-service            │
│  └── language-detection             │
├─────────────────────────────────────┤
│  Infrastructure Layer               │
│  ├── translation-api                │
│  └── language-detection-api         │
└─────────────────────────────────────┘
```

### Event-Driven Communication:
- **localization** → **content-management** (переводы контента)
- **localization** → **webshop-experience** (локализация интерфейса)
- **localization** → **ui-builder** (локализация тем)

## 🎯 Ключевые особенности

- **🌍 i18n** - интернационализация интерфейса
- **📖 RTL** - поддержка правосторонних языков
- **🔄 Автоперевод** - автоматический перевод контента
- **🎯 Региональные настройки** - адаптация под регионы
- **⚡ Кэширование** - быстрая загрузка переводов
- **🤖 ML-перевод** - машинный перевод с AI

## 📚 Дополнительная информация

- **Общая архитектура проекта**: [`../ecommerce-architecture.md`](../ecommerce-architecture.md)
- **Принципы разработки**: Clean Architecture + Domain-Driven Design
- **Технологический стек**: Next.js 14, TypeScript, i18next, AWS Translate

---

*Документация обновлена: $(Get-Date -Format "dd.MM.yyyy")*



