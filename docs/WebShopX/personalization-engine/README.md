# Personalization Engine - AI-персонализация и автоматизация

*Система AI-персонализации для создания индивидуальных предложений и автоматизации маркетинговых процессов*

---

## 📋 Структура модуля Personalization Engine

### 🎯 Подмодули

| Подмодуль | Описание | Документация |
|-----------|----------|--------------|
| **⚙️ Rule Builder** | Создание правил персонализации с триггерами | [`rule-builder/rule-builder.md`](./rule-builder/rule-builder.md) |
| **👥 Audience Segmentation** | Сегментация аудитории по поведению и характеристикам | [`audience-segmentation/audience-segmentation.md`](./audience-segmentation/audience-segmentation.md) |
| **🛒 Abandoned Cart Offers** | Предложения для брошенных корзин и напоминания | [`abandoned-cart-offers/abandoned-cart-offers.md`](./abandoned-cart-offers/abandoned-cart-offers.md) |
| **🤖 LiveOps Automation** | Автоматизация маркетинговых процессов на основе поведения | [`liveops-automation/liveops-automation.md`](./liveops-automation/liveops-automation.md) |

## 🔗 Архитектурные связи

### Clean Architecture слои:
```
┌─────────────────────────────────────┐
│  Presentation Layer                 │
│  ├── audience-segmentation (UI)     │
│  └── liveops-automation (UI)        │
├─────────────────────────────────────┤
│  Application Layer                  │
│  ├── rule-builder                   │
│  ├── audience-segmentation          │
│  ├── abandoned-cart-offers          │
│  └── liveops-automation             │
├─────────────────────────────────────┤
│  Infrastructure Layer               │
│  ├── audience-segmentation (ML)     │
│  └── data processing                │
└─────────────────────────────────────┘
```

### Event-Driven Communication:
- **rule-builder** → **liveops-automation** (правила активации)
- **audience-segmentation** → **rule-builder** (сегменты игроков)
- **abandoned-cart-offers** → **campaign-manager** (промо события)
- **liveops-automation** → **analytics** (события автоматизации)

## 🎯 Ключевые особенности

- **🤖 AI-персонализация** - умные рекомендации на основе поведения
- **⚙️ Гибкие правила** - создание сложных триггеров и условий
- **👥 Умная сегментация** - автоматическое разделение игроков на группы
- **🛒 Автоматизация** - реакция на действия игроков в реальном времени
- **📊 ML-аналитика** - предсказание поведения и оттока игроков

## 📚 Дополнительная информация

- **Общая архитектура проекта**: [`../ecommerce-architecture.md`](../ecommerce-architecture.md)
- **Принципы разработки**: Clean Architecture + Domain-Driven Design
- **Технологический стек**: Next.js 14, TypeScript, AWS SageMaker, ML Models

---

*Документация обновлена: $(Get-Date -Format "dd.MM.yyyy")*
